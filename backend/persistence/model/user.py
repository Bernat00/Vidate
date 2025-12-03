from uuid import uuid4
from pydantic import SecretStr, EmailStr

from sqlalchemy import String
from sqlmodel import Field, SQLModel
from datetime import datetime, timezone

from pwdlib import PasswordHash


password_hasher = PasswordHash.recommended()


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

    disabled: bool = Field(nullable=False, default=False)

    # todo machek, profile, role

    @staticmethod
    def hash_password(plaintext: SecretStr):
        return password_hasher.hash(plaintext.get_secret_value())

    def check_password(self, password: str) -> bool:
        return password_hasher.verify(password, self.password_hash)

