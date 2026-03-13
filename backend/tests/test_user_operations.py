import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from backend.persistence.model.conversation import Conversation


async def _register_and_login(client, email: str, password: str):
    register_res = await client.post("/api/auth/register", json={"email": email, "password": password})
    assert register_res.status_code == 201

    token_res = await client.post(
        "/api/auth/token",
        data={"username": email, "password": password},
    )
    assert token_res.status_code == 200
    token = token_res.json()["access_token"]

    me_res = await client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    return token, me_res.json()["id"]


async def _create_profile(client, token: str, first_name: str):
    headers = {"Authorization": f"Bearer {token}"}

    genders_res = await client.get("/api/profile/genders", headers=headers)
    languages_res = await client.get("/api/profile/languages", headers=headers)
    assert genders_res.status_code == 200
    assert languages_res.status_code == 200

    gender_id = genders_res.json()[0]["id"]
    language_id = languages_res.json()[0]["id"]

    payload = {
        "first_name": first_name,
        "middle_name": None,
        "last_name": "Tester",
        "birth_date": "1990-01-01T00:00:00Z",
        "gender_id": gender_id,
        "language_ids": [language_id],
        "religion_id": None,
        "is_smoker": False,
        "wants_children": True,
    }

    res = await client.put("/api/profile/mine", json=payload, headers=headers)
    assert res.status_code == 200


async def _create_conversation_via_match(client, token1: str, token2: str, user2_id: str, user1_id: str):
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    first = await client.post(f"/api/matches/match?userid={user2_id}", headers=headers1)
    assert first.status_code == 200

    second = await client.post(f"/api/matches/match?userid={user1_id}", headers=headers2)
    assert second.status_code == 200


async def _create_conversation_record(persistence, user1_id: str, user2_id: str):
    async with AsyncSession(persistence.engine) as session:
        session.add(Conversation(user1_id=user1_id, user2_id=user2_id))
        await session.commit()


@pytest.mark.asyncio
async def test_report_user_requires_conversation(client, user_token):
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


@pytest.mark.asyncio
async def test_admin_list_all_users(client, admin_token):
    await client.post("/api/auth/register", json={"email": "allusers1@example.com", "password": "Password1"})
    await client.post("/api/auth/register", json={"email": "allusers2@example.com", "password": "Password1"})

    res = await client.get(
        "/api/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200

    emails = {u["email"] for u in res.json()}
    assert "allusers1@example.com" in emails
    assert "allusers2@example.com" in emails


@pytest.mark.asyncio
async def test_admin_get_user_reports(client, admin_token, persistence):
    reporter_token, reporter_id = await _register_and_login(client, "reporter@example.com", "Password1")
    _, reported_id = await _register_and_login(client, "reported@example.com", "Password1")

    await _create_profile(client, reporter_token, "Reporter")
    reported_token = (
        await client.post(
            "/api/auth/token",
            data={"username": "reported@example.com", "password": "Password1"},
        )
    ).json()["access_token"]
    await _create_profile(client, reported_token, "Reported")

    await _create_conversation_via_match(client, reporter_token, reported_token, reported_id, reporter_id)
    await _create_conversation_record(persistence, reporter_id, reported_id)

    report_res = await client.post(
        "/api/users/report",
        json={"reported_user_id": reported_id, "reason": "Harassment"},
        headers={"Authorization": f"Bearer {reporter_token}"},
    )
    assert report_res.status_code == 201

    reports_res = await client.get(
        f"/api/users/reports/{reported_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert reports_res.status_code == 200

    reports = reports_res.json()
    assert len(reports) == 1
    assert reports[0]["reason"] == "Harassment"
    assert reports[0]["reporter_email"] == "reporter@example.com"
