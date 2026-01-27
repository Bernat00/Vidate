from sqlmodel import Field, SQLModel
from datetime import datetime

from backend.persistence.model import mapper_registry
from backend.persistence.model.chat_event import ChatEvent


@mapper_registry.mapped
class Call(ChatEvent, table=True):
    __tablename__ = "calls"

    __mapper_args__ = {
        "polymorphic_identity": "call",
    }

    id: int | None = Field(primary_key=True, foreign_key="chat_events.id", default=None)
    end_time: datetime = Field(nullable=True)



