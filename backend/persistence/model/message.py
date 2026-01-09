from sqlmodel import Field, SQLModel

from backend.persistence.model.chat_event import ChatEvent


class Message(ChatEvent):
    __tablename__ = "messages"

    __mapper_args__ = {
        "polymorphic_identity": "call",
    }

    id: int = Field(primary_key=True, foreign_key="chat_event.id")
    is_received: bool = Field(default=False, nullable=False)
    is_read: bool = Field(default=False, nullable=False)
    content: str = Field(nullable=False)#todo kitalalni h eleg-e a varchar
