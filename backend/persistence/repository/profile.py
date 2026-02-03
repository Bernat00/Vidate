from sqlalchemy import case, func, select
from sqlalchemy.orm import selectinload

from . import BaseRepo
from .. import Match
from ..model.profile import Profile


class ProfileRepo(BaseRepo[Profile]):

    def __init__(self, session):
        super().__init__(session, Profile)

    async def get_matched_profiles(
            self,
            user_id: str,
            only_confirmed: bool = True,
    ) -> list[dict]:
        other_user_id = (
            case(
        (Match.user1_id == user_id, Match.user2_id),
                (Match.user2_id == user_id, Match.user1_id)
            ).label("other_user_id")
        )

        stmt = (
            select(
                Profile,
                Match.timestamp,
                Match.id
            )
            .join(
                Match,
                Profile.user_id == other_user_id,
            )
            .where(
                other_user_id.is_not(None)
            )
            .options(
                selectinload(Profile.gender),
                selectinload(Profile.religion),
                selectinload(Profile.languages)
            )
        )

        if only_confirmed:
            stmt = stmt.where(Match.confirmed.is_(True))

        result = await self.session.execute(stmt)
        result = result.unique()

        return [
            {"profile": profile, "matched_at": timestamp, "match_id": match_id}
            for profile, timestamp, match_id in result
        ]

    async def get_matched_profile(
            self,
            user_id: str,
            partner_id: str
    ) -> dict | None:
        other_user_id = (
            case(
                (Match.user1_id == user_id, Match.user2_id),
                (Match.user2_id == user_id, Match.user1_id)
            ).label("other_user_id")
        )

        stmt = (
            select(
                Profile,
                Match.timestamp,
                Match.id
            )
            .join(
                Match,
                Profile.user_id == other_user_id,
            )
            .where(
                other_user_id == partner_id,
                Match.confirmed.is_(True)
            )
            .options(
                selectinload(Profile.gender),
                selectinload(Profile.religion),
                selectinload(Profile.languages)
            )
        )

        result = await self.session.execute(stmt)
        row = result.unique().first()

        if row:
            profile, timestamp, match_id = row
            return {"profile": profile, "matched_at": timestamp, "match_id": match_id}

        return None
