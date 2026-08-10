from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.blog import BlogCreate, BlogUpdate, BlogOut


def _to_blog_out(blog: dict) -> BlogOut:
    return BlogOut(
        id=str(blog["_id"]),
        author_id=blog["author_id"],
        author_name=blog["author_name"],
        title=blog["title"],
        content=blog["content"],
        created_at=blog["created_at"],
    )


async def create_blog(author_id: str, author_name: str, data: BlogCreate) -> BlogOut:
    blog_data = data.model_dump()
    blog_data["author_id"] = author_id
    blog_data["author_name"] = author_name
    blog_data["created_at"] = datetime.now(timezone.utc)

    result = await db["blogs"].insert_one(blog_data)
    blog_data["_id"] = result.inserted_id

    return _to_blog_out(blog_data)


async def get_blogs(skip: int = 0, limit: int = 20) -> list[BlogOut]:
    cursor = db["blogs"].find().sort("created_at", -1).skip(skip).limit(limit)

    blogs = []
    async for blog in cursor:
        blogs.append(_to_blog_out(blog))

    return blogs


async def get_blog(blog_id: str) -> BlogOut | None:
    try:
        object_id = ObjectId(blog_id)
    except InvalidId:
        return None

    blog = await db["blogs"].find_one({"_id": object_id})
    if blog is None:
        return None

    return _to_blog_out(blog)


async def update_blog(blog_id: str, current_user_id: str, data: BlogUpdate) -> BlogOut:
    try:
        object_id = ObjectId(blog_id)
    except InvalidId:
        raise ValueError("Blog not found")

    blog = await db["blogs"].find_one({"_id": object_id})
    if blog is None:
        raise ValueError("Blog not found")

    if blog["author_id"] != current_user_id:
        raise PermissionError("You can only edit your own blogs")

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db["blogs"].update_one({"_id": object_id}, {"$set": update_data})

    blog = await db["blogs"].find_one({"_id": object_id})
    if blog is None:
        raise ValueError("Blog not found")

    return _to_blog_out(blog)


async def delete_blog(blog_id: str, current_user_id: str, is_admin: bool = False):
    try:
        object_id = ObjectId(blog_id)
    except InvalidId:
        raise ValueError("Blog not found")

    blog = await db["blogs"].find_one({"_id": object_id})
    if blog is None:
        raise ValueError("Blog not found")

    if not is_admin and blog["author_id"] != current_user_id:
        raise PermissionError("You can only delete your own blogs")

    await db["blogs"].delete_one({"_id": object_id})
