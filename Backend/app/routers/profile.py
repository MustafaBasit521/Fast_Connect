from fastapi import APIRouter, HTTPException, Depends

from app.schemas.user import UserOut, ProfileUpdate
from app.services import profile_service
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/{user_id}", response_model=UserOut)
async def view_profile(user_id: str):
    profile = await profile_service.get_profile(user_id)

    if profile is None:
        raise HTTPException(status_code=404, detail="User not found")

    return profile


@router.put("/me", response_model=UserOut)
async def update_my_profile(data: ProfileUpdate, current_user: UserOut = Depends(get_current_user)):
    try:
        return await profile_service.update_profile(current_user.email, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/me")
async def delete_my_profile(current_user: UserOut = Depends(get_current_user)):
    await profile_service.delete_profile(current_user.email)
    return {"message": "Account deleted successfully"}