from sqlalchemy import select

from . import BaseRepo
from ..model.report import Report


class ReportRepo(BaseRepo[Report]):

    def __init__(self, session):
        super().__init__(session, Report)



