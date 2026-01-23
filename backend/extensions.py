import redis.asyncio as redis
from backend.config import Config

r: redis.Redis | None = None

async def create_redis():
    global r
    r = redis.Redis(host=Config.REDIS_HOST, port=Config.REDIS_PORT, decode_responses=True)
    await r.ping()
    print("Connected to Redis")

async def close_redis():
    await r.aclose()

def get_redis() -> redis.Redis:
    return r