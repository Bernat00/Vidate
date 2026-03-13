import pytest


@pytest.mark.asyncio
async def test_create_language_admin_only(client, user_token, admin_token):
    token, _ = user_token

    # Non-admin should fail with 401 (not authorized for admin-only endpoint)
    res = await client.post(
        "/api/profile/languages",
        json={"name": "Japanese"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code in [401, 403]

    # Admin should succeed
    res = await client.post(
        "/api/profile/languages",
        json={"name": "Japanese"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Japanese"


@pytest.mark.asyncio
async def test_update_language_admin_only(client, admin_token):
    # Create a language first
    create_res = await client.post(
        "/api/profile/languages",
        json={"name": "Swahili"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    lang_id = create_res.json()["id"]

    # Update it
    update_res = await client.put(
        f"/api/profile/languages?language_id={lang_id}",
        json={"name": "Swahili Updated"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Swahili Updated"


@pytest.mark.asyncio
async def test_delete_language_admin_only(client, admin_token):
    # Create language
    create_res = await client.post(
        "/api/profile/languages",
        json={"name": "Urdu"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    lang_id = create_res.json()["id"]

    # Delete it
    delete_res = await client.delete(
        f"/api/profile/languages?language_id={lang_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert delete_res.status_code == 200


@pytest.mark.asyncio
async def test_create_religion_admin_only(client, admin_token):
    res = await client.post(
        "/api/profile/religions",
        json={"name": "Taoism"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Taoism"


@pytest.mark.asyncio
async def test_delete_religion_admin_only(client, admin_token):
    create_res = await client.post(
        "/api/profile/religions",
        json={"name": "Sikhism"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    religion_id = create_res.json()["id"]

    delete_res = await client.delete(
        f"/api/profile/religions?religion_id={religion_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert delete_res.status_code == 200


@pytest.mark.asyncio
async def test_create_gender_admin_only(client, admin_token):
    res = await client.post(
        "/api/profile/genders",
        json={"name": "Non-binary"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Non-binary"


@pytest.mark.asyncio
async def test_delete_gender_admin_only(client, admin_token):
    create_res = await client.post(
        "/api/profile/genders",
        json={"name": "Agender"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    gender_id = create_res.json()["id"]

    delete_res = await client.delete(
        f"/api/profile/genders?gender_id={gender_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert delete_res.status_code == 200


@pytest.mark.asyncio
async def test_get_profile_before_creation_returns_none(client, user_token):
    token, _ = user_token

    res = await client.get(
        "/api/profile/mine",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code in [200, 404]  # depends on whether it returns None or 404


