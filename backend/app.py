from contextlib import asynccontextmanager
from .persistence import  create_db_and_tables

from .routes import router
from fastapi import FastAPI




@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
    #close stuff




app = FastAPI(lifespan=lifespan)
app.include_router(router)

