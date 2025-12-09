from typing import Annotated, Any

from pydantic import EmailStr, SecretStr, BeforeValidator, ConfigDict, computed_field
from pydantic import BaseModel
from datetime import datetime

from backend.persistence.model.match import Match

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




class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    disabled: bool

    @computed_field(
        return_type=list[Match],
        repr=False,
    )
    @property
    def matches(self) -> list[Match]:
        orm_user = self.__pydantic_self__  # SQLModel User instance

        return orm_user.matches