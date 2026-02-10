from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Report(SQLModel, table=True):
    __tablename__ = "reports"

    id: int = Field(primary_key=True)
    user_id: str = Field(nullable=False, foreign_key="users.id")
    reason: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_type=DateTime(timezone=True)
    )

