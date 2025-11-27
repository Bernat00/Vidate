from typing import Annotated
from uuid import uuid4
from pydantic import SecretStr, EmailStr, field_validator
from pydantic.types import SecretType

from sqlalchemy import String, TypeDecorator, Column
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

from werkzeug.security import check_password_hash, generate_password_hash





class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(
        default_factory=lambda: str(uuid4()),
        sa_type=String(256),
        primary_key=True,
    )

    email: EmailStr = Field(
        sa_type=String(128),
        unique=True,
        nullable=False,
    )

    password_hash: str = Field(
        sa_type=String(256),
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

    @staticmethod
    def hash_password(plaintext: SecretStr):
        return generate_password_hash(plaintext.get_secret_value())

    def check_password(self, password: SecretStr) -> bool:
        return check_password_hash(self.password_hash, password.get_secret_value())

