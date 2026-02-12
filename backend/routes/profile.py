from fastapi import APIRouter, HTTPException
from sqlalchemy import select, func

from backend.helpers import copy_non_none_fields
from backend.persistence.model.gender import Gender
from backend.persistence.model.language import Language
from backend.persistence.model.religion import Religion
from backend.persistence.model.preferences.associacions import PreferenceGenderLink, PreferenceLanguageLink, PreferenceReligionLink
from backend.routes import get_and_auth_current_admin
from backend.routes import get_and_auth_current_user, repoDep
from backend.schemas.profile import ProfileCreate, ReligionCreate, LanguageCreate, GenderCreate
from backend.persistence.model.profile import Profile, ProfileLanguageLink

router = APIRouter(prefix='/profile', tags=['profile'])


@router.get('/religions')
async def get_religions(repo: repoDep, user: get_and_auth_current_user):
    return await repo.religion_repo.get_all()

@router.post('/religions')
async def post_religions(religion: ReligionCreate, repo: repoDep, user: get_and_auth_current_admin):
    return await repo.save(Religion(**religion.model_dump()))

@router.delete('/religions')
async def delete_religions(religion_id: int, repo: repoDep, user: get_and_auth_current_admin):
    religion = await repo.religion_repo.get_by_id(religion_id)
    if not religion:
        raise HTTPException(status_code=404, detail="Religion not found")

    # Check usage in Profile
    profile_usage = await repo.session.execute(select(func.count()).select_from(Profile).where(Profile.religion_id == religion_id))
    if profile_usage.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete religion: it is currently used by one or more users.")

    # Check usage in Preference
    pref_usage = await repo.session.execute(select(func.count()).select_from(PreferenceReligionLink).where(PreferenceReligionLink.religion_id == religion_id))
    if pref_usage.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete religion: it is currently a preference for one or more users.")

    await repo.delete(religion)

    return 'deleted'


@router.put('/religions')
async def update_religions(religion_id: int, religion_data: ReligionCreate, repo: repoDep, user: get_and_auth_current_admin):
    religion = await repo.religion_repo.get_by_id(religion_id)
    if not religion:
        raise HTTPException(status_code=404, detail="Religion not found")
    religion.name = religion_data.name
    return await repo.save(religion)




@router.get('/languages')
async def get_languages(repo: repoDep, user: get_and_auth_current_user):
    return await repo.language_repo.get_all()

@router.post('/languages')
async def post_language(language: LanguageCreate, repo: repoDep, user: get_and_auth_current_admin):
    return await repo.save(Language(**language.model_dump()))

@router.delete('/languages')
async def delete_languages(language_id: int, repo: repoDep,
                           user: get_and_auth_current_admin):
    language = await repo.language_repo.get_by_id(language_id)
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")

    # Check usage in Profile
    profile_usage = await repo.session.execute(select(func.count()).select_from(ProfileLanguageLink).where(ProfileLanguageLink.language_id == language_id))
    if profile_usage.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete language: it is currently used by one or more users.")

    # Check usage in Preference
    pref_usage = await repo.session.execute(select(func.count()).select_from(PreferenceLanguageLink).where(PreferenceLanguageLink.language_id == language_id))
    if pref_usage.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete language: it is currently a preference for one or more users.")

    await repo.delete(language)

    return 'deleted'


@router.put('/languages')
async def update_languages(language_id: int, language_data: LanguageCreate, repo: repoDep, user: get_and_auth_current_admin):
    language = await repo.language_repo.get_by_id(language_id)
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    language.name = language_data.name
    return await repo.save(language)



@router.get('/genders')
async def get_genders(repo: repoDep, user: get_and_auth_current_user):
    return await repo.gender_repo.get_all()

@router.post('/genders')
async def post_gender(gender: GenderCreate, repo: repoDep, user: get_and_auth_current_admin):
    return await repo.save(Gender(**gender.model_dump()))   #todo uniqe test (lehetne try-cath-el is)

@router.delete('/genders')
async def delete_genders(gender_id: int, repo: repoDep,
                           user: get_and_auth_current_admin):
    gender = await repo.gender_repo.get_by_id(gender_id)
    if not gender:
        raise HTTPException(status_code=404, detail="Gender not found")

    # Check usage in Profile
    profile_usage = await repo.session.execute(select(func.count()).select_from(Profile).where(Profile.gender_id == gender_id))
    if profile_usage.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete gender: it is currently used by one or more users.")

    # Check usage in Preference
    pref_usage = await repo.session.execute(select(func.count()).select_from(PreferenceGenderLink).where(PreferenceGenderLink.gender_id == gender_id))
    if pref_usage.scalar() > 0:
        raise HTTPException(status_code=400, detail="Cannot delete gender: it is currently a preference for one or more users.")

    await repo.delete(gender)

    return 'deleted'



@router.get('/mine')
async def get_mine(repo: repoDep, user: get_and_auth_current_user):
    return await repo.profile_repo.get_by_id(user.id)

@router.put('/mine')
async def update_mine(profile: ProfileCreate, repo: repoDep, user: get_and_auth_current_user):
    # Capture the user id early to avoid touching an expired instance after commits
    uid = user.id

    updated = await repo.profile_repo.get_by_id(uid)

    if updated is None:
        updated = Profile(user_id=uid, **profile.model_dump())

    copy_non_none_fields(profile, updated)
    # Explicitly handle nullable fields that copy_non_none_fields might skip
    updated.religion_id = profile.religion_id
    updated.middle_name = profile.middle_name
    updated.wants_children = profile.wants_children

    updated.languages = await repo.language_repo.get_by_id_list(profile.language_ids or [])


    await repo.save(updated)


    # mark onboarding complete
    user.is_onboarded = True
    await repo.save(user, refresh=False)

    # Use the captured uid to avoid triggering a lazy refresh on an expired user instance
    return await repo.profile_repo.get_by_id(uid)