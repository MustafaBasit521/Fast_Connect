async def test_create_and_fetch_post(client, auth_headers):
    response = await client.post("/posts", json={"content": "Excited for #TechFest26!"}, headers=auth_headers)
    assert response.status_code == 200
    post = response.json()
    assert post["content"] == "Excited for #TechFest26!"
    assert post["likes_count"] == 0
    assert post["liked_by_me"] is False

    feed_response = await client.get("/posts", headers=auth_headers)
    assert feed_response.status_code == 200
    assert len(feed_response.json()) == 1


async def test_like_and_unlike_post(client, auth_headers):
    create_response = await client.post("/posts", json={"content": "Hello campus"}, headers=auth_headers)
    post_id = create_response.json()["id"]

    like_response = await client.post(f"/posts/{post_id}/like", headers=auth_headers)
    assert like_response.status_code == 200
    assert like_response.json()["likes_count"] == 1
    assert like_response.json()["liked_by_me"] is True

    unlike_response = await client.delete(f"/posts/{post_id}/like", headers=auth_headers)
    assert unlike_response.json()["likes_count"] == 0


async def test_cannot_delete_someone_elses_post(client, auth_headers):
    from tests.conftest import signup_and_login

    create_response = await client.post("/posts", json={"content": "Owner's post"}, headers=auth_headers)
    post_id = create_response.json()["id"]

    other_headers = await signup_and_login(client, email="other@lhr.nu.edu.pk")
    delete_response = await client.delete(f"/posts/{post_id}", headers=other_headers)
    assert delete_response.status_code == 403


async def test_trending_topics_counts_hashtags(client, auth_headers):
    await client.post("/posts", json={"content": "#TechFest26 is coming"}, headers=auth_headers)
    await client.post("/posts", json={"content": "So hyped for #TechFest26"}, headers=auth_headers)
    await client.post("/posts", json={"content": "no hashtag here"}, headers=auth_headers)

    response = await client.get("/posts/trending", headers=auth_headers)
    assert response.status_code == 200
    topics = response.json()
    assert topics[0]["tag"] == "techfest26"
    assert topics[0]["count"] == 2


async def test_create_post_requires_auth(client):
    response = await client.post("/posts", json={"content": "no token"})
    assert response.status_code == 401
