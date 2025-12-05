import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter, Body, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError

from backend.routes import get_and_auth_current_user


router = APIRouter(prefix='/test')


@router.get('/')
async def test(current_user: get_and_auth_current_user):
    return 'success'