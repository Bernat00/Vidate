from sqlalchemy import inspect
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
    async with engine.connect() as conn:
        def check_role_exists(sync_conn):
            inspector = inspect(sync_conn)

            return inspector.has_table("roles")

        table_exists = await conn.run_sync(check_role_exists)


    if table_exists:
        return


    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


    user = Role(name='user')
    admin = Role(name='admin')

    async with AsyncSession(engine) as session:
        session.add(admin)
        session.add(user)
        await session.commit()

async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await create_db_and_tables()