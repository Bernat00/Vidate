from contextlib import asynccontextmanager

from .persistence import  create_db_and_tables
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router
from .routes.realtime import router as realtime_router
from fastapi import FastAPI, WebSocket




@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
    #close stuff


app = FastAPI(lifespan=lifespan)


origins = [
    "http://localhost:8000",
    "http://localhost:5173",
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
