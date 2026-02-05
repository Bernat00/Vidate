import asyncio
import json
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from backend.helpers import get_redis
from backend.persistence import engine
from backend.persistence.repository import Repo
from backend.persistence.model.chat_event import ChatEvent
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
            payload = data.get("payload", {})

            if msg_type == "joined_feed":
                lat = payload.get("lat")
                lon = payload.get("lon")
                if lat is not None and lon is not None:
                    await r.geoadd("user_geo", (lon, lat, user.id))

                # ZADD with timestamp
                await r.zadd("matchmaking", {user.id: datetime.now(timezone.utc).timestamp()})

            elif msg_type == "left_feed":
                await r.zrem("matchmaking", user.id)

            elif msg_type in ["offer", "answer", "ice_candidate", "end_call"]:
                peer_id = payload.get("peer_id")
                if peer_id:
                    # Forward signaling message to peer
                    await r.publish(f"user:{peer_id}", json.dumps({
                        "type": msg_type,
                        "payload": payload
                    }))

            elif msg_type == "chat_message":
                match_id = payload.get("match_id")
                recipient_id = payload.get("recipient_id")

                if match_id and recipient_id:
                    async with AsyncSession(engine) as session:
                        repo = Repo(session)

                        chat_event = ChatEvent(
                            type="message",
                            match_id=match_id,
                            originator_id=user.id,
                            recipient_id=recipient_id,
                            content=payload.get("content")
                        )

                        await repo.chat_event_repo.save(chat_event)
                        print("saved chat event")
                        await r.publish(f"user:{recipient_id}", json.dumps({
                            "type": msg_type,
                            "payload": chat_event.model_dump(mode="json")
                        }))

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

        await r.zrem("matchmaking", user.id)
        await r.zrem("user_geo", user.id)
        print(f"Cleanup: User {user.id} removed from matchmaking.")