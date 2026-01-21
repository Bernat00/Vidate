from fastapi import APIRouter

from backend.routes import get_and_auth_current_user, repoDep
from backend.schemas.profile import ProfileCreate
from backend.persistence.model.profile import Profile

router = APIRouter(prefix='/profile', tags=['profile'])


@router.get('/religions')
async def get_religions(repo: repoDep, user: get_and_auth_current_user):
    return await repo.religion_repo.get_all()


@router.get('/languages')
async def get_languages(repo: repoDep, user: get_and_auth_current_user):
    return await repo.language_repo.get_all()


@router.get('/genders')
async def get_genders(repo: repoDep, user: get_and_auth_current_user):
    return await repo.gender_repo.get_all()


@router.get('/mine')
async def get_mine(repo: repoDep, user: get_and_auth_current_user):
    return await repo.profile_repo.get_by_id(user.id)


# todo minden kaka
@router.put('/mine')
async def update_mine(profile_create: ProfileCreate, repo: repoDep, user: get_and_auth_current_user):
    # Capture the user id early to avoid touching an expired instance after commits
    uid = user.id

    profile = await repo.profile_repo.get_by_id(uid)

    if profile:
        data = profile_create.model_dump()
        for k, v in data.items():
            setattr(profile, k, v)
        await repo.save(profile)
    else:
        profile = Profile(user_id=uid, **profile_create.model_dump())
        await repo.save(profile)
        user.is_onboarded = True
        await repo.save(user, refresh=False)


    return profile