from backend.routes import repoDep
from ..config import Config
from ..persistence.model.user import User
from ..schemas.auth import Token, TokenData
from ..schemas.user import UserCreate, UserOut

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status, APIRouter, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError



router = APIRouter(prefix='/matches')


@router.get('/mine')
def mine(user: User):
    return UserOut(**user.model_dump()).matches


