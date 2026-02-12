from sqlalchemy import select, func

from . import BaseRepo
from ..model.report import Report


class ReportRepo(BaseRepo[Report]):

    def __init__(self, session):
        super().__init__(session, Report)

    async def get_reported_users_summary(
        self,
        disabled: bool | None = None,
        page: int = 1,
        limit: int = 10
    ):
        from ..model.user import User

        # Base query for joining User and counting Reports
        stmt = (
            select(
                User.id.label("user_id"),
                User.email,
                User.disabled,
                func.count(Report.id).label("report_count")
            )
            .join(Report, User.id == Report.user_id)
            .group_by(User.id)
            .order_by(func.count(Report.id).desc())
        )

        if disabled is not None:
            stmt = stmt.where(User.disabled == disabled)

        # Clone query for total count (needed for pagination)
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.session.execute(count_stmt)
        total_count = total_result.scalar() or 0

        # Apply pagination
        stmt = stmt.offset((page - 1) * limit).limit(limit)

        result = await self.session.execute(stmt)
        items = [
            {
                "user_id": row.user_id,
                "email": row.email,
                "disabled": row.disabled,
                "report_count": row.report_count
            }
            for row in result.all()
        ]

        return items, total_count

    async def get_by_reported_id(self, user_id: str):
        stmt = select(Report).where(Report.user_id == user_id).order_by(Report.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()
