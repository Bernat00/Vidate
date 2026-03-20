import asyncio
import importlib
import os

import pytest
from httpx import ASGITransport, AsyncClient
from sqlmodel import SQLModel


class DummyRedis:
    def __init__(self):
        self._store = {}
        self.published = []

    async def ping(self):
        return True

    async def publish(self, channel: str, message: str):
        self.published.append((channel, message))
        return 1

    async def set(self, key: str, value: str, ex=None):
        self._store[key] = value
        return True

    async def getdel(self, key: str):
        return self._store.pop(key, None)

    async def aclose(self):
        return None


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_db_url(tmp_path_factory):
    db_path = tmp_path_factory.mktemp("db") / "test.db"
    return f"sqlite+aiosqlite:///{db_path}"


@pytest.fixture(scope="session")
def persistence(test_db_url, event_loop):
    os.environ["DATABASE_URL"] = test_db_url

    import backend.config as config
    importlib.reload(config)

    import backend.persistence as persistence_module
    importlib.reload(persistence_module)

    import backend.persistence.repository as repository_module
    importlib.reload(repository_module)

    event_loop.run_until_complete(persistence_module.create_db_and_tables())
    return persistence_module


@pytest.fixture(scope="session")
def app(persistence):
    import backend.background.matchmaking as matchmaking
    import backend.helpers as helpers

    dummy = DummyRedis()
    helpers.r = dummy

    async def create_redis():
        helpers.r = dummy
        return dummy

    async def close_redis():
        return None

    async def ensure_matchmaking_index(_r):
        return None

    helpers.create_redis = create_redis
    helpers.close_redis = close_redis
    matchmaking.ensure_matchmaking_index = ensure_matchmaking_index

    import backend.app as app_module
    importlib.reload(app_module)
    return app_module.app


@pytest.fixture(autouse=True)
async def reset_db(persistence):
    async with persistence.engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    await persistence.create_db_and_tables()
    yield


@pytest.fixture
async def client(app):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client


async def _get_token(client: AsyncClient, email: str, password: str) -> str:
    res = await client.post(
        "/api/auth/token",
        data={"username": email, "password": password},
    )
    res.raise_for_status()
    return res.json()["access_token"]


@pytest.fixture
async def user_token(client):
    credentials = {"email": "user@example.com", "password": "Password1"}
    res = await client.post("/api/auth/register", json=credentials)
    assert res.status_code == 201
    token = await _get_token(client, credentials["email"], credentials["password"])
    return token, credentials


@pytest.fixture
async def admin_token(client):
    token = await _get_token(client, "admin@example.com", "Admin2006")
    return token

