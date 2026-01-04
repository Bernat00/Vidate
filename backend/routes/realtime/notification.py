from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, status

from backend.routes import get_and_auth_current_user
from backend.routes.realtime import manager

router = APIRouter(prefix='/notifications')

@router.websocket('/test')
async def test(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await manager.send({'message': 'hello'}, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)