from fastapi import APIRouter, HTTPException, status

from backend.persistence.model.user import User
from backend.routes import get_and_auth_current_user, repoDep
from backend.schemas.user import UserOut, UserMe, UserEdit

router = APIRouter(prefix='/users', tags=['user'])


@router.patch('/me')
async def me(new: UserEdit, repo: repoDep, user: get_and_auth_current_user):
    print(new)
    if new.email and (new.email != user.email) and bool(await repo.user_repo.get_by_email(new.email)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered."
        )

    if new.email:
        user.email = new.email

    if new.password:
        # Require and validate old password before changing
        if not new.old_password or not user.check_password(new.old_password.get_secret_value()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Old password is incorrect."
            )
        user.password_hash = User.hash_password(new.password)
    # Persist any changes to the database
    await repo.save(user)

    return UserOut(**user.model_dump())


@router.get('/me')
def me_get(user: get_and_auth_current_user) -> UserMe:
    return UserMe(**user.model_dump())
