from typing import Any, Generic, List, Optional, Sequence, Type, TypeVar
from functools import cached_property

from sqlalchemy import Row, RowMapping, inspect
from sqlmodel import SQLModel, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.interfaces import ORMOption

from .. import engine

T = TypeVar("T", bound=SQLModel)

async def get_repo():
    async with AsyncSession(engine) as session:
        yield Repo(session)


class BasicRepo:
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
        options: Sequence[ORMOption] = None,
        for_update = False
    ) -> Optional[T]:
        """
        Retrieves an entity by ID.

        :param for_update: if you want to select for update
        :param id: The primary key (or tuple for composite keys).
        :param options: SQLAlchemy loader options (e.g., selectinload, joinedload)
        """

        return await self.session.get(self.model, id, options=options, with_for_update=for_update)


    async def get_by_id_list(self, id_list: list[Any], options: Sequence[ORMOption] = None, for_update = False) -> List[T]:
        """
            Retrieves multiple entites by IDs.
            WARNING this only works with non-composite primary keys!!!
            :param for_update: if you want for update
            :param id_list: The primary keys.
            :param options: SQLAlchemy loader options (e.g., selectinload, joinedload)
        """

        pk = inspect(self.model).primary_key[0]

        stmt = select(self.model).where(pk.in_(id_list))

        if for_update:
            stmt = stmt.with_for_update()


        result = await self.session.scalars(stmt)
        return result.unique().all()


    async def get_all(self, options: Sequence[ORMOption] = None, for_update = False) -> Sequence[Row[Any] | RowMapping | Any]:
        stmt = select(self.model)
        if options:
            stmt = stmt.options(*options)

        if for_update:
            stmt = stmt.with_for_update()

        result = await self.session.scalars(stmt)
        return result.unique().all()


class HasTwoUsersRepo(BaseRepo[T], Generic[T]):
    """
    Made for models with a user1_id and a user2_id filed
    """

    async def get_by_both_user_ids(self, id1: str, id2:str, options: Sequence[ORMOption] = None, for_update=False) -> T | None:
        stmt = (
            select(self.model).where(
                ((self.model.user1_id == id1) & (self.model.user2_id == id2)) | ((self.model.user1_id == id2) & (self.model.user2_id == id1))) #todo ezt refactoralni
        )

        if options:
            stmt = stmt.options(*options)

        if for_update:
            stmt = stmt.with_for_update()


        return await self.session.scalar(stmt)



from .user import UserRepo
from .match import MatchRepo
from .profile import ProfileRepo
from .gender import GenderRepo
from .religion import ReligionRepo
from .language import LanguageRepo
from .role import RoleRepo
from .preference import PreferenceRepo
from .chat_event import ChatEventRepo
from .conversation import ConversationRepo
from .report import ReportRepo




class Repo(BasicRepo):
    def __init__(self, session: AsyncSession):
        super().__init__(session)

    @cached_property
    def user_repo(self) -> UserRepo:
        return UserRepo(self.session)

    @cached_property
    def match_repo(self) -> MatchRepo:
        return MatchRepo(self.session)

    @cached_property
    def profile_repo(self) -> ProfileRepo:
        return ProfileRepo(self.session)

    @cached_property
    def language_repo(self) -> LanguageRepo:
        return LanguageRepo(self.session)

    @cached_property
    def gender_repo(self) -> GenderRepo:
        return GenderRepo(self.session)

    @cached_property
    def religion_repo(self) -> ReligionRepo:
        return ReligionRepo(self.session)

    @cached_property
    def role_repo(self) -> RoleRepo:
        return RoleRepo(self.session)

    @cached_property
    def preference_repo(self) -> PreferenceRepo:
        return PreferenceRepo(self.session)

    @cached_property
    def chat_event_repo(self) -> ChatEventRepo:
        return ChatEventRepo(self.session)

    @cached_property
    def conversation_repo(self) -> ConversationRepo:
        return ConversationRepo(self.session)

    @cached_property
    def report_repo(self) -> ReportRepo:
        return ReportRepo(self.session)



