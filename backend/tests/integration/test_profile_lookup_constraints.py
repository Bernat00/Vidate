import pytest


async def _create_profile(client, token: str, first_name: str):
    headers = {"Authorization": f"Bearer {token}"}
    genders = await client.get("/api/profile/genders", headers=headers)
    languages = await client.get("/api/profile/languages", headers=headers)
    religions = await client.get("/api/profile/religions", headers=headers)

    payload = {
        "first_name": first_name,
        "middle_name": None,
        "last_name": "Tester",
        "birth_date": "1990-01-01T00:00:00Z",
        "gender_id": genders.json()[0]["id"],
        "language_ids": [languages.json()[0]["id"]],
        "religion_id": religions.json()[0]["id"],
        "is_smoker": False,
        "wants_children": True,
    }

    res = await client.put("/api/profile/mine", json=payload, headers=headers)
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_delete_gender_in_use_returns_400(client, user_token, admin_token):
    token, _ = user_token
    await _create_profile(client, token, "Alex")

    headers = {"Authorization": f"Bearer {admin_token}"}
    genders = await client.get("/api/profile/genders", headers=headers)
    gender_id = genders.json()[0]["id"]

    delete_res = await client.delete(f"/api/profile/genders?gender_id={gender_id}", headers=headers)
    assert delete_res.status_code == 400
    assert "currently used" in delete_res.json()["detail"]


@pytest.mark.asyncio
async def test_delete_language_in_use_returns_400(client, user_token, admin_token):
    token, _ = user_token
    await _create_profile(client, token, "Jordan")

    headers = {"Authorization": f"Bearer {admin_token}"}
    languages = await client.get("/api/profile/languages", headers=headers)
    language_id = languages.json()[0]["id"]

    delete_res = await client.delete(f"/api/profile/languages?language_id={language_id}", headers=headers)
    assert delete_res.status_code == 400
    assert "currently used" in delete_res.json()["detail"]


@pytest.mark.asyncio
async def test_delete_religion_in_use_returns_400(client, user_token, admin_token):
    token, _ = user_token
    await _create_profile(client, token, "Taylor")

    headers = {"Authorization": f"Bearer {admin_token}"}
    religions = await client.get("/api/profile/religions", headers=headers)
    religion_id = religions.json()[0]["id"]

    delete_res = await client.delete(f"/api/profile/religions?religion_id={religion_id}", headers=headers)
    assert delete_res.status_code == 400
    assert "currently used" in delete_res.json()["detail"]
