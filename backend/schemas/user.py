from pydantic import EmailStr, SecretStr
from pydantic import BaseModel


class UserCreate(BaseModel):
    email: EmailStr
    password: SecretStr



