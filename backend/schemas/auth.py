from types import new_class

from pydantic import BaseModel
from struct import Struct

class Token(BaseModel):
    access_token: str #todo ide kell maxlen?
    token_type: str


class TokenData(BaseModel):
    id: str | None = None
