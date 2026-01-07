from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Relationship
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Gender(SQLModel, table=True):
    __tablename__ = "genders"

    id: int = Field(primary_key=True)
    text: str = Field()