import asyncio
from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.message import MessageCreate, MessageOut
from app.services.email import send_new_message_email


def _to_message_out(msg: dict) -> MessageOut:
    return MessageOut(
        id=str(msg["_id"]),
        from_user_id=msg["from_user_id"],
        to_user_id=msg["to_user_id"],
        content=msg["content"],
        created_at=msg["created_at"],
    )


async def send_message(from_id: str, from_name: str, to_id: str, data: MessageCreate) -> MessageOut:
    if from_id == to_id:
        raise ValueError("You cannot message yourself")

    try:
        to_user = await db["users"].find_one({"_id": ObjectId(to_id)})
    except InvalidId:
        to_user = None

    if to_user is None:
        raise ValueError("This user's account has been deleted")

    message_data = {
        "from_user_id": from_id,
        "to_user_id": to_id,
        "content": data.content,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db["messages"].insert_one(message_data)
    message_data["_id"] = result.inserted_id

    asyncio.create_task(asyncio.to_thread(send_new_message_email, to_user["email"], to_user["name"], from_name))

    return _to_message_out(message_data)


async def get_conversation(current_user_id: str, other_user_id: str) -> list[MessageOut]:
    cursor = db["messages"].find({
        "$or": [
            {"from_user_id": current_user_id, "to_user_id": other_user_id},
            {"from_user_id": other_user_id, "to_user_id": current_user_id},
        ]
    }).sort("created_at", 1)

    messages = []
    async for msg in cursor:
        messages.append(_to_message_out(msg))

    return messages
