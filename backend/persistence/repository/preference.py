from . import BaseRepo
from ..model.preferences.preferences import Preference

class PreferenceRepo(BaseRepo[Preference]):

    def __init__(self, session):
        super().__init__(session, Preference)

