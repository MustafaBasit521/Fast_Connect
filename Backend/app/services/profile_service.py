from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.user import UserOut, ProfileUpdate


def _to_user_out(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        bio=user.get("bio"),
        phone=user.get("phone"),
        role=user.get("role", "user"),
        status=user.get("status", "active"),
        is_private=user.get("is_private", False),
    )


async def get_profile(user_id: str) -> UserOut | None:
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        return None

    user = await db["users"].find_one({"_id": object_id})
    if user is None:
        return None

    return _to_user_out(user)


async def update_profile(email: str, data: ProfileUpdate) -> UserOut:
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}

    if update_data:
        await db["users"].update_one({"email": email}, {"$set": update_data})

    user = await db["users"].find_one({"email": email})
    if user is None:
        raise ValueError("User not found")

    return _to_user_out(user)


async def cascade_delete_user_data(user_id: str):
    await db["posts"].delete_many({"author_id": user_id})
    await db["comments"].delete_many({"author_id": user_id})
    await db["posts"].update_many({}, {"$pull": {"likes": user_id}})
    await db["friend_requests"].delete_many({
        "status": "pending",
        "$or": [{"from_user_id": user_id}, {"to_user_id": user_id}],
    })


async def delete_profile(email: str):
    user = await db["users"].find_one({"email": email})
    if user is None:
        raise ValueError("User not found")

    user_id = str(user["_id"])

    await cascade_delete_user_data(user_id)
    await db["users"].delete_one({"_id": user["_id"]})

async def search_users(query: str, current_user_id: str) -> list[UserOut]:
    cursor = db["users"].find({
        "name": {"$regex": query, "$options": "i"},
        "_id": {"$ne": ObjectId(current_user_id)},
    })

    users = []
    async for user in cursor:
        users.append(_to_user_out(user))

    return users


