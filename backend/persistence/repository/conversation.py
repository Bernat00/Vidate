from sqlalchemy import select

from backend.persistence.model.conversation import Conversation
from backend.persistence.repository import HasTwoUsersRepo

class ConversationRepo(HasTwoUsersRepo[Conversation]):
    def __init__(self, session):
        super().__init__(session, Conversation)





