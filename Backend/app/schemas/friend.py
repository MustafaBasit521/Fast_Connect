from pydantic import BaseModel
from datetime import datetime


class FriendRequestOut(BaseModel):
    id: str
    from_user_id: str
    from_user_name: str
    to_user_id: str
    to_user_name: str
    status: str
    created_at: datetime


class FriendOut(BaseModel):
    request_id: str
    id: str
    name: str
    deleted: bool = False
