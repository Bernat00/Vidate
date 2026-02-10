from contextlib import asynccontextmanager

import redis.asyncio as redis

from .persistence import  create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .routes.realtime.endpoints import router as realtime_router
from fastapi import FastAPI

from .config import Config
from backend.background.matchmaking import matchmaking_worker
import asyncio


@asynccontextmanager
async def lifespan(_app: FastAPI):
    from backend.helpers import create_redis, close_redis
    await create_db_and_tables()
    try:
        await create_redis()
    except Exception as e:
        raise e

    # Start matchmaking worker
    worker_task = asyncio.create_task(matchmaking_worker())

    yield

    # Stop matchmaking worker
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

    #close stuff
    await close_redis()


app = FastAPI(lifespan=lifespan)


origins = [
    "*", #todo remove for prod
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
