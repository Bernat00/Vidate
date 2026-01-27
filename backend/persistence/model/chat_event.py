from sqlmodel import Field, SQLModel
from datetime import datetime, timezone


class ChatEvent(SQLModel, table=True):
    __tablename__ = "chat_events"

    __mapper_args__ = {
        "polymorphic_identity": "chat_event",
        "polymorphic_on": "type",
    }

    id: int | None = Field(primary_key=True, default=None)
    match_id: int = Field(foreign_key='matches.id', nullable=False)
    originator_id: int = Field(foreign_key="users.id", nullable=False)  #mi legyen torlesnel
    recipient_id: int = Field(foreign_key="users.id", nullable=False)
    timestamp: datetime = Field(default_factory=lambda: datetime. now(timezone.utc), nullable=False)
    type: str = Field(nullable=False)

