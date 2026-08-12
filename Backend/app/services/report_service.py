from datetime import datetime, timedelta, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.report import ReportCreate, ReportOut

TEMP_BAN_DAYS = 7


def _to_report_out(report: dict) -> ReportOut:
    return ReportOut(
        id=str(report["_id"]),
        target_type=report["target_type"],
        target_id=report["target_id"],
        reason=report["reason"],
        reporter_id=report["reporter_id"],
        reporter_name=report["reporter_name"],
        status=report["status"],
        created_at=report["created_at"],
        resolved_action=report.get("resolved_action"),
        proof_author_id=report.get("proof_author_id"),
        proof_author_name=report.get("proof_author_name"),
        proof_content=report.get("proof_content"),
        proof_image_url=report.get("proof_image_url"),
    )


async def _capture_proof(target_type: str, target_id: str) -> dict:
    try:
        object_id = ObjectId(target_id)
    except InvalidId:
        return {}

    if target_type == "post":
        post = await db["posts"].find_one({"_id": object_id})
        if post is None:
            return {}
        return {
            "proof_author_id": post["author_id"],
            "proof_author_name": post["author_name"],
            "proof_content": post["content"],
            "proof_image_url": post.get("image_url"),
        }

    if target_type == "comment":
        comment = await db["comments"].find_one({"_id": object_id})
        if comment is None:
            return {}
        return {
            "proof_author_id": comment["author_id"],
            "proof_author_name": comment["author_name"],
            "proof_content": comment["content"],
        }

    if target_type == "user":
        user = await db["users"].find_one({"_id": object_id})
        if user is None:
            return {}
        return {
            "proof_author_id": str(user["_id"]),
            "proof_author_name": user["name"],
            "proof_content": user.get("bio"),
        }

    return {}


async def create_report(reporter_id: str, reporter_name: str, data: ReportCreate) -> ReportOut:
    report_data = data.model_dump()
    report_data["reporter_id"] = reporter_id
    report_data["reporter_name"] = reporter_name
    report_data["status"] = "pending"
    report_data["created_at"] = datetime.now(timezone.utc)
    report_data.update(await _capture_proof(data.target_type, data.target_id))

    result = await db["reports"].insert_one(report_data)
    report_data["_id"] = result.inserted_id

    return _to_report_out(report_data)


async def list_reports() -> list[ReportOut]:
    cursor = db["reports"].find().sort("created_at", -1)

    reports = []
    async for report in cursor:
        reports.append(_to_report_out(report))

    return reports


def _reported_user_id(report: dict) -> str | None:
    if report["target_type"] == "user":
        return report["target_id"]
    return report.get("proof_author_id")


async def resolve_report(report_id: str, action: str) -> ReportOut:
    try:
        object_id = ObjectId(report_id)
    except InvalidId:
        raise ValueError("Report not found")

    report = await db["reports"].find_one({"_id": object_id})
    if report is None:
        raise ValueError("Report not found")

    if action in ("restrict", "temp_ban"):
        user_id = _reported_user_id(report)
        if user_id is None:
            raise ValueError("Reported content no longer has a traceable user")

        try:
            user_object_id = ObjectId(user_id)
        except InvalidId:
            raise ValueError("Reported user not found")

        if action == "restrict":
            await db["users"].update_one(
                {"_id": user_object_id},
                {"$set": {"status": "restricted"}, "$unset": {"restricted_until": ""}},
            )
        else:
            restricted_until = datetime.now(timezone.utc) + timedelta(days=TEMP_BAN_DAYS)
            await db["users"].update_one(
                {"_id": user_object_id},
                {"$set": {"status": "temp_banned", "restricted_until": restricted_until}},
            )

    await db["reports"].update_one(
        {"_id": object_id},
        {"$set": {"status": "resolved", "resolved_action": action}},
    )

    report = await db["reports"].find_one({"_id": object_id})
    if report is None:
        raise ValueError("Report not found")

    return _to_report_out(report)
