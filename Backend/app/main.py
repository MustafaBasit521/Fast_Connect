from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import db
from app.routers.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])


@app.get("/")
async def root():
    return {
        "message": "FAST Connect Backend is running!"
    }


@app.get("/test-db")
async def test_database():
    await db.command("ping")

    return {
        "message": "MongoDB Atlas connected successfully!"
    }


# @app.post("/test-user")
# async def create_test_user():
#     users = db["users"]

#     user = {
#         "name": "Test User",
#         "email": "test@fastconnect.com",
#         "role": "user",
#         "created_at": datetime.utcnow()
#     }

#     result = await users.insert_one(user)

#     return {
#         "message": "User inserted successfully",
#         "user_id": str(result.inserted_id)
#     }

# @app.post("/Another-tester")
# async def create_another_test_User():
#     users=db["users"]
#     user={
#         "name":"Another tester",
#         "role":"nothing"
#     }
#     result=await users.insert_one(user)
#     return {
#         "message":"Another tester inserted successfully",
#         "user_id":str(result.inserted_id)
#     }