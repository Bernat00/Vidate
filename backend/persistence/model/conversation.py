from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user1_id: str = Field(index=True)
    user2_id: str = Field(index=True)
    start_time: datetime = Field(default_factory=datetime.utcnow)
    # end_time: Optional[datetime] = Field(default=None)

