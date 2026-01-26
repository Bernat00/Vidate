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


    age_min: int = Field(nullable=True, default=None)
    age_max: int = Field(nullable=True, default=None)

    wants_children: Optional[bool] = Field(default=None)
    is_smoker: Optional[bool] = Field(default=None)

    genders: List[Gender] = Relationship(
        back_populates="preferences",
        link_model=PreferenceGenderLink,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    languages: List[Language] = Relationship(
        back_populates="preferences",
        link_model=PreferenceLanguageLink,
        sa_relationship_kwargs={"lazy": "joined"},
    )

    religions: List[Religion] = Relationship(
        back_populates="preferences",
        link_model=PreferenceReligionLink,
        sa_relationship_kwargs={"lazy": "joined"},
    )





