from datetime import datetime

from pydantic import BaseModel


class ProfileCreate(BaseModel):
    first_name: str
    middle_name: str
    last_name: str
    birth_date: datetime
    gender_id: int
    language_id: int
    religion_id: int
