import importlib

import pytest
from fastapi import HTTPException

import backend.helpers as helpers
import backend.routes.user as user_routes


class _DummyRedis:
    async def ping(self):
        return True

    async def aclose(self):
        return None


def test_get_redis_returns_global_instance(monkeypatch):
    dummy = _DummyRedis()
    monkeypatch.setattr(helpers, "r", dummy)

    assert helpers.get_redis() is dummy


@pytest.mark.asyncio
async def test_close_redis_calls_aclose(monkeypatch):
    called = {"ok": False}

    class _R:
        async def aclose(self):
            called["ok"] = True

    reloaded_helpers = importlib.reload(helpers)
    monkeypatch.setattr(reloaded_helpers, "r", _R())
    await reloaded_helpers.close_redis()

    assert called["ok"] is True


def test_send_reset_email_raises_http_500_on_smtp_failure(monkeypatch):
    class _SMTP:
        def __init__(self, *_args, **_kwargs):
            pass

        def __enter__(self):
            raise RuntimeError("smtp down")

        def __exit__(self, *_args):
            return False

    monkeypatch.setattr(user_routes.smtplib, "SMTP_SSL", _SMTP)

    with pytest.raises(HTTPException) as exc_info:
        user_routes.send_reset_email("a@example.com", "http://example/reset")

    assert exc_info.value.status_code == 500


@pytest.mark.asyncio
async def test_create_redis_sets_global_client(monkeypatch):
    class _Client:
        async def ping(self):
            return True

    created = {"client": None}

    def _fake_redis(*_args, **_kwargs):
        created["client"] = _Client()
        return created["client"]

    reloaded_helpers = importlib.reload(helpers)
    monkeypatch.setattr(reloaded_helpers.redis, "Redis", _fake_redis)

    client = await reloaded_helpers.create_redis()

    assert client is created["client"]
    assert reloaded_helpers.get_redis() is created["client"]
