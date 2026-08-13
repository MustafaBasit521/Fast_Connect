from pydantic import BaseModel, Field
from typing import Optional, Literal


class LocationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: Literal["Academic", "Facility", "Recreation", "Admin"]
    latitude: float
    longitude: float
    description: Optional[str] = Field(None, max_length=500)


class LocationOut(BaseModel):
    id: str
    name: str
    category: str
    latitude: float
    longitude: float
    description: Optional[str] = None
