import os

import cloudinary
import cloudinary.uploader

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.schemas.user import UserOut
from app.dependencies import get_current_user


router = APIRouter()


# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


ALLOWED_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
}

MAX_SIZE = 5 * 1024 * 1024


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: UserOut = Depends(get_current_user)
):

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, GIF, or WEBP images are allowed"
        )

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 5MB"
        )

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="fast_connect"
        )

        return {
            "url": result["secure_url"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Image upload failed"
        )
