from datetime import datetime, timezone
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

import backend.routes.auth as auth


class _UserRepo:
    def __init__(self, user):
        self._user = user

    async def get_by_id(self, _user_id):
        return self._user


class _RoleRepo:
    def __init__(self, role):
        self._role = role

    async def get_by_name(self, _name):
        return self._role


def _make_user(disabled=False, role_id=2):
    return SimpleNamespace(
        id="u1",
        email="u1@example.com",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        disabled=disabled,
        is_onboarded=False,
        role_id=role_id,
    )


@pytest.mark.asyncio
async def test_current_user_checker_returns_user(monkeypatch):
    checker = auth.CurrentUserCheckerDependency()
    user = _make_user()
    repo = SimpleNamespace(user_repo=_UserRepo(user), role_repo=_RoleRepo(None))

    monkeypatch.setattr(auth, "decode_token", lambda _t, _e: auth.TokenData(user_id="u1", type=None))

    resolved = await checker("token", repo)
    assert resolved.id == "u1"


@pytest.mark.asyncio
async def test_current_user_checker_rejects_disabled_user(monkeypatch):
    checker = auth.CurrentUserCheckerDependency()
    user = _make_user(disabled=True)
    repo = SimpleNamespace(user_repo=_UserRepo(user), role_repo=_RoleRepo(None))

    monkeypatch.setattr(auth, "decode_token", lambda _t, _e: auth.TokenData(user_id="u1", type=None))

    with pytest.raises(HTTPException) as exc_info:
        await checker("token", repo)

    assert exc_info.value.status_code == 403


@pytest.mark.asyncio
async def test_current_user_checker_rejects_role_mismatch(monkeypatch):
    checker = auth.CurrentUserCheckerDependency("admin")
    user = _make_user(role_id=2)
    admin_role = SimpleNamespace(id=1, name="admin")
    repo = SimpleNamespace(user_repo=_UserRepo(user), role_repo=_RoleRepo(admin_role))

    monkeypatch.setattr(auth, "decode_token", lambda _t, _e: auth.TokenData(user_id="u1", type=None))

    with pytest.raises(HTTPException) as exc_info:
        await checker("token", repo)

    assert exc_info.value.status_code == 401

