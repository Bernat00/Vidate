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



class LanguageCreate(BaseModel):
    name: str


class ReligionCreate(BaseModel):
    name: str


class GenderCreate(BaseModel):
    name: str



