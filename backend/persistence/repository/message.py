from . import BaseRepo
from ..model.message import Message

class MessageRepo(BaseRepo[Message]):

    def __init__(self, session):
        super().__init__(session, Message)

