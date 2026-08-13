from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)


class ChatResponse(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime
