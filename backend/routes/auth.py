from fastapi import APIRouter, Body
from . import repoDep
from ..persistence.model.user import User
from ..schemas.user import UserCreate
from  typing import Annotated

router = APIRouter(prefix='/auth')



@router.post('/register')
async def register(repo: repoDep, userCreate: Annotated[UserCreate, Body(embed=True)]):
    user = User()
    user.email = userCreate.email
    user.password = userCreate.password
    #todo make User(**userCreate) work, handle db errors

    await repo.save(user)
    return user
