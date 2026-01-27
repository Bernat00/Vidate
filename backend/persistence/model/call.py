from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

from backend.persistence.model.chat_event import ChatEvent


class Call(ChatEvent, table=True):
    __tablename__ = "calls"

    __mapper_args__ = {
        "polymorphic_identity": "call",
    }

    id: int = Field(primary_key=True, foreign_key="chat_events.id")
    end_time: datetime = Field(nullable=True)



