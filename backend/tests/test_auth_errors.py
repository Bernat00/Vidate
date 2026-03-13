import pytest


@pytest.mark.asyncio
async def test_invalid_credentials(client):
    res = await client.post(
        "/api/auth/token",
        data={"username": "nonexistent@example.com", "password": "wrong"},
    )
    assert res.status_code == 401
    assert "Invalid credentials" in res.json()["detail"]


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    credentials = {"email": "dup@example.com", "password": "Password1"}

    res1 = await client.post("/api/auth/register", json=credentials)
    assert res1.status_code == 201

    res2 = await client.post("/api/auth/register", json=credentials)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_register_invalid_password(client):
    invalid_creds = [
        {"email": "test@example.com", "password": "short"},  # too short, no uppercase/digit
        {"email": "test@example.com", "password": "nouppercase1"},  # no uppercase
        {"email": "test@example.com", "password": "NOLOWERCASE1"},  # no lowercase
        {"email": "test@example.com", "password": "NoDigit"},  # no digit
    ]

    for creds in invalid_creds:
        res = await client.post("/api/auth/register", json=creds)
        assert res.status_code == 422  # validation error


@pytest.mark.asyncio
async def test_get_me_without_auth(client):
    res = await client.get("/api/users/me")
    assert res.status_code == 401

