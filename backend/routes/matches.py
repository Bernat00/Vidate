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
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from ..persistence.model.conversation import Conversation
from ..persistence.model.profile import Profile

from fastapi import HTTPException, status, APIRouter


from . import get_and_auth_current_user


router = APIRouter(prefix='/matches')


class MatchResponse(BaseModel):
    profile: ProfileRead
    matched_at: datetime
    match_id: int

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


@deprecated(
        """
        this endpoint is deprecated and will be removed
        """
    )
@router.get('/all')
async def all(repo: repoDep, user: get_and_auth_current_user):
    pass # existing code...


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


@router.post('/feedback')
async def feedback(
    req: FeedbackRequest,
    repo: repoDep,
    user: get_and_auth_current_user
):
    if not req.liked:
        return {"status": "ok"}

    # 1. Verify conversation
    stmt = select(Conversation).where(
        or_(
            and_(Conversation.user1_id == user.id, Conversation.user2_id == req.partner_id),
            and_(Conversation.user1_id == req.partner_id, Conversation.user2_id == user.id)
        )
    )
    result = await repo.session.scalars(stmt)
    conversation = result.first()

    if not conversation:
        # For development/testing, maybe beneficial to allow match even without conversation?
        # The prompt says: "the users can only match if they have had a conversation."
        # strict enforcement.
        raise HTTPException(status_code=400, detail="No conversation found between users")

    # 2. Check for existing match initiated by partner
    stmt = select(Match).where(
        Match.user1_id == req.partner_id,
        Match.user2_id == user.id
    )
    result = await repo.session.scalars(stmt)
    existing_match = result.first()

    if existing_match:
        if not existing_match.confirmed:
            existing_match.confirmed = True
            await repo.save(existing_match)
            return {"status": "matched"}
        else:
             return {"status": "already_matched"}

    # 3. Check if I already initiated (duplicate request)
    stmt = select(Match).where(
        Match.user1_id == user.id,
        Match.user2_id == req.partner_id
    )
    result = await repo.session.scalars(stmt)
    my_match = result.first()

    if not my_match:
        # Create new pending match
        new_match = Match(
            user1_id=user.id,
            user2_id=req.partner_id,
            confirmed=False
        )
        await repo.save(new_match)
        return {"status": "pending"}

    return {"status": "pending"}


@router.get('/feedback-profile/{partner_id}', response_model=ProfileRead)
async def get_feedback_profile(partner_id: str, repo: repoDep, user: get_and_auth_current_user):
    # Ensure users have had a conversation
    stmt = select(Conversation).where(
        or_(
            and_(Conversation.user1_id == user.id, Conversation.user2_id == partner_id),
            and_(Conversation.user1_id == partner_id, Conversation.user2_id == user.id)
        )
    )
    result = await repo.session.scalars(stmt)
    conversation = result.first()

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
