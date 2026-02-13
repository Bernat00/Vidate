from datetime import datetime

import jwt
from fastapi import Depends, FastAPI, HTTPException, status, APIRouter, Body, Response


from backend.persistence.model.chat_event import ChatEvent
from backend.routes import get_and_auth_current_user, repoDep

router = APIRouter(prefix='/test')


@router.get('')
async def test(current_user: get_and_auth_current_user):
    return 'success'


@router.get('/2')
async def test2(repo: repoDep):
    msg = ChatEvent(type = "message")
    msg.match_id = 1
    msg.originator_id = 1
    msg.recipient_id = 1
    msg.content = "asfsafs"


    await repo.save(msg)

    return await repo.chat_event_repo.get_all()


