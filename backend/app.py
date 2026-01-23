from contextlib import asynccontextmanager

from .persistence import  create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .routes.realtime.endpoints import router as realtime_router
from fastapi import FastAPI
import redis.asyncio as redis

from .config import Config


r: redis.Redis | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global r
    try:
        r = redis.Redis(host=Config.REDIS_HOST, port=Config.REDIS_PORT, decode_responses=True)
        await r.ping()
    except Exception as e:
        raise
    yield
    #close stuff
    if r:
        await r.aclose()


app = FastAPI(lifespan=lifespan)


origins = [
    "*" #todo remove for prod
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router)
app.include_router(realtime_router, tags=['realtime'])
