from fastapi import APIRouter, HTTPException, Depends

from app.schemas.blog import BlogCreate, BlogUpdate, BlogOut
from app.schemas.user import UserOut
from app.services import blog_service
from app.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=BlogOut)
async def create_blog(data: BlogCreate, current_user: UserOut = Depends(get_current_user)):
    return await blog_service.create_blog(current_user.id, current_user.name, data)


@router.get("", response_model=list[BlogOut])
async def get_blogs(skip: int = 0, limit: int = 20, current_user: UserOut = Depends(get_current_user)):
    return await blog_service.get_blogs(skip, limit)


@router.get("/{blog_id}", response_model=BlogOut)
async def get_blog(blog_id: str, current_user: UserOut = Depends(get_current_user)):
    blog = await blog_service.get_blog(blog_id)

    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")

    return blog


@router.put("/{blog_id}", response_model=BlogOut)
async def update_blog(blog_id: str, data: BlogUpdate, current_user: UserOut = Depends(get_current_user)):
    try:
        return await blog_service.update_blog(blog_id, current_user.id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.delete("/{blog_id}")
async def delete_blog(blog_id: str, current_user: UserOut = Depends(get_current_user)):
    try:
        await blog_service.delete_blog(blog_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

    return {"message": "Blog deleted successfully"}
