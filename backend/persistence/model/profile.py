from typing import Optional, List

from sqlalchemy import String, DateTime
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone

from backend.persistence.model.gender import Gender
from backend.persistence.model.religion import Religion
from backend.persistence.model.language import Language


class ProfileLanguageLink(SQLModel, table=True):
    profile_user_id: str = Field(
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
    birth_date: datetime = Field(nullable=False, sa_type=DateTime(timezone=True))
    gender_id: int = Field(foreign_key="genders.id", nullable=False)
    religion_id: int | None = Field(default=None, foreign_key="religions.id", nullable=True)
    is_smoker: bool = Field(default=False)
    wants_children: Optional[bool] = Field(default=None)

    languages: Optional[List[Language]] = Relationship(
        link_model=ProfileLanguageLink,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    gender: Gender = Relationship(sa_relationship_kwargs={"lazy": "joined"})
    religion: Optional[Religion] = Relationship(sa_relationship_kwargs={"lazy": "joined"})
    #language: list[Language] = Relationship()
