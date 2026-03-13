import pytest


@pytest.mark.asyncio
async def test_report_user_requires_conversation(client, user_token, admin_token):
    """User can only report someone they've had a conversation with"""
    token, _ = user_token

    # Try to report a user without conversation
    res = await client.post(
        "/api/users/report",
        json={"reported_user_id": "nonexistent", "reason": "Rude behavior"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_ban_user_admin_only(client, user_token, admin_token):
    token, creds = user_token

    # Get user ID from me endpoint
    me_res = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = me_res.json()["id"]

    # Non-admin cannot ban (401 or 403)
    res = await client.post(
        "/api/users/ban",
        json={"user_id": user_id, "value": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code in [401, 403]

    # Admin can ban
    res = await client.post(
        "/api/users/ban",
        json={"user_id": user_id, "value": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_banned_user_cannot_login(client, admin_token):
    """After banning, user cannot login"""
    # Create user
    creds = {"email": "tobebanned@example.com", "password": "Password1"}
    reg_res = await client.post("/api/auth/register", json=creds)
    assert reg_res.status_code == 201

    # Get user ID and ban them
    token_res = await client.post(
        "/api/auth/token",
        data={"username": creds["email"], "password": creds["password"]},
    )
    user_token = token_res.json()["access_token"]
    me_res = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    user_id = me_res.json()["id"]

    # Ban user
    await client.post(
        "/api/users/ban",
        json={"user_id": user_id, "value": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    # Try to login again
    login_res = await client.post(
        "/api/auth/token",
        data={"username": creds["email"], "password": creds["password"]},
    )
    assert login_res.status_code == 403
    assert "banned" in login_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_admin_cannot_ban_themselves(client, admin_token):
    """Admin cannot ban themselves"""
    me_res = await client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    admin_id = me_res.json()["id"]

    res = await client.post(
        "/api/users/ban",
        json={"user_id": admin_id, "value": True},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 403
    assert "Cannot ban yourself" in res.json()["detail"]


@pytest.mark.asyncio
async def test_get_reports_admin_only(client, user_token, admin_token):
    token, _ = user_token

    # Non-admin cannot get reports
    res = await client.get(
        "/api/users/reports",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code in [401, 403]

    # Admin can get reports
    res = await client.get(
        "/api/users/reports",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_get_reported_summary_admin_only(client, admin_token):
    res = await client.get(
        "/api/users/reported-summary",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    body = res.json()
    assert "items" in body
    assert "total" in body
    assert "page" in body
    assert "limit" in body



