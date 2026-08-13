from tests.conftest import signup_and_login


async def test_signup_and_login(client):
    signup_response = await client.post("/auth/signup", json={
        "name": "Test Student",
        "email": "newstudent@lhr.nu.edu.pk",
        "password": "testpass123",
    })
    assert signup_response.status_code == 200
    data = signup_response.json()
    assert data["email"] == "newstudent@lhr.nu.edu.pk"
    assert data["role"] == "user"
    assert data["email_verified"] is False

    login_response = await client.post("/auth/login", json={
        "email": "newstudent@lhr.nu.edu.pk",
        "password": "testpass123",
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()


async def test_signup_rejects_non_campus_email(client):
    response = await client.post("/auth/signup", json={
        "name": "Test Student",
        "email": "test@gmail.com",
        "password": "testpass123",
    })
    assert response.status_code == 422


async def test_signup_duplicate_email_rejected(client):
    await client.post("/auth/signup", json={
        "name": "First",
        "email": "dupe@lhr.nu.edu.pk",
        "password": "testpass123",
    })
    response = await client.post("/auth/signup", json={
        "name": "Second",
        "email": "dupe@lhr.nu.edu.pk",
        "password": "testpass123",
    })
    assert response.status_code == 400


async def test_login_wrong_password(client):
    await client.post("/auth/signup", json={
        "name": "Test Student",
        "email": "wrongpass@lhr.nu.edu.pk",
        "password": "correctpass123",
    })
    response = await client.post("/auth/login", json={
        "email": "wrongpass@lhr.nu.edu.pk",
        "password": "incorrectpass",
    })
    assert response.status_code == 401


async def test_me_requires_auth(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401  # HTTPBearer rejects a missing Authorization header


async def test_me_returns_current_user(client):
    headers = await signup_and_login(client, email="me@lhr.nu.edu.pk")
    response = await client.get("/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "me@lhr.nu.edu.pk"


async def test_signup_rate_limit(client):
    # signup is capped at 5/hour/IP (app/routers/auth.py) — the 6th should 429
    for i in range(5):
        response = await client.post("/auth/signup", json={
            "name": "Test Student",
            "email": f"ratelimit{i}@lhr.nu.edu.pk",
            "password": "testpass123",
        })
        assert response.status_code == 200

    sixth = await client.post("/auth/signup", json={
        "name": "Test Student",
        "email": "ratelimit5@lhr.nu.edu.pk",
        "password": "testpass123",
    })
    assert sixth.status_code == 429
