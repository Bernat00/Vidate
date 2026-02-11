from contextlib import asynccontextmanager

from .persistence import  create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .routes.realtime.endpoints import router as realtime_router
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(_app: FastAPI):
    from backend.helpers import create_redis, close_redis
    from backend.background.matchmaking import ensure_matchmaking_index
    await create_db_and_tables()
    try:
        r = await create_redis()
        await ensure_matchmaking_index(r)
    except Exception as e:
        raise

    yield

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
