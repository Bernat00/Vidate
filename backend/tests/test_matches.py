import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from backend.persistence.model.conversation import Conversation


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
    user_id = me_res.json()["id"]

    return token, user_id


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
    return res.json()


async def _create_conversation_via_match(client, token1: str, token2: str, user2_id: str, user1_id: str):
    """Create a conversation by having both users match each other (which creates a conversation)."""
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 1 initiates match with User 2
    await client.post(f"/api/matches/match?userid={user2_id}", headers=headers1)

    # User 2 initiates match with User 1 (confirms the match and creates conversation)
    await client.post(f"/api/matches/match?userid={user1_id}", headers=headers2)


async def _create_conversation_record(persistence, user1_id: str, user2_id: str):
    async with AsyncSession(persistence.engine) as session:
        session.add(Conversation(user1_id=user1_id, user2_id=user2_id))
        await session.commit()


@pytest.mark.asyncio
async def test_match_create_list_and_delete(client):
    token1, user1_id = await _register_and_login(client, "match1@example.com", "Password1")
    token2, user2_id = await _register_and_login(client, "match2@example.com", "Password1")

    await _create_profile(client, token1, "Alex")
    await _create_profile(client, token2, "Taylor")

    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    res = await client.post(f"/api/matches/match?userid={user2_id}", headers=headers1)
    assert res.status_code == 200
    assert res.json()["confirmed"] is False

    res = await client.post(f"/api/matches/match?userid={user1_id}", headers=headers2)
    assert res.status_code == 200
    body = res.json()
    assert body["confirmed"] is True
    match_id = body["id"]

    mine_res = await client.get("/api/matches/mine", headers=headers1)
    assert mine_res.status_code == 200
    mine_body = mine_res.json()
    assert len(mine_body) == 1
    assert mine_body[0]["match_id"] == match_id
    assert mine_body[0]["profile"]["user_id"] == user2_id

    delete_res = await client.delete(f"/api/matches/match?match_id={match_id}", headers=headers1)
    assert delete_res.status_code == 200

    mine_after = await client.get("/api/matches/mine", headers=headers1)
    assert mine_after.status_code == 200
    assert mine_after.json() == []


@pytest.mark.asyncio
async def test_match_feedback_flow(client, persistence):
    token1, user1_id = await _register_and_login(client, "feedback1@example.com", "Password1")
    token2, user2_id = await _register_and_login(client, "feedback2@example.com", "Password1")

    await _create_profile(client, token1, "Sam")
    await _create_profile(client, token2, "Jordan")

    # Keep a confirmed match for realistic state.
    await _create_conversation_via_match(client, token1, token2, user2_id, user1_id)
    # Feedback endpoint requires an explicit conversation record.
    await _create_conversation_record(persistence, user1_id, user2_id)

    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    res = await client.post(
        "/api/matches/feedback",
        json={"partner_id": user2_id, "liked": True},
        headers=headers1,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "already_matched"

    res = await client.post(
        "/api/matches/feedback",
        json={"partner_id": user1_id, "liked": True},
        headers=headers2,
    )
    assert res.status_code == 200
    assert res.json()["status"] == "already_matched"


@pytest.mark.asyncio
async def test_match_profile_events_and_feedback_profile(client, persistence):
    token1, user1_id = await _register_and_login(client, "readmatch1@example.com", "Password1")
    token2, user2_id = await _register_and_login(client, "readmatch2@example.com", "Password1")
    token3, _ = await _register_and_login(client, "outsider@example.com", "Password1")

    await _create_profile(client, token1, "Robin")
    partner_profile = await _create_profile(client, token2, "Casey")

    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}
    headers3 = {"Authorization": f"Bearer {token3}"}

    await client.post(f"/api/matches/match?userid={user2_id}", headers=headers1)
    confirm_res = await client.post(f"/api/matches/match?userid={user1_id}", headers=headers2)
    assert confirm_res.status_code == 200
    match_id = confirm_res.json()["id"]

    profile_res = await client.get(f"/api/matches/match-profile/{user2_id}", headers=headers1)
    assert profile_res.status_code == 200
    assert profile_res.json()["match_id"] == match_id
    assert profile_res.json()["profile"]["user_id"] == user2_id

    events_res = await client.get(f"/api/matches/{match_id}/events", headers=headers1)
    assert events_res.status_code == 200
    assert isinstance(events_res.json(), list)

    outsider_events = await client.get(f"/api/matches/{match_id}/events", headers=headers3)
    assert outsider_events.status_code == 403

    await _create_conversation_record(persistence, user1_id, user2_id)

    feedback_profile_res = await client.get(f"/api/matches/feedback-profile/{user2_id}", headers=headers1)
    assert feedback_profile_res.status_code == 200
    assert feedback_profile_res.json()["user_id"] == partner_profile["user_id"]

    feedback_profile_without_conversation = await client.get(
        f"/api/matches/feedback-profile/{user2_id}",
        headers=headers3,
    )
    assert feedback_profile_without_conversation.status_code == 400
