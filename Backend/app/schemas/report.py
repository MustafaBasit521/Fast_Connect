from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class ReportCreate(BaseModel):
    target_type: Literal["user", "post", "comment"]
    target_id: str
    reason: str = Field(..., min_length=1)


class ReportOut(BaseModel):
    id: str
    target_type: str
    target_id: str
    reason: str
    reporter_id: str
    reporter_name: str
    status: str
    created_at: datetime
