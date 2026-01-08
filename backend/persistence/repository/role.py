from sqlalchemy import select

from . import BaseRepo
from ..model.role import Role
from ..model.role import Role


class RoleRepo(BaseRepo[Role]):

    def __init__(self, session):
        super().__init__(session, Role)


    async def get_by_name(self, name: str):
        stmt = select(Role).where(Role.name == name)
        result: Role | None = await self.session.scalar(stmt)
        return result