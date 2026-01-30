from sqlalchemy import case, select
from sqlalchemy.orm import aliased

from . import BaseRepo
from .. import Match
from ..model.profile import Profile


class ProfileRepo(BaseRepo[Profile]):

    def __init__(self, session):
        super().__init__(session, Profile)

    async def get_matched_profiles(self, user_id: str, only_confirmed: bool = True) -> list[Profile]:
        Other = aliased(Profile)

        other_id = case(
            (Match.user1_id == user_id, Match.user2_id),
            (Match.user2_id == user_id, Match.user1_id)
        )

        stmt = (
            select(Other)
            .select_from(Match)
            .join(Other, Other.user_id == other_id)
            .where((Match.user1_id == user_id) | (Match.user2_id == user_id))
        )

        if only_confirmed:
            stmt = stmt.where(Match.confirmed == True)

        result = await self.session.scalars(stmt)
        return list(result.all())

