from sqlalchemy import String
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone


class Preference(SQLModel, table=True):
    __tablename__ = "preferences"

    user_id: str = Field(foreign_key="users.id", primary_key=True, sa_type=String(256))

    first_name: str = Field(nullable=False)
    middle_name: str = Field(nullable=True)
    last_name: str = Field(nullable=False)
    birth_date: datetime = Field(nullable=False)
    gender_id: int = Field(foreign_key="genders.id", nullable=False)
    language_id: int = Field(foreign_key="languages.id", nullable=False)
    religion_id: int = Field(foreign_key="religions.id")

    wants_children: bool = Field(nullable=True)





