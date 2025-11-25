import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQL_ALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:///./database.db"
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or "dev"
