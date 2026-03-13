import pytest


@pytest.mark.asyncio
async def test_profile_put_sets_onboarded(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}

    genders_res = await client.get("/api/profile/genders", headers=headers)
    languages_res = await client.get("/api/profile/languages", headers=headers)
    assert genders_res.status_code == 200
    assert languages_res.status_code == 200

    gender_id = genders_res.json()[0]["id"]
    language_id = languages_res.json()[0]["id"]

    payload = {
        "first_name": "Alex",
        "middle_name": None,
        "last_name": "Tester",
        "birth_date": "1990-01-01T00:00:00Z",
        "gender_id": gender_id,
        "language_ids": [language_id],
        "religion_id": None,
        "is_smoker": False,
        "wants_children": True,
    }

    profile_res = await client.put("/api/profile/mine", json=payload, headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["first_name"] == payload["first_name"]

    me_res = await client.get("/api/users/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["is_onboarded"] is True


@pytest.mark.asyncio
async def test_preferences_put_then_get(client, user_token):
    token, _ = user_token
    headers = {"Authorization": f"Bearer {token}"}

    genders_res = await client.get("/api/profile/genders", headers=headers)
    languages_res = await client.get("/api/profile/languages", headers=headers)
    religions_res = await client.get("/api/profile/religions", headers=headers)

    gender_id = genders_res.json()[0]["id"]
    language_id = languages_res.json()[0]["id"]
    religion_id = religions_res.json()[0]["id"]

    payload = {
        "age_min": 20,
        "age_max": 30,
        "wants_children": True,
        "is_smoker": False,
        "gender_ids": [gender_id],
        "language_ids": [language_id],
        "religion_ids": [religion_id],
    }

    put_res = await client.put("/api/preferences", json=payload, headers=headers)
    assert put_res.status_code == 200

    get_res = await client.get("/api/preferences", headers=headers)
    assert get_res.status_code == 200
    body = get_res.json()
    assert body["age_min"] == payload["age_min"]
    assert body["age_max"] == payload["age_max"]
    assert len(body["genders"]) == 1
    assert len(body["languages"]) == 1
    assert len(body["religions"]) == 1


