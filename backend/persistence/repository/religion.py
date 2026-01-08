from . import BaseRepo
from ..model.religion import Religion


class ReligionRepo(BaseRepo[Religion]):

    def __init__(self, session):
        super().__init__(session, Religion)