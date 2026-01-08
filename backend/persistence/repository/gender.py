from . import BaseRepo
from ..model.gender import Gender


class GenderRepo(BaseRepo[Gender]):

    def __init__(self, session):
        super().__init__(session, Gender)