import asyncio
from fastapi import APIRouter
from . import get_and_auth_current_user, repoDep
from ..schemas.preference import PreferenceCreate
from ..persistence.model.preferences.preferences import Preference


router = APIRouter(prefix='/preferences', tags=['preferences'])


@router.get('/')
async def get_preferences(user: get_and_auth_current_user, repo: repoDep):
    preferences = await repo.preference_repo.get_by_id(user.id)
    return preferences


@router.put('/')
async def update_preferences(preference: PreferenceCreate, repo: repoDep, user: get_and_auth_current_user):
    uid = user.id
    
    pref_orm = await repo.preference_repo.get_by_id(uid)
    
    if not pref_orm:
        pref_orm = Preference(user_id=uid)

    pref_orm.wants_children = preference.wants_children
    pref_orm.is_smoker = preference.is_smoker

    pref_orm.genders = await repo.gender_repo.get_by_id_list(preference.gender_ids)
    pref_orm.languages = await repo.language_repo.get_by_id_list(preference.language_ids)
    pref_orm.religions = await repo.religion_repo.get_by_id_list(preference.religion_ids)

    await repo.save(pref_orm)

    
    return pref_orm