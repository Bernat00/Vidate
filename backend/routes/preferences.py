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


router = APIRouter(prefix='/preferences', tags=['preferences'])




@router.get('/')
async def get_preferences(user: get_and_auth_current_user, repo: repoDep):
    preferences =  repo.preference_repo.get_by_id(user.id)
    return preferences




