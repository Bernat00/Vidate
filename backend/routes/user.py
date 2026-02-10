from fastapi import APIRouter, HTTPException, status
from sqlalchemy.util import await_only
from starlette.responses import Response

from backend.persistence.model.report import Report
from backend.persistence.model.user import User
from backend.routes import get_and_auth_current_user, repoDep, get_and_auth_current_admin
from backend.schemas.ban import SetBan
from backend.schemas.report import ReportCreate
from backend.schemas.user import UserOut, UserMe, UserEdit

router = APIRouter(prefix='/users', tags=['user'])


@router.patch('/me')
async def me(new: UserEdit, repo: repoDep, user: get_and_auth_current_user):
    print(new)
    if new.email and (str(new.email) != str(user.email)) and bool(await repo.user_repo.get_by_email(new.email)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered."
        )


    if not user.check_password(new.old_password.get_secret_value()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old password is incorrect."
        )
    if new.password:
        user.password_hash = User.hash_password(new.password)

    if new.email:
        user.email = new.email

    await repo.save(user)

    return UserOut(**user.model_dump())


@router.get('/me')
def me_get(user: get_and_auth_current_user) -> UserMe:
    return UserMe(**user.model_dump())


@router.post('/report/{reported_user_id}', response_model=None)
async def report(report_create: ReportCreate, user: get_and_auth_current_user, repo: repoDep, response: Response):

    if not await repo.conversation_repo.get_by_both_user_ids(report_create.reported_user_id, user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can't report a user you haven't interacted with yet")

    report = Report()
    report.user_id = report_create.reported_user_id
    report.reason = report_create.reason

    await repo.save(report)

    response.status_code = status.HTTP_201_CREATED


@router.post('/ban')
async def set_disabled(ban: SetBan, user: get_and_auth_current_admin, repo: repoDep):
    to_be_set = await repo.user_repo.get_by_id(ban.user_id)
    if not to_be_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

    to_be_set.disabled = ban.value
    await repo.save(to_be_set)


