from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BlogCreate(BaseModel):
    title: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class BlogOut(BaseModel):
    id: str
    author_id: str
    author_name: str
    title: str
    content: str
    created_at: datetime
