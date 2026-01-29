from typing import Sequence, Any, List

from sqlalchemy import Row, RowMapping, desc
from sqlalchemy.orm.interfaces import ORMOption

from . import BaseRepo, T
from sqlmodel import SQLModel, select

from ..model.chat_event import ChatEvent


class ChatEventRepo(BaseRepo[ChatEvent]):

    def __init__(self, session):
        super().__init__(session, ChatEvent)

