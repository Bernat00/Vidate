from sqlalchemy import inspect
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from backend.config import Config
from backend.persistence.model.role import Role
from backend.persistence.model.gender import Gender
from backend.persistence.model.religion import Religion
from backend.persistence.model.language import Language

# Import ALL models so SQLAlchemy knows about them
from backend.persistence.model.user import User
from backend.persistence.model.gender import Gender
from backend.persistence.model.religion import Religion
from backend.persistence.model.language import Language
from backend.persistence.model.profile import Profile
from backend.persistence.model.match import Match
from backend.persistence.model.preferences.preferences import Preference
from backend.persistence.model.preferences.associacions import PreferenceGenderLink, PreferenceLanguageLink, PreferenceReligionLink


engine = create_async_engine(
    str(Config.SQL_ALCHEMY_DATABASE_URL),
    echo=True,
    connect_args={"check_same_thread": False}
)

async def create_db_and_tables():
    async with engine.connect() as conn:
        def check_role_exists(sync_conn):
            inspector = inspect(sync_conn)

            return inspector.has_table("roles")

        table_exists = await conn.run_sync(check_role_exists)


    if table_exists:
        return


    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


    user = Role(name='user')
    admin = Role(name='admin')

    # Create default genders
    male = Gender(name='Male')
    female = Gender(name='Female')

    # Create default religions
    christianity = Religion(name='Christianity')
    islam = Religion(name='Islam')
    hinduism = Religion(name='Hinduism')
    buddhism = Religion(name='Buddhism')
    judaism = Religion(name='Judaism')
    atheism = Religion(name='Atheism')

    # Create default languages
    english = Language(name='English')
    spanish = Language(name='Spanish')
    french = Language(name='French')
    german = Language(name='German')
    chinese = Language(name='Chinese')
    arabic = Language(name='Arabic')
    hindi = Language(name='Hindi')

    async with AsyncSession(engine) as session:
        session.add(admin)
        session.add(user)
        session.add(male)
        session.add(female)
        session.add(christianity)
        session.add(islam)
        session.add(hinduism)
        session.add(buddhism)
        session.add(judaism)
        session.add(atheism)
        session.add(english)
        session.add(spanish)
        session.add(french)
        session.add(german)
        session.add(chinese)
        session.add(arabic)
        session.add(hindi)
        await session.commit()

async def reset_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await create_db_and_tables()