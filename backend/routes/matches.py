from typing_extensions import deprecated

import json
from . import repoDep
from ..persistence.model.match import Match
from backend.errors import SameValueError, MatchAlreadyConfirmedError
from ..schemas.chat_event import ChatEventOut
from ..schemas.profile import ProfileRead

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from ..persistence.model.conversation import Conversation
from ..persistence.model.profile import Profile

from fastapi import HTTPException, status, APIRouter, Depends
from backend.helpers import get_redis
from redis.asyncio import Redis

from . import get_and_auth_current_user


router = APIRouter(prefix='/matches')


class MatchResponse(BaseModel):
    profile: ProfileRead
    matched_at: datetime
    match_id: int
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None

class FeedbackRequest(BaseModel):
    partner_id: str
    liked: bool


@router.get('/mine', response_model=List[MatchResponse])
async def mine(repo: repoDep, user: get_and_auth_current_user):
    profiles = await  repo.profile_repo.get_matched_profiles(user.id)
    print(profiles)
    return profiles


@router.get('/match-profile/{partner_id}', response_model=MatchResponse)
async def get_match_profile(partner_id: str, repo: repoDep, user: get_and_auth_current_user):
    profile = await repo.profile_repo.get_matched_profile(user.id, partner_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match profile not found")
    return profile



@router.post('/match')
async def match(userid: str, repo: repoDep, user: get_and_auth_current_user, r: Redis = Depends(get_redis)) -> Match:
    to_match = await repo.user_repo.get_by_id(userid)
    if not to_match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    current_user_id = user.id

    try:
        m = await repo.match_repo.match(user, to_match)
        if m.confirmed:
            # Notify both users
            my_profile = await repo.profile_repo.get_by_id(current_user_id)
            peer_profile = await repo.profile_repo.get_by_id(userid)

            # To the peer
            await r.publish(f"user:{userid}", json.dumps({
                "type": "match_confirmed",
                "payload": {
                    "peer_id": current_user_id,
                    "peer_name": my_profile.first_name if my_profile else "Someone",
                    "match_id": m.id
                }
            }))
            # To the current user
            await r.publish(f"user:{current_user_id}", json.dumps({
                "type": "match_confirmed",
                "payload": {
                    "peer_id": userid,
                    "peer_name": peer_profile.first_name if peer_profile else "Someone",
                    "match_id": m.id
                }
            }))
            print("published match confirmation")
        return m
    except SameValueError as err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(err))


@router.delete('/match')
async def match(match_id: int, repo: repoDep, user: get_and_auth_current_user):
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


@router.post('/feedback')
async def feedback(
    req: FeedbackRequest,
    repo: repoDep,
    user: get_and_auth_current_user,
    r: Redis = Depends(get_redis)
):
    if not req.liked:
        return {"status": "ok"}

    # 1. Verify conversation

    conversation = await repo.conversation_repo.get_by_both_user_ids(user.id, req.partner_id)

    if not conversation:
        raise HTTPException(status_code=400, detail="No conversation found between users")

    # 2. MATCH Logic using MatchRepo
    to_match = await repo.user_repo.get_by_id(req.partner_id)
    if not to_match:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        # MatchRepo.match handles creation (sorted IDs) or confirmation
        current_match = await repo.match_repo.match(user, to_match)

    except MatchAlreadyConfirmedError:
        return {"status": "already_matched"}

    except SameValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

    if current_match.confirmed:
        # Match was just confirmed

        current_user_id = user.id
        my_profile = await repo.profile_repo.get_by_id(current_user_id)
        peer_profile = await repo.profile_repo.get_by_id(req.partner_id)

        # Notify both users
        # To the peer
        await r.publish(f"user:{req.partner_id}", json.dumps({
            "type": "match_confirmed",
            "payload": {
                "peer_id": current_user_id,
                "peer_name": my_profile.first_name if my_profile else "Someone",
                "match_id": current_match.id
            }
        }))
        # To the current user
        await r.publish(f"user:{current_user_id}", json.dumps({
            "type": "match_confirmed",
            "payload": {
                "peer_id": req.partner_id,
                "peer_name": peer_profile.first_name if peer_profile else "Someone",
                "match_id": current_match.id
            }
        }))

        return {"status": "matched"}

    return {"status": "pending"}


@router.get('/feedback-profile/{partner_id}', response_model=ProfileRead)
async def get_feedback_profile(partner_id: str, repo: repoDep, user: get_and_auth_current_user):
    # Ensure users have had a conversation

    conversation = await repo.conversation_repo.get_by_both_user_ids(user.id, partner_id)

    if not conversation:
        raise HTTPException(status_code=400, detail="No conversation found between users")

    profile = await repo.profile_repo.get_by_id(
        partner_id,
        options=[
            selectinload(Profile.gender),
            selectinload(Profile.religion),
            selectinload(Profile.languages)
        ]
    )

    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return profile
