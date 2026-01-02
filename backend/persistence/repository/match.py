from pydantic import EmailStr

from . import BaseRepo
from ..model.match import Match
from sqlalchemy import select, ScalarResult, Row, RowMapping
from typing import Sequence, Any, Coroutine

from ..model.user import User


class MatchRepo(BaseRepo[Match]):

    def __init__(self, session):
        super().__init__(session, Match)


    def create_match(self, my_id: str, other_id: str) -> Match:
        mach = Match()
        if my_id < other_id:
            mach.user1_id = my_id
            mach.user2_id = other_id
        else:
            mach.user1_id = other_id
            mach.user2_id = my_id


        return mach

