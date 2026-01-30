from typing import Optional

from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Relationship
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

from backend.persistence import Gender, Religion
from backend.persistence.model.language import Language


class PreferenceLanguageLink(SQLModel, table=False):
    preference_user_id: str = Field(
        foreign_key="profiles.user_id",
        primary_key=True,
        sa_type=String(256),
    )
    language_id: int = Field(foreign_key="languages.id", primary_key=True)


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    user_id: str = Field(foreign_key="users.id", primary_key=True, sa_type=String(256))

    first_name: str = Field(nullable=False)
    middle_name: str | None = Field(default=None, nullable=True)
    last_name: str = Field(nullable=False)
    birth_date: datetime = Field(nullable=False)
    gender_id: int = Field(foreign_key="genders.id", nullable=False)
    religion_id: int = Field(foreign_key="religions.id")
    is_smoker: bool = Field(default=False)
    wants_children: Optional[bool] = Field(default=None)

    #gender: Gender = Relationship()
    #religion: Religion = Relationship()
    #language: list[Language] = Relationship()




