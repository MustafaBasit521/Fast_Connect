from fastapi import APIRouter, HTTPException, Depends

from app.schemas.location import LocationCreate, LocationOut
from app.schemas.user import UserOut
from app.services import location_service
from app.dependencies import get_current_user, get_current_admin

router = APIRouter()


@router.get("", response_model=list[LocationOut])
async def list_locations(current_user: UserOut = Depends(get_current_user)):
    return await location_service.list_locations()


@router.post("", response_model=LocationOut)
async def create_location(data: LocationCreate, admin: UserOut = Depends(get_current_admin)):
    return await location_service.create_location(data)


@router.delete("/{location_id}")
async def delete_location(location_id: str, admin: UserOut = Depends(get_current_admin)):
    try:
        await location_service.delete_location(location_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {"message": "Location deleted successfully"}
