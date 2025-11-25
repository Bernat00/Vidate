from fastapi import APIRouter, Body
from . import repoDep
from ..persistence.model.user import User
from ..schemas.user import UserCreate
from  typing import Annotated

router = APIRouter('/auth')



@router.get('/login')
async def login(repo: repoDep, userCreate: Annotated[UserCreate, Body(embed=True)]):
    user = User()
    user.email = userCreate.email
    user.password = userCreate.password

    await repo.save(user)
    return user
