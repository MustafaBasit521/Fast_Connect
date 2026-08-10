from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PostCreate(BaseModel):
    content: str = Field(..., min_length=1)
    image_url: Optional[str] = None


class PostUpdate(BaseModel):
    content: Optional[str] = None
    image_url: Optional[str] = None


class PostOut(BaseModel):
    id: str
    author_id: str
    author_name: str
    content: str
    image_url: Optional[str] = None
    likes_count: int
    liked_by_me: bool
    created_at: datetime
