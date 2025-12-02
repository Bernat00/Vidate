from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine


from backend.config import Config


engine = create_async_engine(
    str(Config.SQL_ALCHEMY_DATABASE_URL),
    echo=True,
    connect_args={"check_same_thread": False}
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        #await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)


async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)