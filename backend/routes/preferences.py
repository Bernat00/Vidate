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
    
    existing = await repo.preference_repo.get_by_id(uid)
    
    if existing:
        # Update existing preferences
        existing.wants_children = preference.wants_children
        existing.is_smoker = preference.is_smoker
        
        # Update many-to-many relationships
        existing.genders = await asyncio.gather(*[repo.gender_repo.get_by_id(gid) for gid in preference.gender_ids])
        existing.languages = await asyncio.gather(*[repo.language_repo.get_by_id(lid) for lid in preference.language_ids])
        existing.religions = await asyncio.gather(*[repo.religion_repo.get_by_id(rid) for rid in preference.religion_ids])
        
        await repo.save(existing)
    else:
        # Create new preferences
        new_pref = Preference(
            user_id=uid,
            wants_children=preference.wants_children,
            is_smoker=preference.is_smoker,
        )
        # Set relationships
        new_pref.genders = await asyncio.gather(*[repo.gender_repo.get_by_id(gid) for gid in preference.gender_ids])
        new_pref.languages = await asyncio.gather(*[repo.language_repo.get_by_id(lid) for lid in preference.language_ids])
        new_pref.religions = await asyncio.gather(*[repo.religion_repo.get_by_id(rid) for rid in preference.religion_ids])
        
        await repo.save(new_pref)
    
    return await repo.preference_repo.get_by_id(uid)