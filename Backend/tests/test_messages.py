from tests.conftest import signup_and_login


async def test_recent_messages_after_receiving_one(client, auth_headers):
    # regression test: get_recent_messages used `.aggregate()` without awaiting it
    # first, which raised a 500 on every call — this exercises that exact path.
    sender_headers = await signup_and_login(client, email="sender@lhr.nu.edu.pk")
    me = (await client.get("/auth/me", headers=auth_headers)).json()

    send_response = await client.post(f"/messages/{me['id']}", json={"content": "hey!"}, headers=sender_headers)
    assert send_response.status_code == 200

    recent_response = await client.get("/messages/recent", headers=auth_headers)
    assert recent_response.status_code == 200
    recent = recent_response.json()
    assert len(recent) == 1
    assert recent[0]["content"] == "hey!"
    assert recent[0]["from_user_name"] == "Test Student"


async def test_recent_messages_empty_when_none(client, auth_headers):
    response = await client.get("/messages/recent", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []
