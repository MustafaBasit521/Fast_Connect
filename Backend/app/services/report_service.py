from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.report import ReportCreate, ReportOut


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
    )


async def create_report(reporter_id: str, reporter_name: str, data: ReportCreate) -> ReportOut:
    report_data = data.model_dump()
    report_data["reporter_id"] = reporter_id
    report_data["reporter_name"] = reporter_name
    report_data["status"] = "pending"
    report_data["created_at"] = datetime.now(timezone.utc)

    result = await db["reports"].insert_one(report_data)
    report_data["_id"] = result.inserted_id

    return _to_report_out(report_data)


async def list_reports() -> list[ReportOut]:
    cursor = db["reports"].find().sort("created_at", -1)

    reports = []
    async for report in cursor:
        reports.append(_to_report_out(report))

    return reports


async def resolve_report(report_id: str) -> ReportOut:
    try:
        object_id = ObjectId(report_id)
    except InvalidId:
        raise ValueError("Report not found")

    report = await db["reports"].find_one({"_id": object_id})
    if report is None:
        raise ValueError("Report not found")

    await db["reports"].update_one({"_id": object_id}, {"$set": {"status": "reviewed"}})

    report = await db["reports"].find_one({"_id": object_id})
    if report is None:
        raise ValueError("Report not found")

    return _to_report_out(report)
