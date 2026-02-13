import redis.asyncio as redis
from backend.config import Config

r: redis.Redis | None = None

async def create_redis():
    global r
    r = redis.Redis(
        host=Config.REDIS_HOST,
        port=Config.REDIS_PORT,
        decode_responses=True,
        max_connections=100,
        socket_timeout=5
    )
    await r.ping()
    print("Connected to Redis")
    return r

async def close_redis():
    await r.aclose()

def get_redis() -> redis.Redis:
    return r

def copy_non_none_fields(source, target):
    for field, value in source.model_dump(exclude_none=True).items():
        if field in target.model_fields:
            setattr(target, field, value)
