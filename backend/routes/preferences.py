import asyncio
from fastapi import APIRouter
from fastapi import HTTPException, status
from . import get_and_auth_current_user, repoDep
from ..schemas.preference import PreferenceCreate, PreferenceRead
from ..persistence.model.preferences.preferences import Preference


router = APIRouter(prefix='/preferences', tags=['preferences'])


@router.get('/', response_model=PreferenceRead)
async def get_preferences(user: get_and_auth_current_user, repo: repoDep):
    preferences = await repo.preference_repo.get_by_id(user.id)
    if not preferences:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Preferences not found")

    return PreferenceRead(
        **preferences.model_dump(),
        genders=preferences.genders,
        religions=preferences.religions,
        languages=preferences.languages,
    )


@router.put('/', response_model=PreferenceRead)
async def update_preferences(preference: PreferenceCreate, repo: repoDep, user: get_and_auth_current_user):
    uid = user.id
    
    pref_orm = await repo.preference_repo.get_by_id(uid)
    
    if not pref_orm:
        pref_orm = Preference(user_id=uid)

    # Simple assignment; validation (e.g., ranges) can be added at schema/validator level if needed
    pref_orm.age_min = preference.age_min
    pref_orm.age_max = preference.age_max
    pref_orm.wants_children = preference.wants_children
    pref_orm.is_smoker = preference.is_smoker

    pref_orm.genders = await repo.gender_repo.get_by_id_list(preference.gender_ids or [])
    pref_orm.languages = await repo.language_repo.get_by_id_list(preference.language_ids or [])
    pref_orm.religions = await repo.religion_repo.get_by_id_list(preference.religion_ids or [])

    await repo.save(pref_orm)


    return PreferenceRead(**pref_orm.model_dump(),
                          genders=pref_orm.genders, religions=pref_orm.religions,
                          languages=pref_orm.languages)