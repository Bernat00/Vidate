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


@pytest.mark.asyncio
async def test_register_admin_with_one_time_token(client, admin_token):
    token_res = await client.get(
        "/api/auth/register-admin-token",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert token_res.status_code == 200
    one_time_token = token_res.json()
    assert isinstance(one_time_token, str)

    admin_creds = {"email": "newadmin@example.com", "password": "Password1"}
    register_res = await client.post(
        f"/api/auth/register-admin?token={one_time_token}",
        json=admin_creds,
    )
    assert register_res.status_code == 201

    login_res = await client.post(
        "/api/auth/token",
        data={"username": admin_creds["email"], "password": admin_creds["password"]},
    )
    assert login_res.status_code == 200
    new_admin_token = login_res.json()["access_token"]

    me_res = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {new_admin_token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["role_name"] == "admin"

    reuse_res = await client.post(
        f"/api/auth/register-admin?token={one_time_token}",
        json={"email": "anotheradmin@example.com", "password": "Password1"},
    )
    assert reuse_res.status_code == 401
