import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter, Body, Response
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError

from backend.persistence.model.message import Message
from backend.routes import get_and_auth_current_user, repoDep

router = APIRouter(prefix='/test')


@router.get('/')
async def test(current_user: get_and_auth_current_user):
    return 'success'


@router.get('/2')
async def test2(current_user: get_and_auth_current_user, repo: repoDep):
    message = Message()
    message.match_id = 0
    message.originator_id = 0
    message.recipient_id = 0
    message.content = "test"
    await repo.save(message)

    return await repo.chat_event_repo.get_by_match_id(0)

