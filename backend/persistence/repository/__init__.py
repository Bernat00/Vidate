from typing import Any, Generic, List, Optional, Sequence, Type, TypeVar, Coroutine

from sqlalchemy import Row, RowMapping
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.interfaces import ORMOption

from .. import engine

T = TypeVar("T", bound=SQLModel)

async def get_repo():
    async with AsyncSession(engine) as session:
        yield Repo(session)


class BasicRepo: #lehet kicsit kaka a nev
    session: AsyncSession

    def __init__(self, session: AsyncSession):
        self.session = session


    async def save(self, model: T, refresh: bool = True) -> T:
        self.session.add(model)
        await self.session.commit()

        if refresh:
            await self.session.refresh(model)

        return model


    async def delete(self, model: T) -> None:
        await self.session.delete(model)
        await self.session.commit()



class BaseRepo(Generic[T], BasicRepo):
    def __init__(self, session: AsyncSession, model_cls: Type[T]):
        super().__init__(session)
        self.model = model_cls

    async def get_by_id(
        self,
        id: Any,
        options: Sequence[ORMOption] = None
    ) -> Optional[T]:
        """
        Retrieves an entity by ID.

        :param id: The primary key (or tuple for composite keys).
        :param options: SQLAlchemy loader options (e.g., selectinload, joinedload)
        """

        return await self.session.get(self.model, id, options=options)


    async def get_all(self, options: Sequence[ORMOption] = None) -> Sequence[Row[Any] | RowMapping | Any]:
        stmt = select(self.model)
        if options:
            stmt = stmt.options(*options)

        result = await self.session.scalars(stmt)
        return result.all()




from .user import UserRepo

class Repo(BasicRepo):

    @property
    def UserRepo(self) -> UserRepo:
        if not self.UserRepo:
            self.UserRepo = UserRepo(self.session)
        return self.UserRepo

