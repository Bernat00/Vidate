from sqlalchemy import String
from sqlmodel import SQLModel, Field


class PreferenceGenderLink(SQLModel, table=True):
    preference_user_id: str = Field(
        foreign_key="preferences.user_id",
        primary_key=True,
        sa_type=String(256),
    )
    gender_id: int = Field(foreign_key="genders.id", primary_key=True)


class PreferenceLanguageLink(SQLModel, table=True):
    preference_user_id: str = Field(
        foreign_key="preferences.user_id",
        primary_key=True,
        sa_type=String(256),
    )
    language_id: int = Field(foreign_key="languages.id", primary_key=True)


class PreferenceReligionLink(SQLModel, table=True):
    preference_user_id: str = Field(
        foreign_key="preferences.user_id",
        primary_key=True,
        sa_type=String(256),
    )
    religion_id: int = Field(foreign_key="religions.id", primary_key=True)


