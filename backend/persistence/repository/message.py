from typing import Sequence, Any

from sqlalchemy import Row, RowMapping
from sqlalchemy.orm.interfaces import ORMOption

from . import BaseRepo
from ..model.message import Message

class MessageRepo(BaseRepo[Message]):

    def __init__(self, session):
        super().__init__(session, Message)

    def get_all(self, from_time:datetime, end_time:+  options: Sequence[ORMOption] = None) -> Sequence[Row[Any] | RowMapping | Any]:
        pass #idk h ezzel mit kezdjek