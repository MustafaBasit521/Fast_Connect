import os
import uuid

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.schemas.user import UserOut
from app.dependencies import get_current_user

router = APIRouter()


ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024


@router.post("/image")
async def upload_image(file: UploadFile = File(...), current_user: UserOut = Depends(get_current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, GIF, or WEBP images are allowed")

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be smaller than 5MB")

    extension = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid.uuid4().hex}{extension}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    return {"url": f"/media/{filename}"}
