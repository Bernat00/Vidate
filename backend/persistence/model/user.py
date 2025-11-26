from uuid import uuid4
from pydantic import SecretStr, EmailStr

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

    email: EmailStr = Field(
        sa_type=String(128),
        unique=True,
        nullable=False,
    )

    # hidden from API responses
    password_hash: SecretStr = Field(
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

    @property
    def password(self):
        raise PermissionError(
            "You cannot access the password field."
        )

    @password.setter
    def password(self, value):
        self.password_hash = generate_password_hash(value)

    def check_password(self, password) -> bool:
        return check_password_hash(self.password_hash, password)
