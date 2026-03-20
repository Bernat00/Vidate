import pytest


@pytest.mark.asyncio
async def test_register_admin_rejects_wrong_token_type(client, user_token, monkeypatch):
    _token, creds = user_token

    # Build a valid one-time password reset token by triggering reset-email flow.
    captured = {}

    def fake_send_reset_email(_to_email: str, reset_link: str):
        captured["link"] = reset_link

    import backend.routes.user as user_routes
    monkeypatch.setattr(user_routes, "send_reset_email", fake_send_reset_email)

    res = await client.post("/api/users/send-reset-email", json={"email": creds["email"]})
    assert res.status_code == 200

    reset_token = captured["link"].split("token=")[1]

    register_res = await client.post(
        f"/api/auth/register-admin?token={reset_token}",
        json={"email": "badadmin@example.com", "password": "Password1"},
    )
    assert register_res.status_code == 401
    assert "Wrong token" in register_res.json()["detail"]


@pytest.mark.asyncio
async def test_register_admin_rejects_malformed_token(client):
    res = await client.post(
        "/api/auth/register-admin?token=not-a-token",
        json={"email": "nope@example.com", "password": "Password1"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_reset_password_rejects_non_reset_token(client, admin_token):
    token_res = await client.get(
        "/api/auth/register-admin-token",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert token_res.status_code == 200
    register_admin_token = token_res.json()

    res = await client.post(
        f"/api/users/reset-password?token={register_admin_token}",
        json={"password": "Newpass1"},
    )
    assert res.status_code == 403
    assert "invalid" in res.json()["detail"].lower()
