from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.user import UserOut
from app.database.connection import db
from app.services import post_service, comment_service, blog_service
from app.dependencies import get_current_admin

router = APIRouter()


@router.get("/users", response_model=list[UserOut])
async def list_users(admin: UserOut = Depends(get_current_admin)):
    cursor = db["users"].find()

    users = []
    async for user in cursor:
        users.append(UserOut(
            id=str(user["_id"]),
            name=user["name"],
            email=user["email"],
            bio=user.get("bio"),
            phone=user.get("phone"),
            role=user.get("role", "user"),
            status=user.get("status", "active"),
        ))

    return users


@router.put("/users/{user_id}/restrict")
async def restrict_user(user_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db["users"].update_one({"_id": object_id}, {"$set": {"status": "restricted"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User restricted"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db["users"].delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted"}


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        await post_service.delete_post(post_id, admin.id, is_admin=True)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Post deleted"}


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        await comment_service.delete_comment(comment_id, admin.id, is_admin=True)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Comment deleted"}


@router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        await blog_service.delete_blog(blog_id, admin.id, is_admin=True)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Blog deleted"}
