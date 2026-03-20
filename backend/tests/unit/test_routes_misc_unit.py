from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from backend.routes import preferences as pref_routes
from backend.routes import test as test_routes
from backend.schemas.preference import PreferenceCreate


@pytest.mark.asyncio
async def test_test_route_returns_success():
    res = await test_routes.test(SimpleNamespace())
    assert res == "success"


@pytest.mark.asyncio
async def test_test2_route_saves_chat_event_and_returns_all():
    saved = {"count": 0}

    class _ChatEventRepo:
        async def get_all(self):
            return ["ok"]

    class _Repo:
        def __init__(self):
            self.chat_event_repo = _ChatEventRepo()

        async def save(self, _msg):
            saved["count"] += 1

    repo = _Repo()
    res = await test_routes.test2(repo)

    assert saved["count"] == 1
    assert res == ["ok"]


@pytest.mark.asyncio
async def test_get_preferences_raises_404_when_missing():
    class _PrefRepo:
        async def get_by_id(self, _uid):
            return None

    repo = SimpleNamespace(preference_repo=_PrefRepo())

    with pytest.raises(HTTPException) as exc_info:
        await pref_routes.get_preferences(SimpleNamespace(id="u1"), repo)

    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_preferences_returns_preference_read():
    class _PrefRepo:
        async def get_by_id(self, _uid):
            return SimpleNamespace(
                user_id="u1",
                age_min=20,
                age_max=30,
                wants_children=True,
                is_smoker=False,
                genders=[],
                religions=[],
                languages=[],
                model_dump=lambda: {
                    "user_id": "u1",
                    "age_min": 20,
                    "age_max": 30,
                    "wants_children": True,
                    "is_smoker": False,
                },
            )

    repo = SimpleNamespace(preference_repo=_PrefRepo())
    res = await pref_routes.get_preferences(SimpleNamespace(id="u1"), repo)

    assert res.user_id == "u1"
    assert res.age_min == 20


@pytest.mark.asyncio
async def test_update_preferences_creates_and_populates_relations():
    class _LookupRepo:
        async def get_by_id_list(self, _ids):
            return []

    class _PrefRepo:
        async def get_by_id(self, _uid):
            return None

    class _Repo:
        def __init__(self):
            self.preference_repo = _PrefRepo()
            self.gender_repo = _LookupRepo()
            self.language_repo = _LookupRepo()
            self.religion_repo = _LookupRepo()

        async def save(self, _entity):
            return _entity

    repo = _Repo()

    res = await pref_routes.update_preferences(
        PreferenceCreate(age_min=20, age_max=30, gender_ids=[], language_ids=[], religion_ids=[]),
        repo,
        SimpleNamespace(id="u1"),
    )

    assert res.user_id == "u1"
    assert res.age_min == 20

