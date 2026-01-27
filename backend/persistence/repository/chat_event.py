from sqlalchemy import select

from . import BaseRepo
from ..model.chat_event import ChatEvent


class ChatEventRepo(BaseRepo[ChatEvent]):

    def __init__(self, session):
        super().__init__(session, ChatEvent)


    async def get_by_match_id(self, match_id: int) -> list[ChatEvent]:
        stmt = (
            select(ChatEvent).where(ChatEvent.match_id == match_id)
        )

        results = await self.session.scalars(stmt)

        return results.all()

