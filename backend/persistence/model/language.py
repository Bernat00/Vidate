from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Language(SQLModel, table=True):
    __tablename__ = "languages"

    id: int = Field(primary_key=True)
    name: str = Field(nullable=False, unique=True)