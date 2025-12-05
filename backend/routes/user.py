from fastapi import APIRouter
from backend.routes import get_and_auth_current_user


router = APIRouter(prefix='/users', tags=['user'])


@router.post('/me')
def me(user: get_and_auth_current_user):
    return user


#todo hol legyen ez meg a change email???