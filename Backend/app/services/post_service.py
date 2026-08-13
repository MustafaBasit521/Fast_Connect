import re
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.post import PostCreate, PostUpdate, PostOut, TrendingTopicOut

HASHTAG_PATTERN = re.compile(r"#(\w+)")


def _extract_hashtags(content: str) -> list[str]:
    return list({tag.lower() for tag in HASHTAG_PATTERN.findall(content)})


def _to_post_out(post: dict, current_user_id: str) -> PostOut:
    likes = post.get("likes", [])
    return PostOut(
        id=str(post["_id"]),
        author_id=post["author_id"],
        author_name=post["author_name"],
        content=post["content"],
        image_url=post.get("image_url"),
        likes_count=len(likes),
        liked_by_me=current_user_id in likes,
        created_at=post["created_at"],
    )


async def create_post(author_id: str, author_name: str, data: PostCreate) -> PostOut:
    post_data = data.model_dump()
    post_data["author_id"] = author_id
    post_data["author_name"] = author_name
    post_data["likes"] = []
    post_data["hashtags"] = _extract_hashtags(data.content)
    post_data["created_at"] = datetime.now(timezone.utc)

    result = await db["posts"].insert_one(post_data)
    post_data["_id"] = result.inserted_id

    return _to_post_out(post_data, author_id)


async def get_feed(current_user_id: str, skip: int = 0, limit: int = 20, hashtag: str | None = None) -> list[PostOut]:
    query = {}
    if hashtag:
        query["hashtags"] = hashtag.lower().lstrip("#")

    cursor = db["posts"].find(query).sort("created_at", -1).skip(skip).limit(limit)

    posts = []
    async for post in cursor:
        posts.append(_to_post_out(post, current_user_id))

    return posts


async def get_post(post_id: str, current_user_id: str) -> PostOut | None:
    try:
        object_id = ObjectId(post_id)
    except InvalidId:
        return None

    post = await db["posts"].find_one({"_id": object_id})
    if post is None:
        return None

    return _to_post_out(post, current_user_id)


async def update_post(post_id: str, current_user_id: str, data: PostUpdate) -> PostOut:
    try:
        object_id = ObjectId(post_id)
    except InvalidId:
        raise ValueError("Post not found")

    post = await db["posts"].find_one({"_id": object_id})
    if post is None:
        raise ValueError("Post not found")

    if post["author_id"] != current_user_id:
        raise PermissionError("You can only edit your own posts")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db["posts"].update_one({"_id": object_id}, {"$set": update_data})

    post = await db["posts"].find_one({"_id": object_id})
    if post is None:
        raise ValueError("Post not found")

    return _to_post_out(post, current_user_id)


async def delete_post(post_id: str, current_user_id: str, is_admin: bool = False):
    try:
        object_id = ObjectId(post_id)
    except InvalidId:
        raise ValueError("Post not found")

    post = await db["posts"].find_one({"_id": object_id})
    if post is None:
        raise ValueError("Post not found")

    if not is_admin and post["author_id"] != current_user_id:
        raise PermissionError("You can only delete your own posts")

    await db["posts"].delete_one({"_id": object_id})


async def like_post(post_id: str, current_user_id: str) -> PostOut:
    try:
        object_id = ObjectId(post_id)
    except InvalidId:
        raise ValueError("Post not found")

    await db["posts"].update_one({"_id": object_id}, {"$addToSet": {"likes": current_user_id}})

    post = await db["posts"].find_one({"_id": object_id})
    if post is None:
        raise ValueError("Post not found")

    return _to_post_out(post, current_user_id)


async def unlike_post(post_id: str, current_user_id: str) -> PostOut:
    try:
        object_id = ObjectId(post_id)
    except InvalidId:
        raise ValueError("Post not found")

    await db["posts"].update_one({"_id": object_id}, {"$pull": {"likes": current_user_id}})

    post = await db["posts"].find_one({"_id": object_id})
    if post is None:
        raise ValueError("Post not found")

    return _to_post_out(post, current_user_id)


async def get_trending_topics(hours: int = 48, limit: int = 5) -> list[TrendingTopicOut]:
    since = datetime.now(timezone.utc) - timedelta(hours=hours)

    pipeline = [
        {"$match": {"created_at": {"$gte": since}, "hashtags": {"$ne": []}}},
        {"$unwind": "$hashtags"},
        {"$group": {"_id": "$hashtags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": limit},
    ]

    cursor = db["posts"].aggregate(pipeline)
    return [TrendingTopicOut(tag=doc["_id"], count=doc["count"]) async for doc in cursor]
