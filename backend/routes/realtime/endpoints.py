import asyncio
import json
import random
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Depends
from redis.asyncio import Redis
from backend.helpers import get_redis
from backend.persistence.repository import Repo
from backend.persistence.model.chat_event import ChatEvent
from backend.persistence.model.conversation import Conversation
from backend.persistence.model.profile import Profile
from backend.persistence.model.preferences.preferences import Preference
from sqlalchemy import select, or_, func, case
from sqlalchemy.orm import selectinload
from backend.routes import CurrentUserCheckerDependency, repoDep
from backend.background.matchmaking import attempt_match_for_user, ensure_matchmaking_index

router = APIRouter(prefix='/ws')

async def redis_to_ws_writer(ws: WebSocket, user_id: int, r: Redis):
    channel = f"user:{user_id}"
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


async def ws_to_redis_reader(ws: WebSocket, user_id: int, r: Redis, repo: Repo):
    matchmaking_task: asyncio.Task | None = None

    async def matchmaking_loop():
        await ensure_matchmaking_index(r)
        attempts = 0
        while True:
            if await r.zscore("matchmaking", user_id) is None:
                return
            if not await r.exists(f"mm_entry:{user_id}"):
                await r.zrem("matchmaking", user_id)
                return
            matched = await attempt_match_for_user(r, user_id, repo)
            if matched:
                return
            base_sleep = 1 if attempts < 20 else 3
            await asyncio.sleep(max(0.0, base_sleep + random.uniform(-0.2, 0.2)))
            attempts += 1

    try:
        while True:
            data = await ws.receive_json()
            msg_type = data.get("type")
            payload = data.get("payload", {})

            # todo do caching later
            if msg_type == "joined_feed":
                lat = payload.get("lat")
                lon = payload.get("lon")

                profile: Profile | None = await repo.profile_repo.get_by_id(
                    user_id,
                    options=[selectinload(Profile.languages)]
                )
                preference: Preference | None = await repo.preference_repo.get_by_id(
                    user_id,
                    options=[
                        selectinload(Preference.genders),
                        selectinload(Preference.languages),
                        selectinload(Preference.religions),
                    ]
                )

                one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)

                peer_id_col = case(
                    (Conversation.user1_id == user_id, Conversation.user2_id),
                    else_=Conversation.user1_id
                ).label("peer_id")

                stmt = (
                    select(peer_id_col)
                    .where(
                        or_(Conversation.user1_id == user_id, Conversation.user2_id == user_id),
                        Conversation.timestamp >= one_hour_ago
                    )
                    .group_by(peer_id_col)
                    .having(peer_id_col != user_id)
                    .order_by(func.max(Conversation.timestamp).asc())
                )

                history_ids_list = (await repo.session.execute(stmt)).scalars().all()

                today = datetime.now(timezone.utc).date()
                born = profile.birth_date.date()
                age = today.year - born.year - ((today.month, today.day) < (born.month, born.day))

                # If user has no gender preferences, fetch all genders from DB (meaning "open to all")
                if preference and preference.genders:
                    pref_genders_str = ",".join([str(g.id) for g in preference.genders])
                else:
                    # Empty preference means "all genders" - fetch all gender IDs from database
                    all_genders = await repo.gender_repo.get_all()
                    pref_genders_str = ",".join([str(g.id) for g in all_genders])

                mm_data = {
                    "user_id": user_id,

                    "gender": str(profile.gender_id) if profile else "",
                    "religion": str(profile.religion_id) if profile and profile.religion_id else "",
                    "is_smoker": str(int(profile.is_smoker)) if profile else "0",
                    "wants_children": str(int(profile.wants_children)) if profile and profile.wants_children is not None else "",
                    "age": age,
                    "languages": ",".join([str(l.id) for l in profile.languages]) if profile and profile.languages else "",

                    "pref_genders": pref_genders_str,
                    "pref_age_min": str(preference.age_min) if preference and preference.age_min is not None else "",
                    "pref_age_max": str(preference.age_max) if preference and preference.age_max is not None else "",
                    "pref_wants_children": str(int(preference.wants_children)) if preference and preference.wants_children is not None else "",
                    "pref_is_smoker": str(int(preference.is_smoker)) if preference and preference.is_smoker is not None else "",
                    "pref_languages": ",".join([str(l.id) for l in preference.languages]) if preference and preference.languages else "",
                    "pref_religions": ",".join([str(r.id) for r in preference.religions]) if preference and preference.religions else "",

                    "blocked_ids": "", # todo
                    "history_ids": "|".join(history_ids_list), # Redis TagField, ordered by oldest first in the window
                    "joined_at": datetime.now(timezone.utc).timestamp(),
                }

                await r.hset(f"mm_entry:{user_id}", mapping=mm_data)

                if lat is not None and lon is not None:
                    await r.geoadd("user_geo", (lon, lat, user_id))

                await r.zadd("matchmaking", {user_id: datetime.now(timezone.utc).timestamp()})

                if matchmaking_task and not matchmaking_task.done():
                    matchmaking_task.cancel()
                matchmaking_task = asyncio.create_task(matchmaking_loop())

            elif msg_type == "left_feed":
                if matchmaking_task and not matchmaking_task.done():
                    matchmaking_task.cancel()
                await r.zrem("matchmaking", user_id)
                await r.zrem("user_geo", user_id)
                await r.delete(f"mm_entry:{user_id}")

            elif msg_type in ["offer", "answer", "ice_candidate", "end_call"]:
                peer_id = payload.get("peer_id")
                if peer_id:
                    await r.publish(f"user:{peer_id}", json.dumps({
                        "type": msg_type,
                        "payload": payload
                    }))

            elif msg_type == "chat_message":
                match_id = payload.get("match_id")
                recipient_id = payload.get("recipient_id")

                if match_id and recipient_id:
                    chat_event = ChatEvent(
                        type="message",
                        match_id=match_id,
                        originator_id=user_id,
                        recipient_id=recipient_id,
                        content=payload.get("content")
                    )

                    await repo.chat_event_repo.save(chat_event)
                    message_payload = json.dumps({
                        "type": msg_type,
                        "payload": chat_event.model_dump(mode="json")
                    })
                    await r.publish(f"user:{recipient_id}", message_payload)
                    await r.publish(f"user:{user_id}", message_payload)

            elif msg_type == "ping":
                continue

    except (WebSocketDisconnect, asyncio.CancelledError):
        pass
    finally:
        if matchmaking_task and not matchmaking_task.done():
            matchmaking_task.cancel()
            try:
                await matchmaking_task
            except asyncio.CancelledError:
                pass


@router.websocket('/main')
async def ws_endpoint(ws: WebSocket, token: str, r: Redis = Depends(get_redis), repo: repoDep = None):
    current_user = CurrentUserCheckerDependency()
    user = await current_user(token, repo)

    if not user:
        await ws.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = user.id
    await ws.accept()

    writer_task = asyncio.create_task(redis_to_ws_writer(ws, user_id, r))
    reader_task = asyncio.create_task(ws_to_redis_reader(ws, user_id, r, repo))

    try:
        _done, _pending = await asyncio.wait(
            [writer_task, reader_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
    except Exception as e:
        print(f"WS Error for User {user_id}: {e}")
    finally:
        for task in [writer_task, reader_task]:
            if not task.done():
                task.cancel()

        await r.zrem("matchmaking", user_id)
        await r.zrem("user_geo", user_id)
        await r.delete(f"mm_entry:{user_id}")
        print(f"Cleanup: User {user_id} removed from matchmaking.")
