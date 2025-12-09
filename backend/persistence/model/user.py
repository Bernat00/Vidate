from platform import machine
from uuid import uuid4
from pydantic import SecretStr, EmailStr

from sqlalchemy import String
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone
from typing import List, Callable

from pwdlib import PasswordHash

from backend.persistence.model.match import Match

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
        index=True,
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

    matches_as_user1: list["Match"] = Relationship(     #todo ebbe nincs exclude emiatt kell külön OutModel
        back_populates="user1",
        sa_relationship_kwargs={"foreign_keys": "Match.user_1"},
        cascade_delete=True,
    )

    matches_as_user2: list["Match"] = Relationship(
        back_populates="user2",
        sa_relationship_kwargs={"foreign_keys": "Match.user2_id"},
        cascade_delete=True,
    )
    # todo profile, role


    @property
    def  matches(self):
        return [self.matches_as_user1, self.matches_as_user2]

    @staticmethod
    def hash_password(plaintext: SecretStr):
        return password_hasher.hash(plaintext.get_secret_value())

    def check_password(self, password: str) -> bool:
        return password_hasher.verify(password, self.password_hash)


