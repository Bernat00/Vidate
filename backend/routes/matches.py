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


@router.get('/mine')
async def mine(repo: repoDep, user: get_and_auth_current_user):
    users = await  repo.user_repo.get_matched_users(user.id)
    print(users)
    return [UserOut(**user.model_dump()) for user in users]


