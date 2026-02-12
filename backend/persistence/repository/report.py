from sqlalchemy import select, func

from . import BaseRepo
from ..model.report import Report


class ReportRepo(BaseRepo[Report]):

    def __init__(self, session):
        super().__init__(session, Report)

    async def get_reported_users_summary(self):
        stmt = (
            select(Report.user_id, func.count(Report.id).label("report_count"))
            .group_by(Report.user_id)
            .order_by(func.count(Report.id).desc())
        )
        result = await self.session.execute(stmt)
        return result.all()

    async def get_by_reported_id(self, user_id: str):
        stmt = select(Report).where(Report.user_id == user_id).order_by(Report.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()
