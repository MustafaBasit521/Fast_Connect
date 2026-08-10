from fastapi import APIRouter, HTTPException, Depends

from app.schemas.comment import CommentCreate, CommentUpdate, CommentOut
from app.schemas.user import UserOut
from app.services import comment_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/posts/{post_id}/comments", response_model=CommentOut)
async def create_comment(post_id: str, data: CommentCreate, current_user: UserOut = Depends(get_current_user)):
    try:
        return await comment_service.create_comment(post_id, current_user.id, current_user.name, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/posts/{post_id}/comments", response_model=list[CommentOut])
async def get_comments(post_id: str, current_user: UserOut = Depends(get_current_user)):
    return await comment_service.get_comments_for_post(post_id)


@router.put("/comments/{comment_id}", response_model=CommentOut)
async def update_comment(comment_id: str, data: CommentUpdate, current_user: UserOut = Depends(get_current_user)):
    try:
        return await comment_service.update_comment(comment_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        await comment_service.delete_comment(comment_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"message": "Comment deleted successfully"}
