import smtplib
from datetime import timedelta
from email.message import EmailMessage

from fastapi import APIRouter, HTTPException, status
from starlette.responses import Response

from backend.config import Config
from backend.persistence.model.report import Report
from backend.persistence.model.user import User
from backend.routes import get_and_auth_current_user, repoDep, get_and_auth_current_admin
from backend.routes.auth import create_one_time_access_token, use_one_time_access_token
from backend.schemas.ban import SetBan
from backend.schemas.report import ReportCreate
from backend.schemas.user import UserOut, UserMe, UserEdit, PasswordReset, ResetEmail

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
async def me_get(user: get_and_auth_current_user, repo: repoDep) -> UserMe:
    role = await repo.role_repo.get_by_id(user.role_id)
    role_name = role.name if role else "user"

    return UserMe(
        id=user.id,
        email=user.email,
        created_at=user.created_at,
        updated_at=user.updated_at,
        disabled=user.disabled,
        is_onboarded=user.is_onboarded,
        role_name=role_name
    )


@router.post('/report', response_model=None)
async def report(report_create: ReportCreate, user: get_and_auth_current_user, repo: repoDep, response: Response):
    if user.id == report_create.reported_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot report yourself")


    if not await repo.conversation_repo.get_by_both_user_ids(report_create.reported_user_id, user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot report a user you haven't interacted with yet")

    report = Report()
    report.user_id = report_create.reported_user_id
    report.reporter_id = user.id
    report.reason = report_create.reason

    await repo.save(report)

    response.status_code = status.HTTP_201_CREATED


@router.post('/ban')
async def set_disabled(ban: SetBan, user: get_and_auth_current_admin, repo: repoDep):
    to_be_set = await repo.user_repo.get_by_id(ban.user_id)
    if not to_be_set:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

    if to_be_set.id == user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot ban yourself")

    to_be_set.disabled = ban.value
    await repo.save(to_be_set)


@router.get('/reports')
async def get_reports(user: get_and_auth_current_admin, repo: repoDep):
    return await repo.report_repo.get_all()


@router.get('/reported-summary')
async def get_reported_summary(user: get_and_auth_current_admin, repo: repoDep):
    summary = await repo.report_repo.get_reported_users_summary()
    # Join with user info to make it useful
    detailed_summary = []
    for user_id, count in summary:
        u = await repo.user_repo.get_by_id(user_id)
        if u:
            detailed_summary.append({
                "user_id": user_id,
                "email": u.email,
                "report_count": count,
                "disabled": u.disabled
            })
    return detailed_summary


@router.get('')
async def get_all_users(user: get_and_auth_current_admin, repo: repoDep):
    return await repo.user_repo.get_all()



def send_reset_email(to_email: str, reset_link: str):
    msg = EmailMessage()
    msg["Subject"] = "Reset your password"
    msg["To"] = to_email
    msg.set_content(
        f"Click the link below to reset your password:\n\n{reset_link}\n\n"
        "If you didn't request this, you can ignore this email."
    )

    try:
        with smtplib.SMTP_SSL(Config.SMTP_HOST) as server:
            server.login(Config.SMTP_EMAIL, Config.SMTP_PASSWORD)
            server.send_message(msg)
    except Exception as e:
        print(e)



@router.post('/send-reset-email')
async def reset_email(reset_email: ResetEmail, repo: repoDep):
    user = await repo.user_repo.get_by_email(reset_email.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

    token =  await create_one_time_access_token( {'sub':'special', 'type': 'password-reset', 'user_id': user.id}, timedelta(minutes=5))

    send_reset_email(str(reset_email.email), 'nagyondaddress?token=' + token) #todo kell frontend link


@router.post('/reset-password')
async def reset_password(token: str, psw_reset: PasswordReset, repo: repoDep):
    payload = await use_one_time_access_token(token)
    if not payload.get('type') == 'password-reset':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Password reset token is invalid')

    user = await repo.user_repo.get_by_id(payload.get('user_id', failobj=''))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User does not exist")

    user.password_hash = user.hash_password(psw_reset.password)
    await repo.save(user)
