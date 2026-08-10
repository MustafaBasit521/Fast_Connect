from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.database.connection import db
from app.schemas.comment import CommentCreate, CommentUpdate, CommentOut


def _to_comment_out(comment: dict) -> CommentOut:
    return CommentOut(
        id=str(comment["_id"]),
        post_id=comment["post_id"],
        author_id=comment["author_id"],
        author_name=comment["author_name"],
        content=comment["content"],
        created_at=comment["created_at"],
    )


async def create_comment(post_id: str, author_id: str, author_name: str, data: CommentCreate) -> CommentOut:
    try:
        post_object_id = ObjectId(post_id)
    except InvalidId:
        raise ValueError("Post not found")

    post = await db["posts"].find_one({"_id": post_object_id})
    if post is None:
        raise ValueError("Post not found")

    comment_data = {
        "post_id": post_id,
        "author_id": author_id,
        "author_name": author_name,
        "content": data.content,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db["comments"].insert_one(comment_data)
    comment_data["_id"] = result.inserted_id

    return _to_comment_out(comment_data)


async def get_comments_for_post(post_id: str) -> list[CommentOut]:
    cursor = db["comments"].find({"post_id": post_id}).sort("created_at", 1)

    comments = []
    async for comment in cursor:
        comments.append(_to_comment_out(comment))

    return comments


async def update_comment(comment_id: str, current_user_id: str, data: CommentUpdate) -> CommentOut:
    try:
        object_id = ObjectId(comment_id)
    except InvalidId:
        raise ValueError("Comment not found")

    comment = await db["comments"].find_one({"_id": object_id})
    if comment is None:
        raise ValueError("Comment not found")

    if comment["author_id"] != current_user_id:
        raise PermissionError("You can only edit your own comments")

    await db["comments"].update_one({"_id": object_id}, {"$set": {"content": data.content}})

    comment = await db["comments"].find_one({"_id": object_id})
    return _to_comment_out(comment)


async def delete_comment(comment_id: str, current_user_id: str, is_admin: bool = False):
    try:
        object_id = ObjectId(comment_id)
    except InvalidId:
        raise ValueError("Comment not found")

    comment = await db["comments"].find_one({"_id": object_id})
    if comment is None:
        raise ValueError("Comment not found")

    if not is_admin and comment["author_id"] != current_user_id:
        raise PermissionError("You can only delete your own comments")

    await db["comments"].delete_one({"_id": object_id})
