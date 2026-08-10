from datetime import datetime, timezone

from app.database.connection import db
from app.schemas.message import MessageCreate, MessageOut


def _to_message_out(msg: dict) -> MessageOut:
    return MessageOut(
        id=str(msg["_id"]),
        from_user_id=msg["from_user_id"],
        to_user_id=msg["to_user_id"],
        content=msg["content"],
        created_at=msg["created_at"],
    )


async def _are_friends(user_a: str, user_b: str) -> bool:
    existing = await db["friend_requests"].find_one({
        "status": "accepted",
        "$or": [
            {"from_user_id": user_a, "to_user_id": user_b},
            {"from_user_id": user_b, "to_user_id": user_a},
        ],
    })
    return existing is not None


async def send_message(from_id: str, to_id: str, data: MessageCreate) -> MessageOut:
    if from_id == to_id:
        raise ValueError("You cannot message yourself")

    if not await _are_friends(from_id, to_id):
        raise PermissionError("You can only message your friends")

    message_data = {
        "from_user_id": from_id,
        "to_user_id": to_id,
        "content": data.content,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db["messages"].insert_one(message_data)
    message_data["_id"] = result.inserted_id

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
