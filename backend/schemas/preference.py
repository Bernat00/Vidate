from pydantic import BaseModel
from typing import Optional, List


class PreferenceCreate(BaseModel):
    wants_children: Optional[bool] = None
    is_smoker: Optional[bool] = None
    gender_ids: List[int]
    language_ids: List[int]
    religion_ids: List[int]
