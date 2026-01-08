from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Relationship
from sqlmodel import Field, SQLModel





class Role(SQLModel, table=True):
    __tablename__ = "roles"

    id: int = Field(primary_key=True)
    name: str = Field()