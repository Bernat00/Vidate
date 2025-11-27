from fastapi import APIRouter, Body, HTTPException
from pydantic import SecretStr

from . import repoDep
from ..persistence.model.user import User
from ..schemas.user import UserCreate
from  typing import Annotated

router = APIRouter(prefix='/auth')



@router.post('/register')
async def register(repo: repoDep, userCreate: Annotated[UserCreate, Body(embed=True)]):
    try:
        user = User(**userCreate.model_dump(),password_hash=User.hash_password(userCreate.password))

        await repo.save(user)
        return user
    except Exception as e:
        print(e)
        raise HTTPException(status_code=406)


@router.post('/login')
async def login(repo: repoDep, id: Annotated[str, Body(embed=True)], pswd: Annotated[SecretStr, Body(embed=True)]): #todo do it from jwt
    user = await repo.user_repo.get_by_id(id)
    if not user or not user.check_password(pswd):
        raise HTTPException(status_code=401, detail="Incorrect Username or Password")

    return user
