from typing import Annotated
from fastapi import Depends
from ..persistence.repository import Repo, get_repo

repoDep = Annotated[Repo, Depends(get_repo)]


from fastapi import APIRouter
from backend.routes import auth

router = APIRouter('/api')
router.include_router(auth.router, tags=['auth'])


