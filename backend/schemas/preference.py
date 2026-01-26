from pydantic import BaseModel
from typing import Optional, List

from backend.persistence import Gender, Language, Religion


class PreferenceCreate(BaseModel):
    wants_children: Optional[bool] = None
    is_smoker: Optional[bool] = None
    gender_ids: Optional[List[int]] = None
    language_ids: Optional[List[int]] = None
    religion_ids: Optional[List[int]] = None


class PreferenceRead(BaseModel):
    user_id: str
    age_min: int | None
    age_max: int | None
    wants_children: bool | None
    is_smoker: bool | None

    genders: list[Gender] = []
    languages: list[Language] = []
    religions: list[Religion] = []


