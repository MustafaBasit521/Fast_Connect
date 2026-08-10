from datetime import datetime, timezone

from app.database.connection import db
from app.schemas.feedback import FeedbackCreate, FeedbackOut


def _to_feedback_out(feedback: dict) -> FeedbackOut:
    return FeedbackOut(
        id=str(feedback["_id"]),
        user_id=feedback["user_id"],
        user_name=feedback["user_name"],
        message=feedback["message"],
        created_at=feedback["created_at"],
    )


async def create_feedback(user_id: str, user_name: str, data: FeedbackCreate) -> FeedbackOut:
    feedback_data = data.model_dump()
    feedback_data["user_id"] = user_id
    feedback_data["user_name"] = user_name
    feedback_data["created_at"] = datetime.now(timezone.utc)

    result = await db["feedback"].insert_one(feedback_data)
    feedback_data["_id"] = result.inserted_id

    return _to_feedback_out(feedback_data)


async def list_feedback() -> list[FeedbackOut]:
    cursor = db["feedback"].find().sort("created_at", -1)

    items = []
    async for feedback in cursor:
        items.append(_to_feedback_out(feedback))

    return items
