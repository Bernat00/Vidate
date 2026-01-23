from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import jwt

from ...config import Config
from ...app import r

router = APIRouter(prefix='/ws')

async def listen_to_user_channel(ws: WebSocket, user_id: str):
    channel = f"user:{user_id}"
    pubsub = r.pubsub()
    await pubsub.subscribe(channel)
    try:
        async for message in pubsub.listen():
            if message.get("type") != "message":
                continue
            payload = message.get("data")
            await ws.send_text(payload)
    except (WebSocketDisconnect, RuntimeError):
        pass
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.aclose()

@router.websocket('/main')
async def ws_endpoint(ws: WebSocket, token: str = None):
    await ws.accept()
    if not token:
        await ws.close(1001, "No JWT provided")
        return
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        user_id = payload.get("sub")
    except jwt.exceptions.DecodeError:
        await ws.close(1001, "Invalid JWT provided")
        return

    if not user_id:
        await ws.close(1001, "Invalid JWT provided")
        return

    await listen_to_user_channel(ws, user_id)
