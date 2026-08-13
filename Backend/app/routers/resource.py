from fastapi import APIRouter, HTTPException, Depends

from app.schemas.resource import ResourceCreate, ResourceOut
from app.schemas.user import UserOut
from app.services import resource_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=ResourceOut)
async def create_resource(data: ResourceCreate, current_user: UserOut = Depends(get_current_user)):
    return await resource_service.create_resource(current_user.id, current_user.name, data)


@router.get("", response_model=list[ResourceOut])
async def list_resources(
    course_code: str | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 20,
    current_user: UserOut = Depends(get_current_user),
):
    return await resource_service.list_resources(course_code, search, skip, limit)


@router.get("/{resource_id}", response_model=ResourceOut)
async def get_resource(resource_id: str, current_user: UserOut = Depends(get_current_user)):
    resource = await resource_service.get_resource(resource_id)

    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")

    return resource


@router.post("/{resource_id}/download", response_model=ResourceOut)
async def download_resource(resource_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        return await resource_service.record_download(resource_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{resource_id}")
async def delete_resource(resource_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        await resource_service.delete_resource(resource_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"message": "Resource deleted successfully"}
