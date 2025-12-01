from . import repoDep
from ..config import Config
from ..persistence.model.user import User
from ..persistence.repository import Repo
from ..schemas.auth import Token, TokenData
from ..schemas.user import UserCreate

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter, Body, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError

from . import current_user_dep


router = APIRouter(prefix='/test')


@router.get('/')
async def test(current_user: current_user_dep):
    return current_user