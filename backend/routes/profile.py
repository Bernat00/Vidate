from fastapi import APIRouter
from backend.routes import get_and_auth_current_user, repoDep
from backend.schemas.user import UserOut

router = APIRouter(prefix='/profile', tags=['user'])


@router.get('/available-religions')
def me(repo: repoDep, user: get_and_auth_current_user):
    return repo.


@router.get('/available-languages')
def me(repo: repoDep, user: get_and_auth_current_user):
    return UserOut(**user.model_dump())


@router.get('/available-genders')
def me(repo: repoDep, user: get_and_auth_current_user):
    return UserOut(**user.model_dump())