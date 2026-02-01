from datetime import datetime, timezone

from pydantic import BaseModel, field_validator
from typing import Optional, List


class ProfileCreate(BaseModel):
    first_name: str
    # Accept null or empty string for optional middle name and normalize to None
    middle_name: Optional[str] = None
    last_name: str
    birth_date: datetime
    gender_id: int
    language_ids: List[int]
    religion_id: int
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
        # Allow explicit nulls
        if v is None:
            return None
        # If something non-string sneaks in, coerce to string for safety
        if not isinstance(v, str):
            try:
                v = str(v)
            except Exception:
                return None
        v = v.strip()
        return v or None



class LanguageCreate(BaseModel):
    name: str


class ReligionCreate(BaseModel):
    name: str


class GenderCreate(BaseModel):
    name: str



