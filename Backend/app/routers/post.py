from fastapi import APIRouter, HTTPException, Depends

from app.schemas.post import PostCreate, PostUpdate, PostOut, TrendingTopicOut
from app.schemas.user import UserOut
from app.services import post_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=PostOut)
async def create_post(data: PostCreate, current_user: UserOut = Depends(get_current_user)):
    return await post_service.create_post(current_user.id, current_user.name, data)


@router.get("", response_model=list[PostOut])
async def get_feed(skip: int = 0, limit: int = 20, current_user: UserOut = Depends(get_current_user)):
    return await post_service.get_feed(current_user.id, skip, limit)


@router.get("/trending", response_model=list[TrendingTopicOut])
async def trending_topics(current_user: UserOut = Depends(get_current_user)):
    return await post_service.get_trending_topics()


@router.get("/{post_id}", response_model=PostOut)
async def get_post(post_id: str, current_user: UserOut = Depends(get_current_user)):
    post = await post_service.get_post(post_id, current_user.id)

    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")

    return post


@router.put("/{post_id}", response_model=PostOut)
async def update_post(post_id: str, data: PostUpdate, current_user: UserOut = Depends(get_current_user)):
    try:
        return await post_service.update_post(post_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{post_id}")
async def delete_post(post_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        await post_service.delete_post(post_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like", response_model=PostOut)
async def like_post(post_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        return await post_service.like_post(post_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{post_id}/like", response_model=PostOut)
async def unlike_post(post_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        return await post_service.unlike_post(post_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
