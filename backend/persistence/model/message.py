from datetime import datetime, timezone
from typing import Any, Self

from pydantic import model_validator
from sqlmodel import Field, SQLModel



class Message(SQLModel, table=True):
    __tablename__ = "messages"


    id: int | None = Field(primary_key=True, default=None)
    is_received: bool = Field(default=False, nullable=False)
    is_read: bool = Field(default=False, nullable=False)
    content: str = Field(nullable=False)
    match_id: int = Field(foreign_key='matches.id', nullable=False)
    originator_id: int = Field(foreign_key="users.id", nullable=False)
    recipient_id: int = Field(foreign_key="users.id", nullable=False)
    timestamp: datetime | None = Field(default=None, nullable=False)
