from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

from app.database.connection import db
from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router
from app.routers.post import router as post_router
from app.routers.comment import router as comment_router
from app.routers.friend import router as friend_router
from app.routers.message import router as message_router
from app.routers.blog import router as blog_router
from app.routers.report import router as report_router
from app.routers.feedback import router as feedback_router
from app.routers.admin import router as admin_router
from app.routers.upload import router as upload_router
from app.routers.chatbot import router as chatbot_router
from app.services.chatbot_service import ensure_indexes as ensure_chatbot_indexes


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fast-connect-frontend-three.vercel.app",
        "https://fast-connect-admin.vercel.app",  # placeholder — replace with your actual Admin Vercel domain once deployed
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(profile_router, prefix="/profile", tags=["profile"])
app.include_router(post_router, prefix="/posts", tags=["posts"])
app.include_router(comment_router, tags=["comments"])
app.include_router(friend_router, prefix="/friends", tags=["friends"])
app.include_router(message_router, prefix="/messages", tags=["messages"])
app.include_router(blog_router, prefix="/blogs", tags=["blogs"])
app.include_router(report_router, prefix="/reports", tags=["reports"])
app.include_router(feedback_router, prefix="/feedback", tags=["feedback"])
app.include_router(admin_router, prefix="/admin", tags=["admin"])
app.include_router(upload_router, prefix="/uploads", tags=["uploads"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["chatbot"])


@app.on_event("startup")
async def on_startup():
    await ensure_chatbot_indexes()


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
