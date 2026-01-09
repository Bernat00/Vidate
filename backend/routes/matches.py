import uuid

from watchfiles import awatch

from backend.routes import repoDep
from ..config import Config
from ..persistence.model.match import Match
from ..persistence.model.user import User
from . import repoDep
from ..schemas.auth import Token, TokenData
from ..schemas.user import UserCreate, UserOut

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status, APIRouter, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError


from . import get_and_auth_current_user


router = APIRouter(prefix='/matches')


@router.get('/mine') #todo atgondolni ezt hova rakjam, kene egy masik ami a matcheket adja nem a matchelt usereket
async def mine(repo: repoDep, user: get_and_auth_current_user):
    users = await  repo.user_repo.get_matched_users(user.id)
    print(users)
    return [UserOut(**user.model_dump()) for user in users]



@router.post('/match')
async def match(userid: str, repo: repoDep, user: get_and_auth_current_user) -> Match:
    to_match = await repo.user_repo.get_by_id(userid)
    if not to_match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return await repo.match_repo.match(user, to_match)


@router.delete('/match')
async def match(match_id: str, repo: repoDep, user: get_and_auth_current_user):
    match = await repo.match_repo.get_by_id(match_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found.")

    if match.user2_id != user.id and match.user2_id != user.id: #todo ide kell adminnak is engedely?
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You cant delete this match.")


    await repo.match_repo.delete(match)
