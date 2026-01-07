from typing import Annotated

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, status, Depends

from backend.routes.realtime import ConnectionManager

from . import r



router = APIRouter(prefix='/chat')

@router.websocket('/test')
async def test(conn: Annotated[ConnectionManager, Depends(ConnectionManager)]):
    try:
        uid = await conn.connect()
        pubsub = r.pubsub()
        pubsub.subscribe(uid) #aaaaaaaaaa
        pubsub.subscribe('broadcast')

    except WebSocketDisconnect:
        conn.disconnect()