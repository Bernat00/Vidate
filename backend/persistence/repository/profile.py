from . import BaseRepo
from ..model.profile import Profile


class ProfileRepo(BaseRepo[Profile]):

    def __init__(self, session):
        super().__init__(session, Profile)