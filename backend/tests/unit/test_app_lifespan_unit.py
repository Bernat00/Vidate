import pytest

import backend.app as app_module


@pytest.mark.asyncio
async def test_lifespan_runs_startup_and_shutdown(monkeypatch):
    calls = []

    async def fake_reset_db_if_needed():
        calls.append("reset")

    async def fake_create_redis():
        calls.append("create_redis")
        return object()

    async def fake_ensure_matchmaking_index(_r):
        calls.append("ensure_index")

    async def fake_close_redis():
        calls.append("close_redis")

    monkeypatch.setattr(app_module, "reset_db_if_needed", fake_reset_db_if_needed)

    import backend.background.matchmaking as matchmaking
    import backend.helpers as helpers

    monkeypatch.setattr(helpers, "create_redis", fake_create_redis)
    monkeypatch.setattr(helpers, "close_redis", fake_close_redis)
    monkeypatch.setattr(matchmaking, "ensure_matchmaking_index", fake_ensure_matchmaking_index)

    async with app_module.lifespan(app_module.app):
        calls.append("running")

    assert calls == ["reset", "create_redis", "ensure_index", "running", "close_redis"]
