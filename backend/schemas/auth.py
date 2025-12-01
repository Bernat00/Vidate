from types import new_class

from pydantic import BaseModel
from struct import Struct

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None
