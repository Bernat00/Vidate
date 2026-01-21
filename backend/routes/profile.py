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
async def update_mine(profile: ProfileCreate, repo: repoDep, user: get_and_auth_current_user):
    # Capture the user id early to avoid touching an expired instance after commits
    uid = user.id

    existing = await repo.profile_repo.get_by_id(uid)

    if existing:
        data = profile.model_dump()
        for k, v in data.items():
            setattr(existing, k, v)
        await repo.save(existing)
    else:
        new_profile = Profile(user_id=uid, **profile.model_dump())
        await repo.save(new_profile)

    # mark onboarding complete
    user.is_onboarded = True
    await repo.save(user, refresh=False)

    # Use the captured uid to avoid triggering a lazy refresh on an expired user instance
    return await repo.profile_repo.get_by_id(uid)