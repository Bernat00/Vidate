from pydantic import EmailStr

from . import BaseRepo
from ..model.user import User
from sqlalchemy import select, ScalarResult
from typing import Sequence


class UserRepo(BaseRepo[User]):
    
    def __init__(self, session):
        super().__init__(session, User)



    async def get_by_email(self, email: EmailStr) -> User | None:
        stmt = select(User).where(User.email == email)
        result: User | None = await self.session.scalar(stmt)
        return result


