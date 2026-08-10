from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.friend import FriendRequestOut, FriendOut


def _to_request_out(req: dict) -> FriendRequestOut:
    return FriendRequestOut(
        id=str(req["_id"]),
        from_user_id=req["from_user_id"],
        from_user_name=req["from_user_name"],
        to_user_id=req["to_user_id"],
        to_user_name=req["to_user_name"],
        status=req["status"],
        created_at=req["created_at"],
    )


async def send_request(from_id: str, from_name: str, to_id: str) -> FriendRequestOut:
    if from_id == to_id:
        raise ValueError("You cannot send a friend request to yourself")

    try:
        to_object_id = ObjectId(to_id)
    except InvalidId:
        raise ValueError("User not found")

    to_user = await db["users"].find_one({"_id": to_object_id})
    if to_user is None:
        raise ValueError("User not found")

    existing = await db["friend_requests"].find_one({
        "$or": [
            {"from_user_id": from_id, "to_user_id": to_id},
            {"from_user_id": to_id, "to_user_id": from_id},
        ]
    })
    if existing:
        raise ValueError("A friend request already exists between you and this user")

    request_data = {
        "from_user_id": from_id,
        "from_user_name": from_name,
        "to_user_id": to_id,
        "to_user_name": to_user["name"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc),
    }

    result = await db["friend_requests"].insert_one(request_data)
    request_data["_id"] = result.inserted_id

    return _to_request_out(request_data)


async def accept_request(request_id: str, current_user_id: str) -> FriendRequestOut:
    try:
        object_id = ObjectId(request_id)
    except InvalidId:
        raise ValueError("Request not found")

    request = await db["friend_requests"].find_one({"_id": object_id})
    if request is None:
        raise ValueError("Request not found")

    if request["to_user_id"] != current_user_id:
        raise PermissionError("You can only accept requests sent to you")

    await db["friend_requests"].update_one({"_id": object_id}, {"$set": {"status": "accepted"}})

    request = await db["friend_requests"].find_one({"_id": object_id})
    return _to_request_out(request)


async def delete_request(request_id: str, current_user_id: str):
    try:
        object_id = ObjectId(request_id)
    except InvalidId:
        raise ValueError("Request not found")

    request = await db["friend_requests"].find_one({"_id": object_id})
    if request is None:
        raise ValueError("Request not found")

    if current_user_id not in (request["from_user_id"], request["to_user_id"]):
        raise PermissionError("You are not part of this request")

    await db["friend_requests"].delete_one({"_id": object_id})


async def list_friends(current_user_id: str) -> list[FriendOut]:
    cursor = db["friend_requests"].find({
        "status": "accepted",
        "$or": [{"from_user_id": current_user_id}, {"to_user_id": current_user_id}],
    })

    friends = []
    async for req in cursor:
        is_sender = req["from_user_id"] == current_user_id
        friend_id = req["to_user_id"] if is_sender else req["from_user_id"]
        friend_name = req["to_user_name"] if is_sender else req["from_user_name"]
        friends.append(FriendOut(request_id=str(req["_id"]), id=friend_id, name=friend_name))

    return friends


async def list_pending_requests(current_user_id: str) -> list[FriendRequestOut]:
    cursor = db["friend_requests"].find({"to_user_id": current_user_id, "status": "pending"})

    requests = []
    async for req in cursor:
        requests.append(_to_request_out(req))

    return requests
