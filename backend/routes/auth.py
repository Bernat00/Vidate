from pydantic import SecretStr, EmailStr
from sqlalchemy.util import await_only

from backend.routes import repoDep
from ..config import Config
from ..persistence.model.user import User
from ..schemas.auth import Token, TokenData
from ..schemas.user import UserCreate

from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status, APIRouter, Body, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError



router = APIRouter(prefix='/auth')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/token')


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=60)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    return encoded_jwt


class CurrentUserCheckerDependency:
    def __init__(self, role=None):
        if role:
            raise NotImplementedError('Checking the role is not yet implemented.')

    async def __call__(self, token: Annotated[str, Depends(oauth2_scheme)], repo: repoDep):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
            id = payload.get("sub")

            if id is None:
                raise credentials_exception

            token_data = TokenData(id=id) #todo why was this in the demo? it literally does nothing

        except InvalidTokenError:
            raise credentials_exception

        user = await repo.user_repo.get_by_id(token_data.id)

        if user is None:
            raise credentials_exception
        return user



@router.post('/register')
async def register(repo: repoDep, userCreate: UserCreate, response: Response) -> None:
    print(userCreate.email)
    print(userCreate.password)

    if await repo.user_repo.get_by_email(userCreate.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered."
        )

    user = User(**userCreate.model_dump(), password_hash=User.hash_password(userCreate.password))

    await repo.save(user)
    response.status = status.HTTP_201_CREATED




@router.post('/token')
async def token(repo: repoDep,
                form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                ) -> Token:
    user = await repo.user_repo.get_by_email(form_data.username)
    if not user or not user.check_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=timedelta(minutes=10))

    return Token(access_token=access_token, token_type="bearer")