from typing import Annotated
from fastapi import Depends



from ..persistence.repository import Repo, get_repo
repoDep = Annotated[Repo, Depends(get_repo)]



from ..persistence.model.user import User
from .auth import CurrentUserCheckerDependency
get_and_auth_current_user = Annotated[User | None, Depends(CurrentUserCheckerDependency())]
#get_and_auth_current_admin = Annotated[User | None, Depends(CurrentUserCheckerDependency("adnimrole"))]


from fastapi import APIRouter
router = APIRouter(prefix='/api')

from backend.routes.auth import router as auth_router
router.include_router(auth_router, tags=['auth'])

from .test import router as test_router
router.include_router(test_router, tags=['test'])


from .matches import router as matches_router
router.include_router(matches_router, tags=['matches'])


# NEW: include user and profile routers
from .user import router as user_router
router.include_router(user_router, tags=['user'])

from .profile import router as profile_router
router.include_router(profile_router, tags=['profile'])

from .preferences import router as preferences_router
router.include_router(preferences_router, tags=['preferences'])




