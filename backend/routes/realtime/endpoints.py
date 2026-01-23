import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, status, Depends

import jwt

from ...config import Config

router = APIRouter(prefix='/ws')



@router.websocket('/main')
async def ws_endpoint(ws: WebSocket, token: str = None):
    await ws.accept()
    if not jwt:
        await ws.close(1001, "No JWT provided")
    user_id = None
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        user_id = payload.get("sub")
    except jwt.exceptions.DecodeError:
        await ws.close(1001, "Invalid JWT provided")

    if not user_id:
        await ws.close(1001, "Invalid JWT provided")

    print(user_id)

    await asyncio.sleep(100000)






