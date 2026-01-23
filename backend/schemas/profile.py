from datetime import datetime, timezone

from pydantic import BaseModel, field_validator
from typing import Optional


class ProfileCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    birth_date: datetime
    gender_id: int
    language_id: int
    religion_id: int

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
