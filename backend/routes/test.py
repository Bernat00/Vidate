from datetime import datetime

import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter, Body, Response
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError

from backend.persistence.model.message import Message
from backend.routes import get_and_auth_current_user, repoDep

router = APIRouter(prefix='/test')


@router.get('/')
async def test(current_user: get_and_auth_current_user):
    return 'success'


