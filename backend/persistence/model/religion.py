from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Relationship
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Religion(SQLModel, table=True):
    __tablename__ = "religions"

    id: int = Field(primary_key=True)
    name: str = Field(nullable=False, unique=True)

