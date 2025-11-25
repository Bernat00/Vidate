from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from ..config import Config

engine = create_engine(str(Config.SQL_ALCHEMY_DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
