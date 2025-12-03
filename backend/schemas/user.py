from typing import Annotated

from pydantic import EmailStr, SecretStr, BeforeValidator
from pydantic import BaseModel


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


class UserUpdate(BaseModel):
    pass