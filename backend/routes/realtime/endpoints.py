import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from backend.helpers import get_redis
from backend.persistence import engine
from backend.persistence.repository import Repo
from backend.routes import CurrentUserCheckerDependency

router = APIRouter(prefix='/ws')

async def redis_to_ws_writer(ws: WebSocket, user, r: Redis):
    channel = f"user:{user.id}"
    pubsub = r.pubsub()
    await pubsub.subscribe(channel)
    try:
        async for message in pubsub.listen():
            if message.get("type") != "message":
                continue
            payload = message.get("data")
            await ws.send_text(payload)
    except (WebSocketDisconnect, asyncio.CancelledError):
        pass
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.aclose()


async def ws_to_redis_reader(ws: WebSocket, user, r: Redis):
    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")

            if msg_type == "joined_feed":
                await r.sadd("matchmaking", user.id)

            elif msg_type == "left_feed":
                await r.srem("matchmaking", user.id)

            elif msg_type == "chat_message":
                # await r.publish(f"user:{data['to']}", json.dumps(data))
                pass

    except (WebSocketDisconnect, asyncio.CancelledError):
        pass


@router.websocket('/main')
async def ws_endpoint(ws: WebSocket, token: str, r: Redis = Depends(get_redis)):
    async with AsyncSession(engine) as session:
        repo = Repo(session)
        current_user = CurrentUserCheckerDependency()
        user = await current_user(token, repo)

    if not user:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await ws.accept()

    writer_task = asyncio.create_task(redis_to_ws_writer(ws, user, r))
    reader_task = asyncio.create_task(ws_to_redis_reader(ws, user, r))

    try:
        done, pending = await asyncio.wait(
            [writer_task, reader_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
    except Exception as e:
        print(f"WS Error for User {user.id}: {e}")
    finally:
        for task in [writer_task, reader_task]:
            if not task.done():
                task.cancel()

        await r.srem("matchmaking", user.id)
        print(f"Cleanup: User {user.id} removed from matchmaking.")