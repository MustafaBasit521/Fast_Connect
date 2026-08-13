from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Literal["Tech", "Sports", "Academic", "Social"]
    venue_name: str = Field(..., min_length=1, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: datetime
    end_time: datetime

    @field_validator("end_time")
    @classmethod
    def validate_end_after_start(cls, value, info):
        start_time = info.data.get("start_time")
        if start_time is not None and value <= start_time:
            raise ValueError("end_time must be after start_time")
        return value


class EventOut(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    venue_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: datetime
    end_time: datetime
    organizer_id: str
    organizer_name: str
    created_at: datetime
    going_count: int
    going_by_me: bool
