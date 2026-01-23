from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException

from backend.persistence.model.user import User
from backend.routes import CurrentUserCheckerDependency
from backend.routes import get_and_auth_current_user, repoDep
from backend.schemas.profile import ProfileCreate, ReligionCreate, LanguageCreate, GenderCreate
from backend.persistence.model.profile import Profile

router = APIRouter(prefix='/profile', tags=['profile'])


@router.get('/religions')
async def get_religions(repo: repoDep, user: get_and_auth_current_user):
    return await repo.religion_repo.get_all()

@router.post('/religions')
async def post_religions(religion: ReligionCreate, repo: repoDep, user: Annotated[User, Depends(CurrentUserCheckerDependency("admin"))]):
    return await repo.save(**religion.model_dump())

@router.delete('/religions')
async def delete_religions(religion_id: int, repo: repoDep, user: Annotated[User, Depends(CurrentUserCheckerDependency("admin"))]):
    religion = await repo.religion_repo.get_by_id(religion_id)
    if not religion:
        raise HTTPException(status_code=404, detail="Religion not found")

    await repo.delete(religion)

    return 'deleted'




@router.get('/languages')
async def get_languages(repo: repoDep, user: get_and_auth_current_user):
    return await repo.language_repo.get_all()

@router.post('/languages')
async def post_language(language: LanguageCreate, repo: repoDep, user: Annotated[User, Depends(CurrentUserCheckerDependency("admin"))]):
    return await repo.save(**language.model_dump())

@router.delete('/languages')
async def delete_languages(language_id: int, repo: repoDep,
                           user: Annotated[User, Depends(CurrentUserCheckerDependency("admin"))]):
    language = await repo.language_repo.get_by_id(language_id)
    if not language:
        raise HTTPException(status_code=404, detail="Religion not found")

    await repo.delete(language)

    return 'deleted'



@router.get('/genders')
async def get_genders(repo: repoDep, user: get_and_auth_current_user):
    return await repo.gender_repo.get_all()

@router.post('/genders')
async def post_gender(gender: GenderCreate, repo: repoDep, user: Annotated[User, Depends(CurrentUserCheckerDependency("admin"))]):
    return await repo.save(**gender.model_dump())

@router.delete('/genders')
async def delete_genders(gender_id: int, repo: repoDep,
                           user: Annotated[User, Depends(CurrentUserCheckerDependency("admin"))]):
    gender = await repo.gender_repo.get_by_id(gender_id)
    if not gender:
        raise HTTPException(status_code=404, detail="Religion not found")

    await repo.delete(gender)

    return 'deleted'


@router.get('/mine')
async def get_mine(repo: repoDep, user: get_and_auth_current_user):
    return await repo.profile_repo.get_by_id(user.id)

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