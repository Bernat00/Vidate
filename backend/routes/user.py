from fastapi import APIRouter
from backend.routes import get_and_auth_current_user
from backend.schemas.user import UserOut

router = APIRouter(prefix='/users', tags=['user'])


@router.post('/me')
def me(user: get_and_auth_current_user):
    return UserOut(**user.model_dump())


#todo hol legyen ez meg a change email???