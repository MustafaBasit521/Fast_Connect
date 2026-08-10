from fastapi import APIRouter, HTTPException, Depends

from app.schemas.message import MessageCreate, MessageOut
from app.schemas.user import UserOut
from app.services import message_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/{to_user_id}", response_model=MessageOut)
async def send_message(to_user_id: str, data: MessageCreate, current_user: UserOut = Depends(get_current_user)):
    try:
        return await message_service.send_message(current_user.id, to_user_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.get("/{other_user_id}", response_model=list[MessageOut])
async def get_conversation(other_user_id: str, current_user: UserOut = Depends(get_current_user)):
    return await message_service.get_conversation(current_user.id, other_user_id)
