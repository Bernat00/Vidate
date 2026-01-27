from pydantic import BaseModel, field_validator, model_validator
from typing import Optional, List

from backend.persistence import Gender, Language, Religion


class PreferenceCreate(BaseModel):
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    wants_children: Optional[bool] = None
    is_smoker: Optional[bool] = None
    gender_ids: Optional[List[int]] = None
    language_ids: Optional[List[int]] = None
    religion_ids: Optional[List[int]] = None

    # Ensure minimum age is at least 18 when provided
    @field_validator('age_min')
    @classmethod
    def _validate_age_min(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v < 18:
            raise ValueError('age_min must be at least 18')
        return v

    # Ensure that when both are present, max is strictly greater than min
    @model_validator(mode='after')
    def _validate_age_range(self):
        if self.age_min is not None and self.age_max is not None:
            if not (self.age_max > self.age_min):
                raise ValueError('age_max must be greater than age_min')
        return self


class PreferenceRead(BaseModel):
    user_id: str
    age_min: int | None
    age_max: int | None
    wants_children: bool | None
    is_smoker: bool | None

    genders: list[Gender] = []
    languages: list[Language] = []
    religions: list[Religion] = []


