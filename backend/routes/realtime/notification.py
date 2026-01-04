from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, status

from backend.routes import get_and_auth_current_user
from backend.routes.realtime import manager

router = APIRouter(prefix='/notifications')

@router.websocket('/test')
async def test(websocket: WebSocket): #todo nem ferni hozza a headerekhez a szaros jsben (ha jol ertem)
    await manager.connect(websocket)
    try:
        while True:
            await manager.send({'message': 'hello'}, websocket)
            #await websocket.receive_json()
    except WebSocketDisconnect:
        manager.disconnect(websocket)