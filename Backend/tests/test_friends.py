from tests.conftest import signup_and_login


async def test_follow_public_account_auto_accepts(client, auth_headers):
    # accounts default to public (is_private=False), so a follow request should
    # accept immediately rather than sit pending
    other_headers = await signup_and_login(client, email="target@lhr.nu.edu.pk")
    me_response = await client.get("/auth/me", headers=other_headers)
    other_id = me_response.json()["id"]

    response = await client.post(f"/friends/requests/{other_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "accepted"


async def test_private_account_requires_accept(client, auth_headers):
    other_headers = await signup_and_login(client, email="private@lhr.nu.edu.pk")
    await client.put("/profile/me", json={"is_private": True}, headers=other_headers)

    other_id = (await client.get("/auth/me", headers=other_headers)).json()["id"]

    response = await client.post(f"/friends/requests/{other_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "pending"

    # the target now has one pending incoming request
    pending = await client.get("/friends/requests", headers=other_headers)
    assert len(pending.json()) == 1


async def test_unfollow_removes_from_friend_list(client, auth_headers):
    other_headers = await signup_and_login(client, email="unfollow@lhr.nu.edu.pk")
    other_id = (await client.get("/auth/me", headers=other_headers)).json()["id"]

    follow_response = await client.post(f"/friends/requests/{other_id}", headers=auth_headers)
    request_id = follow_response.json()["id"]

    friends_before = await client.get("/friends", headers=auth_headers)
    assert len(friends_before.json()) == 1

    await client.delete(f"/friends/requests/{request_id}", headers=auth_headers)

    friends_after = await client.get("/friends", headers=auth_headers)
    assert len(friends_after.json()) == 0


async def test_cannot_follow_self(client, auth_headers):
    me = (await client.get("/auth/me", headers=auth_headers)).json()
    response = await client.post(f"/friends/requests/{me['id']}", headers=auth_headers)
    assert response.status_code == 400
