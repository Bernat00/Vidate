from pydantic import model_validator
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone



class Call(SQLModel, table=True):
    __tablename__ = "calls"

    id: int | None = Field(primary_key=True, default=None)
    match_id: int = Field(foreign_key='matches.id', nullable=False)
    originator_id: int = Field(foreign_key="users.id", nullable=False)
    recipient_id: int = Field(foreign_key="users.id", nullable=False)
    timestamp: datetime | None = Field(default=None, nullable=False)
    end_time: datetime = Field(nullable=True)



