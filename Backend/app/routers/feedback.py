from fastapi import APIRouter, Depends

from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.schemas.user import UserOut
from app.services import feedback_service
from app.dependencies import get_current_user, get_current_admin

router = APIRouter()


@router.post("", response_model=FeedbackOut)
async def create_feedback(data: FeedbackCreate, current_user: UserOut = Depends(get_current_user)):
    return await feedback_service.create_feedback(current_user.id, current_user.name, data)


@router.get("", response_model=list[FeedbackOut])
async def list_feedback(admin: UserOut = Depends(get_current_admin)):
    return await feedback_service.list_feedback()
