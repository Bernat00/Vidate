from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field

# todo cascade when match is deleted
class ChatEvent(SQLModel, table=True):
    __tablename__ = "chat_events"

    id: int | None = Field(default=None, primary_key=True)

    # discriminator
    # todo add this back
    """
    type: Literal["message", "call"] = Field(index=True, nullable=False)
    """
    type: str = Field(index=True, nullable=False)

    match_id: int = Field(foreign_key="matches.id", nullable=False)
    originator_id: str = Field(foreign_key="users.id", nullable=False)
    recipient_id: str = Field(foreign_key="users.id", nullable=False)

    timestamp: datetime | None = Field(nullable=False, default_factory=lambda: datetime.now(timezone.utc))

    # message-specific fields
    content: Optional[str] = Field(default=None)
    # is_received: Optional[bool] = Field(default=None)
    # is_read: Optional[bool] = Field(default=None)

    # call-specific fields
    end_time: Optional[datetime] = Field(default=None)
