from sqlmodel import Field, SQLModel
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user1_id: str = Field(index=True)
    user2_id: str = Field(index=True)
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True)
    )
    # end_time: Optional[datetime] = Field(default=None)
