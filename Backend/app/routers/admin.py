from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.user import UserOut
from app.database.connection import db
from app.services import post_service, comment_service, blog_service, profile_service, event_service, resource_service
from app.dependencies import get_current_admin

TEMP_BAN_DAYS = 7

router = APIRouter()


@router.get("/stats")
async def get_stats(admin: UserOut = Depends(get_current_admin)):
    total_users = await db["users"].count_documents({})
    total_posts = await db["posts"].count_documents({})
    restricted = await db["users"].count_documents({"status": "restricted"})

    return {
        "total_users": total_users,
        "total_posts": total_posts,
        "restricted": restricted,
    }


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
            is_private=user.get("is_private", False),
            email_verified=user.get("email_verified", False),
        ))

    return users


@router.put("/users/{user_id}/restrict")
async def restrict_user(user_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db["users"].update_one(
        {"_id": object_id},
        {"$set": {"status": "restricted"}, "$unset": {"restricted_until": ""}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User restricted"}


@router.put("/users/{user_id}/temp-ban")
async def temp_ban_user(user_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="User not found")

    restricted_until = datetime.now(timezone.utc) + timedelta(days=TEMP_BAN_DAYS)
    result = await db["users"].update_one(
        {"_id": object_id},
        {"$set": {"status": "temp_banned", "restricted_until": restricted_until}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": f"User temporarily banned for {TEMP_BAN_DAYS} days"}


@router.put("/users/{user_id}/unrestrict")
async def unrestrict_user(user_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db["users"].update_one(
        {"_id": object_id},
        {"$set": {"status": "active"}, "$unset": {"restricted_until": ""}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User restored to active"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        object_id = ObjectId(user_id)
    except InvalidId:
        raise HTTPException(status_code=404, detail="User not found")

    await profile_service.cascade_delete_user_data(user_id)

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


@router.delete("/events/{event_id}")
async def delete_event(event_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        await event_service.delete_event(event_id, admin.id, is_admin=True)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Event deleted"}


@router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        await resource_service.delete_resource(resource_id, admin.id, is_admin=True)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Resource deleted"}
