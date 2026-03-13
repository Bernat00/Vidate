import pytest


@pytest.mark.asyncio
async def test_register_token_and_me(client):
    credentials = {"email": "newuser@example.com", "password": "Password1"}
    register_res = await client.post("/api/auth/register", json=credentials)
    assert register_res.status_code == 201

    token_res = await client.post(
        "/api/auth/token",
        data={"username": credentials["email"], "password": credentials["password"]},
    )
    assert token_res.status_code == 200
    access_token = token_res.json()["access_token"]

    me_res = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert me_res.status_code == 200
    body = me_res.json()
    assert body["email"] == credentials["email"]
    assert body["role_name"] == "user"


