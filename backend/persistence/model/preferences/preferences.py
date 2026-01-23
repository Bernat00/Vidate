from sqlmodel import Field, SQLModel
from datetime import datetime, timezone


class Preference(SQLModel, table=True):
    __tablename__ = "preferences"

    id: int = Field(primary_key=True)
    wants_children: bool = Field(nullable=True)





