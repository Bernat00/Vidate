from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from backend.config import Config
from backend.persistence.model.role import Role

engine = create_async_engine(
    str(Config.SQL_ALCHEMY_DATABASE_URL),
    echo=True,
    connect_args={"check_same_thread": False}
)


async def create_db_and_tables():
    async with engine.begin() as conn:
        #await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

        role = Role()
        role.name = 'user'

        with AsyncSession(engine) as session:
            await session.add(role)



async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await create_db_and_tables()