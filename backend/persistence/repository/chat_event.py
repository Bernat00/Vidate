from typing import Sequence

from sqlalchemy import desc
from . import BaseRepo
from sqlmodel import select

from ..model.chat_event import ChatEvent


class ChatEventRepo(BaseRepo[ChatEvent]):

    def __init__(self, session):
        super().__init__(session, ChatEvent)

    async def get_paginated_by_match_id(
        self,
        match_id: int,
        last_id: int | None = None,
        limit: int = 30
    ) -> Sequence[ChatEvent]:
        # Use ChatEvent.id explicitly to avoid type hint confusion if necessary,
        # though SQLModel should handle it.
        stmt = select(ChatEvent).where(ChatEvent.match_id == match_id)

        if last_id is not None:
            stmt = stmt.where(ChatEvent.id < last_id)

        stmt = stmt.order_by(desc(ChatEvent.id)).limit(limit)

        result = await self.session.scalars(stmt)
        return result.all()

