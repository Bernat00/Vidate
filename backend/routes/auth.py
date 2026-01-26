from backend.routes import repoDep
from ..config import Config
from ..persistence.model.user import User
from ..schemas.auth import Token, TokenData
from ..schemas.user import UserCreate

from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import jwt
from fastapi import Depends, HTTPException, status, APIRouter, Response, Query
from fastapi.logger import logger
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError



router = APIRouter(prefix='/auth')

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/token', auto_error=False)


def decode_token(token: str, credentials_exception: Exception) -> TokenData:
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
    except jwt.exceptions.DecodeError:
        raise credentials_exception

    id = payload.get("sub")

    if id is None:
        raise credentials_exception

    return TokenData(user_id=id)


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=60)):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, Config.JWT_SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
    return encoded_jwt


credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_token(
        header_token: Annotated[Optional[str], Depends(oauth2_scheme)],
        query_token = Query(default=None, alias="token"),
) -> str:
    if header_token:
        return header_token
    if query_token:
        return query_token

    raise credentials_exception



class CurrentUserCheckerDependency:
    def __init__(self, role=None):
        self.role_name = role


    async def __call__(self, token: Annotated[str, Depends(get_token)], repo: repoDep):
        try:
            token_data = decode_token(token, credentials_exception)

        except InvalidTokenError:
            raise credentials_exception

        user = await repo.user_repo.get_by_id(token_data.user_id)

        if user is None:
            raise credentials_exception


        if self.role_name:
            role = await repo.role_repo.get_by_name(self.role_name)
            if role is None:
                raise ValueError(f'no such a role ({self.role_name})')

            if user.role_id != role.id:
                raise credentials_exception


        return user



@router.post('/register')
async def register(repo: repoDep, userCreate: UserCreate, response: Response) -> None:
    if await repo.user_repo.get_by_email(userCreate.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered."
        )

    user = User(**userCreate.model_dump(), password_hash=User.hash_password(userCreate.password))
    logger.info(f'New user registered:\n{user.email}')

    await repo.save(user)
    response.status_code = status.HTTP_201_CREATED




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