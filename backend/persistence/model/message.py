from sqlmodel import Field, SQLModel

from backend.persistence.model import mapper_registry
from backend.persistence.model.chat_event import ChatEvent


@mapper_registry.mapped
class Message(ChatEvent, table=True):
    __tablename__ = "messages"

    __mapper_args__ = {
        "polymorphic_identity": "message",
    }

    id: int | None = Field(primary_key=True, foreign_key="chat_events.id", default=None)
    is_received: bool = Field(default=False, nullable=False)
    is_read: bool = Field(default=False, nullable=False)
    content: str = Field(nullable=False)#todo kitalalni h eleg-e a varchar
