import asyncio
from types import SimpleNamespace

import pytest
from fastapi import WebSocketDisconnect

import backend.routes.realtime.endpoints as rt


class _FakeWS:
    def __init__(self, messages=None):
        self.messages = messages or []
        self.sent = []
        self.closed = []
        self.accepted = False

    async def receive_json(self):
        if not self.messages:
            raise WebSocketDisconnect()
        msg = self.messages.pop(0)
        if isinstance(msg, Exception):
            raise msg
        return msg

    async def send_text(self, payload):
        self.sent.append(payload)

    async def close(self, code=None):
        self.closed.append(code)

    async def accept(self):
        self.accepted = True


class _FakeRedis:
    def __init__(self):
        self.calls = []

    async def publish(self, channel, payload):
        self.calls.append(("publish", channel, payload))

    async def zrem(self, key, *members):
        self.calls.append(("zrem", key, members))

    async def delete(self, key):
        self.calls.append(("delete", key))

    async def hset(self, key, mapping):
        self.calls.append(("hset", key, mapping))

    async def expire(self, key, ttl):
        self.calls.append(("expire", key, ttl))

    async def geoadd(self, key, value):
        self.calls.append(("geoadd", key, value))

    async def zadd(self, key, values):
        self.calls.append(("zadd", key, values))

    async def zscore(self, _key, _member):
        return 1

    async def exists(self, _key):
        return True


@pytest.mark.asyncio
async def test_ws_to_redis_reader_offer_and_chat_message():
    ws = _FakeWS(
        messages=[
            {"type": "offer", "payload": {"peer_id": "u2", "sdp": "abc"}},
            {
                "type": "chat_message",
                "payload": {"match_id": 1, "recipient_id": "u2", "content": "hi"},
            },
            WebSocketDisconnect(),
        ]
    )
    r = _FakeRedis()

    class _ChatRepo:
        async def save(self, chat_event):
            chat_event.id = 1

    repo = SimpleNamespace(chat_event_repo=_ChatRepo())

    await rt.ws_to_redis_reader(ws, "u1", r, repo)

    assert any(c[0] == "publish" and c[1] == "user:u2" for c in r.calls)
    assert any(c[0] == "publish" and c[1] == "user:u1" for c in r.calls)


@pytest.mark.asyncio
async def test_ws_endpoint_rejects_invalid_user(monkeypatch):
    ws = _FakeWS()
    r = _FakeRedis()

    class _Checker:
        async def __call__(self, _token, _repo):
            return None

    monkeypatch.setattr(rt, "CurrentUserCheckerDependency", lambda: _Checker())

    await rt.ws_endpoint(ws, token="bad", r=r, repo=SimpleNamespace())

    assert ws.closed


@pytest.mark.asyncio
async def test_ws_endpoint_accepts_and_cleans_up(monkeypatch):
    ws = _FakeWS()
    r = _FakeRedis()

    class _Checker:
        async def __call__(self, _token, _repo):
            return SimpleNamespace(id="u1")

    async def fake_writer(_ws, _uid, _r):
        return None

    async def fake_reader(_ws, _uid, _r, _repo):
        await asyncio.sleep(0)
        return None

    monkeypatch.setattr(rt, "CurrentUserCheckerDependency", lambda: _Checker())
    monkeypatch.setattr(rt, "redis_to_ws_writer", fake_writer)
    monkeypatch.setattr(rt, "ws_to_redis_reader", fake_reader)

    await rt.ws_endpoint(ws, token="ok", r=r, repo=SimpleNamespace())

    assert ws.accepted is True
    assert any(c[0] == "delete" and c[1] == "mm_entry:u1" for c in r.calls)


@pytest.mark.asyncio
async def test_ws_to_redis_reader_joined_feed_populates_matchmaking(monkeypatch):
    ws = _FakeWS(
        messages=[
            {"type": "joined_feed", "payload": {"lat": 47.5, "lon": 19.0}},
            WebSocketDisconnect(),
        ]
    )
    r = _FakeRedis()

    class _ProfileRepo:
        async def get_by_id(self, *_args, **_kwargs):
            return SimpleNamespace(
                first_name="Alex",
                birth_date=SimpleNamespace(date=lambda: __import__("datetime").date(1990, 1, 1)),
                gender_id=1,
                religion_id=1,
                is_smoker=False,
                wants_children=True,
                languages=[SimpleNamespace(id=1)],
            )

    class _PrefRepo:
        async def get_by_id(self, *_args, **_kwargs):
            return SimpleNamespace(
                genders=[],
                languages=[SimpleNamespace(id=1)],
                religions=[SimpleNamespace(id=1)],
                age_min=20,
                age_max=40,
                wants_children=True,
                is_smoker=False,
            )

    class _GenderRepo:
        async def get_all(self):
            return [SimpleNamespace(id=1), SimpleNamespace(id=2)]

    class _ExecuteResult:
        def __init__(self, values):
            self._values = values

        def scalars(self):
            return self

        def all(self):
            return self._values

    class _Session:
        def __init__(self):
            self.calls = 0

        async def execute(self, _stmt):
            self.calls += 1
            return _ExecuteResult([])

    async def fake_attempt_match_for_user(_r, _uid, _repo):
        return True

    monkeypatch.setattr(rt, "attempt_match_for_user", fake_attempt_match_for_user)

    repo = SimpleNamespace(
        profile_repo=_ProfileRepo(),
        preference_repo=_PrefRepo(),
        gender_repo=_GenderRepo(),
        session=_Session(),
        chat_event_repo=SimpleNamespace(save=lambda *_args, **_kwargs: None),
    )

    await rt.ws_to_redis_reader(ws, "u1", r, repo)

    assert any(c[0] == "hset" and c[1] == "mm_entry:u1" for c in r.calls)
    assert any(c[0] == "zadd" and c[1] == "matchmaking" for c in r.calls)
