import pytest


@pytest.mark.asyncio
async def test_update_me_email_and_password(client, user_token):
    token, credentials = user_token
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "email": "updated@example.com",
        "password": "Newpass1",
        "old_password": credentials["password"],
    }

    res = await client.patch("/api/users/me", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == payload["email"]

    token_res = await client.post(
        "/api/auth/token",
        data={"username": payload["email"], "password": payload["password"]},
    )
    assert token_res.status_code == 200


@pytest.mark.asyncio
async def test_admin_can_list_reports(client, admin_token):
    res = await client.get(
        "/api/users/reports",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)

