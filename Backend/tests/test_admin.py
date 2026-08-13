from bson import ObjectId

from app.database.connection import db


async def test_non_admin_blocked_from_admin_routes(client, auth_headers):
    response = await client.get("/admin/stats", headers=auth_headers)
    assert response.status_code == 403


async def test_admin_can_access_stats(client, auth_headers):
    me = (await client.get("/auth/me", headers=auth_headers)).json()
    await db["users"].update_one({"_id": ObjectId(me["id"])}, {"$set": {"role": "admin"}})

    response = await client.get("/admin/stats", headers=auth_headers)
    assert response.status_code == 200
    assert "total_users" in response.json()


async def test_admin_can_restrict_user(client, auth_headers):
    from tests.conftest import signup_and_login

    target_headers = await signup_and_login(client, email="restrictme@lhr.nu.edu.pk")
    target_id = (await client.get("/auth/me", headers=target_headers)).json()["id"]

    me = (await client.get("/auth/me", headers=auth_headers)).json()
    await db["users"].update_one({"_id": ObjectId(me["id"])}, {"$set": {"role": "admin"}})

    response = await client.put(f"/admin/users/{target_id}/restrict", headers=auth_headers)
    assert response.status_code == 200

    # a restricted user should be rejected on their next authenticated request
    blocked = await client.get("/auth/me", headers=target_headers)
    assert blocked.status_code == 403
