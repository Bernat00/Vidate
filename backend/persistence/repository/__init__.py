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
from .match import MatchRepo
from .profile import ProfileRepo
from .gender import GenderRepo
from .religion import ReligionRepo
from .language import LanguageRepo

class Repo(BasicRepo):
    def __init__(self, session: AsyncSession):
        super().__init__(session)


    _user_repo: UserRepo = None
    _mach_repo: MatchRepo = None
    _profile_repo: ProfileRepo = None
    _language_repo: LanguageRepo = None
    _gender_repo: GenderRepo = None
    _religion_repo: ReligionRepo = None


    @property
    def user_repo(self) -> UserRepo:
        if not self._user_repo:
            self._user_repo = UserRepo(self.session)
        return self._user_repo

    @property
    def mach_repo(self) -> MatchRepo:
        if not self._mach_repo:
            self._mach_repo = MatchRepo(self.session)
        return self._mach_repo

    @property
    def profile_repo(self) -> ProfileRepo:
        if not self._profile_repo:
            self._profile_repo = ProfileRepo(self.session)
        return self._profile_repo

    @property
    def language_repo(self) -> LanguageRepo:
        if not self._language_repo:
            self._language_repo = LanguageRepo(self.session)
        return self._language_repo

    @property
    def gender_repo(self) -> GenderRepo:
        if not self._gender_repo:
            self._gender_repo = GenderRepo(self.session)
        return self._gender_repo

    @property
    def religion_repo(self) -> ReligionRepo:
        if not self._religion_repo:
            self._religion_repo = ReligionRepo(self.session)
        return self._religion_repo

