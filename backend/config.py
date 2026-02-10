import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQL_ALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite+aiosqlite:///./database.db"
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or "dev"
    PSW_SECRET_KEY = os.getenv("PSW_SECRET_KEY") or "dev"
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM") or "HS256"
    PWD_SALT = os.getenv("PWD_SALT") or "helikopter"
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
