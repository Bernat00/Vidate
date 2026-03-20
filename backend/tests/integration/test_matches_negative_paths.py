import pytest


async def _register_and_login(client, email: str, password: str):
    res = await client.post("/api/auth/register", json={"email": email, "password": password})
    assert res.status_code == 201

    token_res = await client.post(
        "/api/auth/token",
        data={"username": email, "password": password},
    )
    assert token_res.status_code == 200
    token = token_res.json()["access_token"]

    me_res = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    return token, me_res.json()["id"]


@pytest.mark.asyncio
async def test_match_user_not_found(client, user_token):
    token, _ = user_token
    res = await client.post(
        "/api/matches/match?userid=does-not-exist",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_match_self_returns_400(client, user_token):
    token, _ = user_token
    me = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    uid = me.json()["id"]

    res = await client.post(
        f"/api/matches/match?userid={uid}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_delete_match_unauthorized_user(client):
    token1, user1_id = await _register_and_login(client, "m1@example.com", "Password1")
    token2, user2_id = await _register_and_login(client, "m2@example.com", "Password1")
    token3, _ = await _register_and_login(client, "outsider2@example.com", "Password1")

    create_res = await client.post(
        f"/api/matches/match?userid={user2_id}",
        headers={"Authorization": f"Bearer {token1}"},
    )
    assert create_res.status_code == 200
    confirm_res = await client.post(
        f"/api/matches/match?userid={user1_id}",
        headers={"Authorization": f"Bearer {token2}"},
    )
    assert confirm_res.status_code == 200

    match_id = confirm_res.json()["id"]
    delete_res = await client.delete(
        f"/api/matches/match?match_id={match_id}",
        headers={"Authorization": f"Bearer {token3}"},
    )
    assert delete_res.status_code == 401


@pytest.mark.asyncio
async def test_feedback_not_liked_returns_ok(client, user_token):
    token, _ = user_token
    res = await client.post(
        "/api/matches/feedback",
        json={"partner_id": "someone", "liked": False},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_get_match_events_not_found(client, user_token):
    token, _ = user_token
    res = await client.get(
        "/api/matches/9999/events",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 404

