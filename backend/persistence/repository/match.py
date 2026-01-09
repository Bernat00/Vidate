from fastapi import HTTPException
from pydantic import EmailStr
from watchfiles import awatch

from . import BaseRepo
from ..model.match import Match
from sqlalchemy import select, ScalarResult, Row, RowMapping
from typing import Sequence, Any, Coroutine

from ..model.user import User


class MatchRepo(BaseRepo[Match]):

    def __init__(self, session):
        super().__init__(session, Match)



    async def get_by_both_user_ids(self, id1, id2) -> Match | None:
        stmt = (
            select(Match).where((Match.user1_id == id1 & Match.user2_id == id2) | (Match.user1_id == id2 & Match.user2_id == id1))
        )

        return await self.session.scalar(stmt)


    async def get_by_user_id(self, user_id: str) -> Match | None:
        stmt = (
            select(Match).where(Match.user1_id == user_id | Match.user2_id == user_id)
        )

        return await self.session.scalar(stmt)


    async def match(self, me: User, to_match: User) -> Match:
        match_repo = MatchRepo(session=self.session)
        base_repo = BaseRepo(session=self.session)

        match = await match_repo.get_by_both_user_ids(me.id1, to_match.id1)

        if match:
            match.confirmed = True
            return await base_repo.save(match)

        mach = Match()
        if me.id < to_match.id:
            mach.user1_id = me.id
            mach.user2_id = to_match.id
        else:
            mach.user1_id = to_match.id
            mach.user2_id = me.id


        return await base_repo.save(mach)

