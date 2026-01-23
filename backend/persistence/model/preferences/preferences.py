from typing import Optional, List

from sqlalchemy import String
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone

from backend.persistence.model.gender import Gender
from backend.persistence.model.language import Language
from backend.persistence.model.preferences.associacions import PreferenceGenderLink, PreferenceLanguageLink, \
    PreferenceReligionLink
from backend.persistence.model.religion import Religion


class Preference(SQLModel, table=True):
    __tablename__ = "preferences"

    user_id: str = Field(
        foreign_key="users.id",
        primary_key=True,
        sa_type=String(256),
    )

    first_name: str = Field(nullable=False)
    last_name: str = Field(nullable=False)
    birth_date: datetime = Field(nullable=False)

    wants_children: Optional[bool] = Field(default=None)
    is_smoker: Optional[bool] = Field(default=None)

    genders: List[Gender] = Relationship(
        back_populates="preferences",
        link_model=PreferenceGenderLink,
    )

    languages: List[Language] = Relationship(
        back_populates="preferences",
        link_model=PreferenceLanguageLink,
    )

    religions: List[Religion] = Relationship(
        back_populates="preferences",
        link_model=PreferenceReligionLink,
    )





