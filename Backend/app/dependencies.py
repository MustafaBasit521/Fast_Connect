from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from app.database.connection import db
from app.schemas.user import UserOut
from app.services.auth_service import SECRET_KEY, JWT_ALGORITHM

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserOut:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    email = payload.get("sub")
    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db["users"].find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    if user.get("status") == "restricted":
        raise HTTPException(status_code=403, detail="Your account has been restricted")

    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        bio=user.get("bio"),
        phone=user.get("phone"),
        role=user.get("role", "user"),
        status=user.get("status", "active"),
    )


async def get_current_admin(current_user: UserOut = Depends(get_current_user)) -> UserOut:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")

    return current_user
