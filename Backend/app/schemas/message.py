from pydantic import BaseModel, Field
from datetime import datetime


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class MessageOut(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    content: str
    created_at: datetime


class RecentMessageOut(BaseModel):
    from_user_id: str
    from_user_name: str
    content: str
    created_at: datetime
