from fastapi import APIRouter, HTTPException, Depends

from app.schemas.friend import FriendRequestOut, FriendOut, RelationshipStatus
from app.schemas.user import UserOut
from app.services import friend_service
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/status/{user_id}", response_model=RelationshipStatus)
async def relationship_status(user_id: str, current_user: UserOut = Depends(get_current_user)):
    return await friend_service.get_relationship_status(current_user.id, user_id)


@router.post("/requests/{to_user_id}", response_model=FriendRequestOut)
async def send_request(to_user_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        return await friend_service.send_request(current_user.id, current_user.name, to_user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/requests", response_model=list[FriendRequestOut])
async def get_pending_requests(current_user: UserOut = Depends(get_current_user)):
    return await friend_service.list_pending_requests(current_user.id)


@router.put("/requests/{request_id}/accept", response_model=FriendRequestOut)
async def accept_request(request_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        return await friend_service.accept_request(request_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/requests/{request_id}")
async def delete_request(request_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        await friend_service.delete_request(request_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"message": "Request removed"}


@router.get("", response_model=list[FriendOut])
async def get_friends(current_user: UserOut = Depends(get_current_user)):
    return await friend_service.list_friends(current_user.id)


@router.get("/discover", response_model=list[UserOut])
async def discover(current_user: UserOut = Depends(get_current_user)):
    return await friend_service.discover_users(current_user.id)
