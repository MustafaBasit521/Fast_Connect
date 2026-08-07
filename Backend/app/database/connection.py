import os

from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("fastconnect_app")

client = AsyncMongoClient(MONGO_URI)

db = client["fastconnect_app"]