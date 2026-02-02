from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ChatEventOut(BaseModel):
    id: int
    type: str
    match_id: int
    originator_id: str
    recipient_id: str
    timestamp: datetime
    content: Optional[str] = None
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

