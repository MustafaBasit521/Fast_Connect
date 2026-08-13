from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    course_code: Optional[str] = Field(None, max_length=20)
    file_url: str
    file_type: Literal["PDF", "DOCX", "PPTX", "ZIP", "IMAGE"]
    file_size: int = Field(..., gt=0)


class ResourceOut(BaseModel):
    id: str
    title: str
    course_code: Optional[str] = None
    file_url: str
    file_type: str
    file_size: int
    uploaded_by_id: str
    uploaded_by_name: str
    downloads_count: int
    created_at: datetime
