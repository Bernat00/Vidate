import asyncio
import json
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from backend.helpers import get_redis
from backend.persistence import engine
from backend.persistence.repository import Repo
from backend.persistence.model.chat_event import ChatEvent
from backend.persistence.model.conversation import Conversation
from backend.persistence.model.profile import Profile
from backend.persistence.model.preferences.preferences import Preference
from sqlalchemy import select, or_
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

            # todo do caching later
            if msg_type == "joined_feed":
                lat = payload.get("lat")
                lon = payload.get("lon")

                async with AsyncSession(engine) as session:
                    repo = Repo(session)

                    # Gather data for matchmaking
                    profile: Profile | None = await repo.profile_repo.get_by_id(user.id)
                    preference: Preference | None = await repo.preference_repo.get_by_id(user.id)

                    # History (last 12h)
                    twelve_hours_ago = datetime.now(timezone.utc) - timedelta(hours=12)
                    stmt = select(Conversation).where(
                        or_(Conversation.user1_id == user.id, Conversation.user2_id == user.id),
                        Conversation.timestamp >= twelve_hours_ago
                    )
                    conversations = (await session.scalars(stmt)).all()

                    history_map = {}
                    for conv in conversations:
                        peer_id = conv.user2_id if conv.user1_id == user.id else conv.user1_id
                        # Timestamp might be creating tz-aware or naive issues depending on DB driver, assume UTC or convert
                        ts = conv.timestamp.replace(tzinfo=timezone.utc).timestamp() if conv.timestamp.tzinfo is None else conv.timestamp.timestamp()

                        if peer_id not in history_map:
                            history_map[peer_id] = {"last_ts": ts, "count": 1}
                        else:
                            entry = history_map[peer_id]
                            entry["count"] += 1
                            if ts > entry["last_ts"]:
                                entry["last_ts"] = ts

                    # Calculate Age
                    age = 0
                    if profile and profile.birth_date:
                        today = datetime.now(timezone.utc).date()
                        born = profile.birth_date.date()
                        age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

                    # Format Data
                    mm_data = {
                        "user_id": user.id,

                        # Profile
                        "gender": str(profile.gender_id) if profile else "",
                        "religion": str(profile.religion_id) if profile and profile.religion_id else "",
                        "is_smoker": str(int(profile.is_smoker)) if profile else "0",
                        "wants_children": str(int(profile.wants_children)) if profile and profile.wants_children is not None else "",
                        "age": age,
                        "languages": ",".join([str(l.id) for l in profile.languages]) if profile and profile.languages else "",

                        # Preferences
                        "pref_genders": ",".join([str(g.id) for g in preference.genders]) if preference and preference.genders else "",
                        "pref_age_min": str(preference.age_min) if preference and preference.age_min is not None else "",
                        "pref_age_max": str(preference.age_max) if preference and preference.age_max is not None else "",
                        "pref_wants_children": str(int(preference.wants_children)) if preference and preference.wants_children is not None else "",
                        "pref_is_smoker": str(int(preference.is_smoker)) if preference and preference.is_smoker is not None else "",
                        "pref_languages": ",".join([str(l.id) for l in preference.languages]) if preference and preference.languages else "",
                        "pref_religions": ",".join([str(r.id) for r in preference.religions]) if preference and preference.religions else "",

                        # System
                        "blocked_ids": "", # Assume empty for now
                        "history_ids": "|".join(history_map.keys()), # Keep for legacy/TagField if needed
                        "history_data": json.dumps(history_map),
                        "joined_at": datetime.now(timezone.utc).timestamp(),
                        "location": f"{lon},{lat}" if lat is not None and lon is not None else "",
                    }

                    # Store in Redis Hash
                    await r.hset(f"mm_entry:{user.id}", mapping=mm_data)

                if lat is not None and lon is not None:
                    await r.geoadd("user_geo", (lon, lat, user.id))

                # ZADD with timestamp
                await r.zadd("matchmaking", {user.id: datetime.now(timezone.utc).timestamp()})

            elif msg_type == "left_feed":
                await r.zrem("matchmaking", user.id)
                await r.delete(f"mm_entry:{user.id}")

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
                        message_payload = json.dumps({
                            "type": msg_type,
                            "payload": chat_event.model_dump(mode="json")
                        })
                        await r.publish(f"user:{recipient_id}", message_payload)
                        await r.publish(f"user:{user.id}", message_payload)

            elif msg_type == "ping":
                continue

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
        await r.delete(f"mm_entry:{user.id}")
        print(f"Cleanup: User {user.id} removed from matchmaking.")