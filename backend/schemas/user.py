from typing import Annotated, Optional

from pydantic import EmailStr, SecretStr, BeforeValidator, ConfigDict
from pydantic import BaseModel
from datetime import datetime


def validate_password(v: str):
    if len(v) > 30:
        raise ValueError('Password must be at most 30 characters')
    if not any(c.islower() for c in v):
        raise ValueError("Password must contain a lowercase letter")
    if not any(c.isupper() for c in v):
        raise ValueError("Password must contain an uppercase letter")
    if not any(c.isdigit() for c in v):
        raise ValueError("Password must contain a digit")
    return v


class UserCreate(BaseModel):
    email: Annotated[str, EmailStr]
    password: Annotated[SecretStr, BeforeValidator(validate_password)]


class PasswordReset(BaseModel):
    password: Annotated[SecretStr, BeforeValidator(validate_password)]


class ResetEmail(BaseModel):
    email: EmailStr


class UserEdit(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[
        Annotated[SecretStr, BeforeValidator(validate_password)]
    ] = None
    old_password: SecretStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    disabled: bool


class UserMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    disabled: bool
    is_onboarded: bool
    role_name: str
