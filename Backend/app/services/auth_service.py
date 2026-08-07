import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

from app.database.connection import db
from app.schemas.user import UserSignUp, UserLogin, UserOut

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

    result = await db["users"].insert_one(user_data)

    return UserOut(id=str(result.inserted_id), name=user.name, email=user.email)


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

    return UserOut(id=str(existing["_id"]), name=existing["name"], email=existing["email"])

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)

    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

    return token