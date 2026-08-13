import os

# Must happen before any `app.*` import — app/database/connection.py reads this at
# import time. Pointing tests at a separate database (same cluster, different name)
# means test runs can never touch real production data.
os.environ["DATABASE_NAME"] = "fastconnect_app_test"
os.environ["MAIL_ENABLED"] = "false"

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.database.connection import db


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture(autouse=True)
async def clean_test_db():
    yield
    # Wipe every collection after each test so tests never see leftover state
    # from a previous one — this only ever touches fastconnect_app_test.
    for name in await db.list_collection_names():
        await db[name].delete_many({})


async def signup_and_login(client, email="student@lhr.nu.edu.pk", password="testpass123", name="Test Student"):
    await client.post("/auth/signup", json={"name": name, "email": email, "password": password})
    login_response = await client.post("/auth/login", json={"email": email, "password": password})
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def auth_headers(client):
    return await signup_and_login(client)
