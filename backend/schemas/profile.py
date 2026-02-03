from datetime import datetime, timezone

from pydantic import BaseModel, field_validator
from typing import Optional, List

from backend.persistence.model.gender import Gender
from backend.persistence.model.religion import Religion
from backend.persistence.model.language import Language


class ProfileRead(BaseModel):
    user_id: str
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    birth_date: datetime
    gender_id: int
    religion_id: Optional[int] = None
    is_smoker: bool
    wants_children: Optional[bool] = None

    gender: Optional[Gender] = None
    religion: Optional[Religion] = None
    languages: List[Language] = []

    class Config:
        from_attributes = True


class ProfileCreate(BaseModel):
    first_name: str
    # Accept null or empty string for optional middle name and normalize to None
    middle_name: Optional[str] = None
    last_name: str
    birth_date: datetime
    gender_id: int
    language_ids: List[int]
    religion_id: Optional[int] = None
    is_smoker: bool
    wants_children: Optional[bool] = None

    # Ensure users are at least 18 years old
    @field_validator('birth_date')
    @classmethod
    def validate_age(cls, v: datetime) -> datetime:
        # Compare in UTC and based on date only to avoid timezone edge cases
        bdate = (v if v.tzinfo else v.replace(tzinfo=timezone.utc)).date()
        today = datetime.now(timezone.utc).date()
        age = today.year - bdate.year - ((today.month, today.day) < (bdate.month, bdate.day))
        if age < 18:
            raise ValueError('You must be at least 18 years old')
        return v

    # Normalize middle_name so API consumers can send null or empty string
    @field_validator('middle_name', mode='before')
    @classmethod
    def normalize_middle_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        return v

    @field_validator('religion_id', mode='before')
    @classmethod
    def normalize_religion_id(cls, v: Optional[int]) -> Optional[int]:
        if v is None or v == "" or v == 0:
            return None
        return v



class LanguageCreate(BaseModel):
    name: str


class ReligionCreate(BaseModel):
    name: str


class GenderCreate(BaseModel):
    name: str

