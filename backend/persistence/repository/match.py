from argparse import ArgumentError

from fastapi import HTTPException
from pydantic import EmailStr
from watchfiles import awatch

from . import BaseRepo
from ..model.match import Match
from sqlalchemy import select, ScalarResult, Row, RowMapping
from typing import Sequence, Any, Coroutine

from ..model.user import User
from ...errors import SameValueError, MatchAlreadyConfirmedError


class MatchRepo(BaseRepo[Match]):

    def __init__(self, session):
        super().__init__(session, Match)

    async def get_by_both_user_ids(self, id1: str, id2:str) -> Match | None:
        stmt = (
            select(Match).where(
                ((Match.user1_id == id1) & (Match.user2_id == id2)) | ((Match.user1_id == id2) & (Match.user2_id == id1)))
        )

        return await self.session.scalar(stmt)

    async def get_by_user_id(self, user_id: str) -> list[Match] | None:
        stmt = (
            select(Match).where((Match.user1_id == user_id) | (Match.user2_id == user_id))
        )

        results = await self.session.scalars(stmt)

        return list(results.all())

    async def match(self, me: User, to_match: User) -> Match:
        if me.id == to_match.id:
            raise SameValueError('Cannot match yourself')


        match_repo = MatchRepo(session=self.session)

        match = await match_repo.get_by_both_user_ids(me.id, to_match.id)

        if match:
            if match.confirmed:
                raise MatchAlreadyConfirmedError("Match already confirmed")

            match.confirmed = True
            return await match_repo.save(match)

        mach = Match()
        if me.id < to_match.id:
            mach.user1_id = me.id
            mach.user2_id = to_match.id
        else:
            mach.user1_id = to_match.id
            mach.user2_id = me.id

        return await match_repo.save(mach)




