from backend.routes import repoDep
from ..config import Config
from ..helpers import get_redis
from ..persistence.model.user import User
from ..persistence.repository import Repo
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

    return TokenData(user_id=id, type=payload.get("type"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
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


def get_token_or_none(
        header_token: Annotated[Optional[str], Depends(oauth2_scheme)],
        query_token = Query(default=None, alias="token"),
    ) -> str | None:
    try:
        return get_token(header_token, query_token)
    except credentials_exception:
        return None




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


async def create_one_time_access_token(data, expires_delta: Optional[timedelta] = None) -> str:
    token = create_access_token(data, expires_delta)
    await get_redis().set(f'otat:{token}', "asd", ex=expires_delta)
    return token


async def use_one_time_access_token(token: str):
    try:
        r = get_redis()

        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])

        otat = await r.getdel(f'otat:{token}')
        if not otat:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token already used')

        return payload

    except jwt.exceptions.DecodeError:
        raise credentials_exception





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



@router.post('/register-admin')
async def register_admin(token: str, repo: repoDep, userCreate: UserCreate, response: Response) -> None:
    if await repo.user_repo.get_by_email(userCreate.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered."
        )

    token_payload = await use_one_time_access_token(token)

    if token_payload.get('type') != 'register-admin':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Wrong token')


    user = User(**userCreate.model_dump(), password_hash=User.hash_password(userCreate.password))
    user.role_id = (await repo.role_repo.get_by_name('admin')).id
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
    access_token = create_access_token(data={"sub": user.id})

    return Token(access_token=access_token, token_type="bearer")



@router.get('/register-admin-token')
async def get_register_admin_token(user: Annotated[User | None, Depends(CurrentUserCheckerDependency("admin"))], repo: repoDep) -> str:
        return await create_one_time_access_token(data={"sub": 'special', 'type': 'register-admin'}, expires_delta=timedelta(minutes=30)) #todo kitalalni mennyi legyen a lejarati ido
