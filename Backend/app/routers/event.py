from fastapi import APIRouter, HTTPException, Depends

from app.schemas.event import EventCreate, EventOut
from app.schemas.user import UserOut
from app.services import event_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=EventOut)
async def create_event(data: EventCreate, current_user: UserOut = Depends(get_current_user)):
    return await event_service.create_event(current_user.id, current_user.name, data)


@router.get("", response_model=list[EventOut])
async def list_events(
    category: str | None = None,
    skip: int = 0,
    limit: int = 20,
    current_user: UserOut = Depends(get_current_user),
):
    return await event_service.list_upcoming_events(current_user.id, category, skip, limit)


@router.get("/{event_id}", response_model=EventOut)
async def get_event(event_id: str, current_user: UserOut = Depends(get_current_user)):
    event = await event_service.get_event(event_id, current_user.id)

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return event


@router.post("/{event_id}/going", response_model=EventOut)
async def toggle_going(event_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        return await event_service.toggle_going(event_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        await event_service.delete_event(event_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"message": "Event deleted successfully"}
