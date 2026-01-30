
from sqlalchemy import case, func, select

from . import BaseRepo
from .. import Match
from ..model.profile import Profile


class ProfileRepo(BaseRepo[Profile]):

    def __init__(self, session):
        super().__init__(session, Profile)

    async def get_matched_profiles(self, user_id: str, only_confirmed: bool = True) -> list[dict]:
        other_id = case(
            (Match.user1_id == user_id, Match.user2_id),
            (Match.user2_id == user_id, Match.user1_id)
        ).label("other_id")

        match_stmt = (
            select(
                other_id,
                func.max(Match.timestamp).label("matched_at")
            )
            .where((Match.user1_id == user_id) | (Match.user2_id == user_id))
            .group_by(other_id)
        )

        if only_confirmed:
            match_stmt = match_stmt.where(Match.confirmed == True)

        match_subquery = match_stmt.subquery()

        stmt = (
            select(Profile, match_subquery.c.matched_at)
            .join(match_subquery, Profile.user_id == match_subquery.c.other_id)
        )

        result = await self.session.execute(stmt)
        return [
            {
                "profile": profile,
                "matched_at": matched_at,
            }
            for profile, matched_at in result.all()
        ]

