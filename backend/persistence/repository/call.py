from . import BaseRepo
from ..model.call import Call

class CallRepo(BaseRepo[Call]):

    def __init__(self, session):
        super().__init__(session, Call)

