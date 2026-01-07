from sqlalchemy import String, UniqueConstraint
from sqlalchemy.orm import Relationship
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    user_id: int = Field(foreign_key="users.id", primary_key=True)

    first_name: str = Field()
    middle_name: str = Field()
    last_name: str = Field()
    birth_date: datetime = Field()
    gender_id: int = Field(foreign_key="genders.id")
    language_id: int = Field(foreign_key="languages.id")
    religion_id: int = Field(foreign_key="religions.id")



