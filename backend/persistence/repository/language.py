from . import BaseRepo
from ..model.language import Language


class LanguageRepo(BaseRepo[Language]):

    def __init__(self, session):
        super().__init__(session, Language)
