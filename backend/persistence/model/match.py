from sqlalchemy import String, UniqueConstraint, DateTime, Column
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone





class Match(SQLModel, table=True):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint("user1_id", "user2_id"),
    )

    id: int = Field(
        primary_key=True,
    )

    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), index=True, nullable=False)
    )

    confirmed: bool = Field(
        nullable=False,
        default=False,
    )

    user1_id: str = Field(
        sa_column=Column(String(255), foreign_key="users.id", index=True, nullable=False)
    )

    user2_id: str = Field(
        sa_column=Column(String(255), foreign_key="users.id", index=True, nullable=False)
    )
