import os
import asyncio
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from app.database.connection import db
from app.schemas.user import UserSignUp, UserLogin, UserOut,ChangePassword
from app.services.email import send_welcome_email, send_password_reset_email

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

async def create_user(user: UserSignUp):
    existing = await db["users"].find_one({"email": user.email})

    if existing:
        raise ValueError("User already exists!")

    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    user_data = user.model_dump()
    user_data["password"] = hashed_password.decode("utf-8")
    user_data["role"] = "user"
    user_data["status"] = "active"
    user_data["is_private"] = False

    result = await db["users"].insert_one(user_data)

    asyncio.create_task(asyncio.to_thread(send_welcome_email, user.name, user.email))

    return UserOut(
        id=str(result.inserted_id),
        name=user.name,
        email=user.email,
        bio=user.bio,
        phone=user.phone,
        role="user",
        status="active",
        is_private=False,
    )


async def authenticate_user(credentials: UserLogin):
    existing = await db["users"].find_one({"email": credentials.email})

    if not existing:
        return None

    password_matches = bcrypt.checkpw(
        credentials.password.encode("utf-8"),
        existing["password"].encode("utf-8"),
    )

    if not password_matches:
        return None

    if existing.get("status") == "restricted":
        raise ValueError("Your account has been restricted")

    status = existing.get("status", "active")

    if status == "temp_banned":
        restricted_until = existing.get("restricted_until")
        if restricted_until and restricted_until.tzinfo is not None:
            restricted_until = restricted_until.astimezone(timezone.utc).replace(tzinfo=None)

        if restricted_until and datetime.utcnow() < restricted_until:
            raise ValueError(f"Your account is temporarily banned until {restricted_until.isoformat()} UTC")

        await db["users"].update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": "active"}, "$unset": {"restricted_until": ""}},
        )
        status = "active"

    return UserOut(
        id=str(existing["_id"]),
        name=existing["name"],
        email=existing["email"],
        bio=existing.get("bio"),
        phone=existing.get("phone"),
        role=existing.get("role", "user"),
        status=status,
        is_private=existing.get("is_private", False),
    )

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)

    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

    return token

async def change_password(email: str, data: ChangePassword):
    existing = await db["users"].find_one({"email": email})

    if not existing:
        raise ValueError("User Not Found")

    if not bcrypt.checkpw(data.old_password.encode("utf-8"), existing["password"].encode("utf-8")):
        raise ValueError("Old password is incorrect")

    new_hashed_password = bcrypt.hashpw(data.new_password.encode("utf-8"), bcrypt.gensalt())

    await db["users"].update_one(
        {"email": email},
        {"$set": {"password": new_hashed_password.decode("utf-8")}},
    )


def create_reset_token(email: str) -> str:
    payload = {"sub": email, "purpose": "password_reset"}
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=15)
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


async def forgot_password(email: str):
    existing = await db["users"].find_one({"email": email})

    if not existing:
        raise ValueError("User Not Found!")

    token = create_reset_token(email)

    asyncio.create_task(asyncio.to_thread(send_password_reset_email, email, existing["name"], token))

    return token

async def reset_password(token: str, new_password: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise ValueError("Reset link expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid reset link")

    if payload.get("purpose") != "password_reset":
        raise ValueError("Invalid reset token")

    email = payload.get("sub")

    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    await db["users"].update_one(
        {"email": email},
        {"$set": {"password": hashed_password.decode("utf-8")}},
    )