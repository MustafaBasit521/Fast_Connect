from pydantic import BaseModel, Field
from datetime import datetime


class FeedbackCreate(BaseModel):
    message: str = Field(..., min_length=1)


class FeedbackOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    message: str
    created_at: datetime
