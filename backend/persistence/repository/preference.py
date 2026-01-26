from typing import Any, Sequence, Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm.interfaces import ORMOption

from . import BaseRepo, T
from ..model.preferences.preferences import Preference

class PreferenceRepo(BaseRepo[Preference]):

    def __init__(self, session):
        super().__init__(session, Preference)

