from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Relationship
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    user_id: str = Field(foreign_key="users.id", primary_key=True, sa_type=String(256))

    first_name: str = Field(nullable=False)
    middle_name: str = Field(nullable=True)
    last_name: str = Field(nullable=False)
    birth_date: datetime = Field(nullable=False)
    gender_id: int = Field(foreign_key="genders.id", nullable=False)
    language_id: int = Field(foreign_key="languages.id", nullable=False)
    religion_id: int = Field(foreign_key="religions.id")



