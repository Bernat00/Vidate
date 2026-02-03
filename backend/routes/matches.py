import asyncio

from typing_extensions import deprecated

from . import repoDep
from ..persistence.model.match import Match
from ..persistence.repository.match import SameValueError
from ..schemas.chat_event import ChatEventOut
from ..schemas.profile import ProfileRead

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from fastapi import HTTPException, status, APIRouter


from . import get_and_auth_current_user


router = APIRouter(prefix='/matches')


class MatchResponse(BaseModel):
    profile: ProfileRead
    matched_at: datetime
    match_id: int


@router.get('/mine', response_model=List[MatchResponse])
async def mine(repo: repoDep, user: get_and_auth_current_user):
    profiles = await  repo.profile_repo.get_matched_profiles(user.id)
    print(profiles)
    return profiles


@router.get('/profile/{partner_id}', response_model=MatchResponse)
async def get_match_profile(partner_id: str, repo: repoDep, user: get_and_auth_current_user):
    profile = await repo.profile_repo.get_matched_profile(user.id, partner_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match profile not found")
    return profile


@deprecated(
        """
        this endpoint is deprecated and will be removed
        """
    )
@router.get('/all')
async def all(repo: repoDep, user: get_and_auth_current_user):
    return await repo.match_repo.get_by_user_id(user.id)



@router.post('/match')
async def match(userid: str, repo: repoDep, user: get_and_auth_current_user) -> Match:
    to_match = await repo.user_repo.get_by_id(userid)
    if not to_match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    try:
        return await repo.match_repo.match(user, to_match)
    except SameValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.delete('/match')
async def match(match_id: str, repo: repoDep, user: get_and_auth_current_user):
    match = await repo.match_repo.get_by_id(match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found.")

    if not (match.user1_id == user.id or match.user2_id == user.id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You cant delete this match.")


    await repo.match_repo.delete(match)

    return 'deleted'


@router.get('/{match_id}/events', response_model=List[ChatEventOut])
async def get_match_events(
    match_id: int,
    repo: repoDep,
    user: get_and_auth_current_user,
    last_id: Optional[int] = None
):
    match = await repo.match_repo.get_by_id(match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if user.id not in [match.user1_id, match.user2_id]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed to view these events")

    return await repo.chat_event_repo.get_paginated_by_match_id(match_id, last_id=last_id)
