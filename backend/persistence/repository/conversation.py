from backend.persistence.model.conversation import Conversation
from backend.persistence.repository import BaseRepo

class ConversationRepo(BaseRepo[Conversation]):
    def __init__(self, session):
        super().__init__(session, Conversation)

