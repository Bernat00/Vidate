from datetime import datetime, timezone
import asyncio
import json
from backend.helpers import get_redis
from backend.persistence import engine
from backend.persistence.repository import Repo
from sqlalchemy.ext.asyncio import AsyncSession
from backend.persistence.model.conversation import Conversation

async def matchmaking_worker():
    print("Matchmaking worker started")
    while True:
        try:
            r = get_redis()
            if not r:
                await asyncio.sleep(1)
                continue

            # Pop top 2 users
            users = await r.zpopmin("matchmaking", count=2)

            if len(users) == 2:
                user1_id, score1 = users[0]
                user2_id, score2 = users[1]

                print(f"Match found: {user1_id} and {user2_id}")

                # Create conversation entry
                async with AsyncSession(engine) as session:
                    repo = Repo(session)

                    # Create conversation
                    conversation = Conversation(
                        user1_id=user1_id,
                        user2_id=user2_id
                    )
                    await repo.conversation_repo.save(conversation)

                    # Fetch basic profiles for frontend display
                    p1 = await repo.profile_repo.get_by_id(user1_id)
                    p2 = await repo.profile_repo.get_by_id(user2_id)

                    # Calculate distance via Redis GEODIST
                    dist = await r.geodist("user_geo", user1_id, user2_id, unit="km")
                    # dist is None if one of the members is missing
                    distance_km = dist if dist is not None else 0.0

                # Prepare payloads
                def make_payload(peer_profile, distance, initiator):
                    if not peer_profile:
                        return {
                            "peer_id": "unknown",
                            "peer_name": "Unknown",
                            "peer_age": 0,
                            "distance_km": distance,
                            "initiator": initiator,
                            "conversation_id": conversation.id if conversation.id else 0
                        }

                    # Calculate age
                    now = datetime.now(timezone.utc)
                    birth_date = peer_profile.birth_date
                    if birth_date.tzinfo is None:
                        birth_date = birth_date.replace(tzinfo=timezone.utc)

                    age = (now - birth_date).days // 365

                    return {
                        "peer_id": peer_profile.user_id,
                        "peer_name": peer_profile.first_name,
                        "peer_age": age,
                        "distance_km": distance,
                        "initiator": initiator,
                        "conversation_id": conversation.id
                    }

                payload1 = make_payload(p2, distance_km, True)
                payload2 = make_payload(p1, distance_km, False)

                await r.publish(f"user:{user1_id}", json.dumps({
                    "type": "match_found",
                    "payload": payload1
                }))
                await r.publish(f"user:{user2_id}", json.dumps({
                    "type": "match_found",
                    "payload": payload2
                }))

            elif len(users) == 1:
                # Put back the single user
                user_id, score = users[0]
                await r.zadd("matchmaking", {user_id: score})
                await asyncio.sleep(1) # Wait for more users
            else:
                await asyncio.sleep(1) # No users

        except Exception as e:
            print(f"Matchmaking error: {e}")
            await asyncio.sleep(1)

