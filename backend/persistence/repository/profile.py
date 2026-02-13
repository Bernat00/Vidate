from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from . import BaseRepo
from .. import Match
from ..model.profile import Profile
from ..model.chat_event import ChatEvent


class ProfileRepo(BaseRepo[Profile]):

    def __init__(self, session):
        super().__init__(session, Profile)

    async def get_matched_profiles(
            self,
            user_id: str,
            only_confirmed: bool = True,
    ) -> list[dict]:
        # Subquery for matches where current user is user1
        stmt1 = (
            select(
                Match.id.label("match_id"),
                Match.user2_id.label("other_user_id"),
                Match.timestamp.label("matched_at"),
                Match.confirmed
            )
            .where(Match.user1_id == user_id)
        )
        # Subquery for matches where current user is user2
        stmt2 = (
            select(
                Match.id.label("match_id"),
                Match.user1_id.label("other_user_id"),
                Match.timestamp.label("matched_at"),
                Match.confirmed
            )
            .where(Match.user2_id == user_id)
        )

        matches_union = stmt1.union_all(stmt2).subquery()

        # Subquery for last message content
        last_msg_content = (
            select(ChatEvent.content)
            .where(ChatEvent.match_id == matches_union.c.match_id)
            .order_by(desc(ChatEvent.timestamp))
            .limit(1)
            .correlate(matches_union)
            .scalar_subquery()
            .label("last_message")
        )

        # Subquery for last message timestamp
        last_msg_at = (
            select(ChatEvent.timestamp)
            .where(ChatEvent.match_id == matches_union.c.match_id)
            .order_by(desc(ChatEvent.timestamp))
            .limit(1)
            .correlate(matches_union)
            .scalar_subquery()
            .label("last_message_at")
        )

        stmt = (
            select(
                Profile,
                matches_union.c.matched_at,
                matches_union.c.match_id,
                last_msg_content,
                last_msg_at
            )
            .join(
                matches_union,
                Profile.user_id == matches_union.c.other_user_id,
            )
            .options(
                selectinload(Profile.gender),
                selectinload(Profile.religion),
                selectinload(Profile.languages)
            )
            .order_by(desc(matches_union.c.matched_at))
        )

        if only_confirmed:
            stmt = stmt.where(matches_union.c.confirmed == True)

        result = await self.session.execute(stmt)
        result = result.unique()

        return [
            {
                "profile": profile,
                "matched_at": timestamp,
                "match_id": match_id,
                "last_message": last_message,
                "last_message_at": last_message_at
            }
            for profile, timestamp, match_id, last_message, last_message_at in result
        ]

    async def get_matched_profile(
            self,
            user_id: str,
            partner_id: str
    ) -> dict | None:
        # Simplified to use union for performance
        stmt1 = select(Match.id, Match.timestamp).where(Match.user1_id == user_id, Match.user2_id == partner_id, Match.confirmed == True)
        stmt2 = select(Match.id, Match.timestamp).where(Match.user1_id == partner_id, Match.user2_id == user_id, Match.confirmed == True)

        match_stmt = stmt1.union_all(stmt2).subquery()

        stmt = (
            select(
                Profile,
                match_stmt.c.timestamp,
                match_stmt.c.id
            )
            .join(
                match_stmt,
                Profile.user_id == partner_id,
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
