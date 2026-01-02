from pydantic import EmailStr
from sqlalchemy.orm import aliased

from . import BaseRepo
from ..model.match import Match
from ..model.user import User
from sqlalchemy import select, ScalarResult, case
from typing import Sequence, Any, Coroutine


class UserRepo(BaseRepo[User]):

    def __init__(self, session):
        super().__init__(session, User)

    async def get_by_email(self, email: EmailStr) -> User | None:
        stmt = select(User).where(User.email == email)
        result: User | None = await self.session.scalar(stmt)
        return result


    async def get_matched_users(self, user_id: str, only_confirmed: bool = True) -> list[User]:
        Other = aliased(User)

        other_id = case(
            (Match.user1_id == user_id, Match.user2_id),
            (Match.user2_id == user_id, Match.user1_id)
        )

        stmt = (
            select(Other)
            .select_from(Match)
            .join(Other, Other.id == other_id)
            .where((Match.user1_id == user_id) | (Match.user2_id == user_id))
        )

        if only_confirmed:
            stmt = stmt.where(Match.confirmed == True)

        result = await self.session.scalars(stmt)
        return list(result.all())

