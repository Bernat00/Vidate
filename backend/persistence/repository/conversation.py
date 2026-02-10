from sqlalchemy import select

from backend.persistence.model.conversation import Conversation
from backend.persistence.repository import BaseRepo

class ConversationRepo(BaseRepo[Conversation]):
    def __init__(self, session):
        super().__init__(session, Conversation)

    async def get_by_both_user_ids(self, id1: str, id2:str) -> Conversation | None:
        stmt = (
            select(Conversation).where(
                ((Conversation.user1_id == id1) & (Conversation.user2_id == id2)) | ((Conversation.user1_id == id2) & (Conversation.user2_id == id1)))
        )


        return await self.session.scalar(stmt)


