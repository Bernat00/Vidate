from . import BaseRepo
from ..model.one_time_access_token import OneTimeAccessToken


class OneTimeAccessTokenRepo(BaseRepo[OneTimeAccessToken]):

    def __init__(self, session):
        super().__init__(session, OneTimeAccessToken)
