from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime


class ReportCreate(BaseModel):
    target_type: Literal["user", "post", "comment"]
    target_id: str
    reason: str = Field(..., min_length=1)


class ReportResolve(BaseModel):
    action: Literal["dismiss", "restrict", "temp_ban"]


class ReportOut(BaseModel):
    id: str
    target_type: str
    target_id: str
    reason: str
    reporter_id: str
    reporter_name: str
    status: str
    created_at: datetime
    resolved_action: Optional[str] = None
    proof_author_id: Optional[str] = None
    proof_author_name: Optional[str] = None
    proof_content: Optional[str] = None
    proof_image_url: Optional[str] = None
