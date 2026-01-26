from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
import jwt
from backend.extensions import get_redis
from ...config import Config
from backend.routes import get_and_auth_current_user, CurrentUserCheckerDependency, repoDep

router = APIRouter(prefix='/ws')

async def listen_to_user_channel(ws: WebSocket, user, repo):
    channel = f"user:{user.id}"
    pubsub = get_redis().pubsub()
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
async def ws_endpoint(ws: WebSocket, token:str, repo: repoDep):
    current_user = CurrentUserCheckerDependency()
    user = await current_user(token, repo)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    await ws.accept()

    await listen_to_user_channel(ws, user, repo)
    print("asd")



