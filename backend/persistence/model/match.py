

from sqlalchemy import String, UniqueConstraint
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Match(SQLModel, table=True):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint("user_1", "user2_id"),
    )

    id: int = Field(
        default=None,
        primary_key=True,
    )

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

    confirmed: bool = Field(
        default=False,
    )

    user_1: str = Field(
        foreign_key="users.id",
        sa_type=String(255),
        nullable=False,
    )

    user2_id: str = Field(
        foreign_key="users.id",
        sa_type=String(255),
        nullable=False,
    )


