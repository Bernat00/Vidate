from pydantic import BaseModel, StrictBool


class SetBan(BaseModel):
    user_id: str
    value: bool