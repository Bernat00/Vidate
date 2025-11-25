from uuid import uuid4

from sqlalchemy import String
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        sa_type=String(64),
        primary_key=True,
    )

    email: str = Field(
        sa_type=String(128),
        unique=True,
        nullable=False,
    )

    # hidden from API responses
    _password: str = Field(
        sa_type=String(128),
        nullable=False,
        exclude=True,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
        nullable=False,
    )

    # todo machek, profile, role

    @_password.setter
    def password(self, value):
        self._password = generate_password_hash(value)

    def check_password(self, password) -> bool:
        return check_password_hash(self._password, password)
