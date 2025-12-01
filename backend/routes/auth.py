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



router = APIRouter(prefix='/auth')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/token')


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=60)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], repo: repoDep): #todo ezt belerakni egy claaasba
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email)

    except InvalidTokenError:
        raise credentials_exception

    user = await repo.user_repo.get_by_email(token_data.email)

    if user is None:

        raise credentials_exception
    return user


@router.post('/register')
async def register(repo: repoDep, userCreate: Annotated[UserCreate, Body(embed=True)], response: Response) -> None:
    try:
        user = User(**userCreate.model_dump(), password_hash=User.hash_password(userCreate.password))

        await repo.save(user)
        response.status = status.HTTP_201_CREATED

    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)


@router.post('/token')
async def token(repo: repoDep,
                form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                ) -> Token:
    user = await repo.user_repo.get_by_email(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=timedelta(minutes=10))

    return Token(access_token=access_token, token_type="bearer")