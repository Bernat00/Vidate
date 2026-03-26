from urllib.parse import urlparse, parse_qs

import pytest


@pytest.mark.asyncio
async def test_password_reset_flow(client, monkeypatch):
    email = "reset@example.com"
    password = "Password1"

    register_res = await client.post("/api/auth/register", json={"email": email, "password": password})
    assert register_res.status_code == 201

    captured = {}

    def fake_send_reset_email(to_email: str, reset_link: str):
        captured["to_email"] = to_email
        captured["reset_link"] = reset_link

    import backend.routes.user as user_routes
    monkeypatch.setattr(user_routes, "send_reset_email", fake_send_reset_email)

    res = await client.post("/api/users/send-reset-email", json={"email": email})
    assert res.status_code == 200
    assert captured["to_email"] == email

    parsed = urlparse(captured["reset_link"])
    token = parse_qs(parsed.query)["token"][0]

    reset_res = await client.post(
        f"/api/users/reset-password?token={token}",
        json={"password": "Newpass1"},
    )
    assert reset_res.status_code == 200

    old_login = await client.post(
        "/api/auth/token",
        data={"username": email, "password": password},
    )
    assert old_login.status_code == 401

    new_login = await client.post(
        "/api/auth/token",
        data={"username": email, "password": "Newpass1"},
    )
    assert new_login.status_code == 200

    reuse = await client.post(
        f"/api/users/reset-password?token={token}",
        json={"password": "Another1"},
    )
    assert reuse.status_code == 401

