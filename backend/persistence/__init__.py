from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker


from ..config import Config


engine = create_async_engine(
    str(Config.SQL_ALCHEMY_DATABASE_URL),
    echo=True,
    connect_args={"check_same_thread": False}
)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)