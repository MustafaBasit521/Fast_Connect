from fastapi import APIRouter, HTTPException, Depends

from app.schemas.chatbot import ChatRequest, ChatResponse, ChatMessageOut
from app.schemas.user import UserOut
from app.services import chatbot_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(data: ChatRequest, current_user: UserOut = Depends(get_current_user)):
    try:
        return await chatbot_service.send_message(current_user.id, current_user.name, data.message)
    except chatbot_service.AIConfigError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except chatbot_service.AIServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/history", response_model=list[ChatMessageOut])
async def history(current_user: UserOut = Depends(get_current_user)):
    return await chatbot_service.get_history(current_user.id)
