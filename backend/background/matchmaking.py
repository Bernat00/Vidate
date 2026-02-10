from datetime import datetime, timezone
import asyncio
import json
from backend.helpers import get_redis
from backend.persistence import engine
from backend.persistence.repository import Repo
from sqlalchemy.ext.asyncio import AsyncSession
from backend.persistence.model.conversation import Conversation
from redis.commands.search.query import Query
from redis.commands.search.field import TagField, NumericField, GeoField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

async def matchmaking_worker():
    print("Matchmaking worker started")

    # Ensure Index Exists
    r_init = get_redis()
    if r_init:
        try:
            schema = (
                TagField("gender", separator=","),
                TagField("pref_genders", separator=","),
                TagField("languages", separator=","),
                TagField("blocked_ids", separator="|"),
                TagField("history_ids", separator="|"),
                NumericField("joined_at", sortable=True),
                NumericField("age", sortable=True),
                GeoField("location"),
                TagField("religion"),
                TagField("is_smoker"),
                TagField("wants_children"),
            )
            await r_init.ft("idx:matchmaking").create_index(
                schema,
                definition=IndexDefinition(prefix=["mm_entry:"], index_type=IndexType.HASH)
            )
            print("Created RediSearch index")
        except Exception:
            # Index likely already exists
            pass

    while True:
        try:
            r = get_redis()
            if not r:
                await asyncio.sleep(1)
                continue

            # Pop 1 user (Initiator)
            users = await r.zpopmin("matchmaking", count=1)

            if not users:
                await asyncio.sleep(1)
                continue

            user1_id, score1 = users[0]

            # Fetch Initiator Data
            user_data = await r.hgetall(f"mm_entry:{user1_id}")
            if not user_data:
                # Ghost user?
                await r.zrem("matchmaking", user1_id)
                continue

            # Parse attributes
            my_gender = user_data.get('gender', '')
            my_prefs_genders = user_data.get('pref_genders', '').split(",") if user_data.get('pref_genders') else []
            my_blocked = user_data.get('blocked_ids', '').split("|")

            # Parse History Data
            my_history_data = {}
            if user_data.get('history_data'):
                try:
                    my_history_data = json.loads(user_data.get('history_data'))
                except:
                    pass
            # Legacy fallback
            my_history_ids = user_data.get('history_ids', '').split("|")

            age_min_str = user_data.get('pref_age_min')
            my_age_min = int(age_min_str) if age_min_str else 18

            age_max_str = user_data.get('pref_age_max')
            my_age_max = int(age_max_str) if age_max_str else 99

            # --- BUILD QUERY ---
            filters = []

            # 1. HARD: Gender
            if my_prefs_genders:
                filters.append(f"@gender:{{{'|'.join(my_prefs_genders)}}}")

            # 2. HARD: Reverse Gender (They must want me)
            if my_gender:
                filters.append(f"@pref_genders:{{{my_gender}}}")

            # 3. HARD: Reversed Blocked (They must not strictly block me)
            # Checking if THEY blocked ME. stored in THEIR blocked_ids
            filters.append(f"-@blocked_ids:{{{user1_id}}}")

            # 4. HARD: Age
            filters.append(f"@age:[{my_age_min} {my_age_max}]")

            # 5. HARD: Exclude Self
            # Handled in loop or via negate ? -@user_id is tricky without index.
            # We will handle in loop.

            query_str = " ".join(filters)

            q = Query(query_str)\
                .return_fields("user_id", "joined_at", "age", "location", "gender", "languages", "religion", "is_smoker", "wants_children")\
                .sort_by("joined_at", asc=True)\
                .paging(0, 20)\
                .dialect(2)

            res = await r.ft("idx:matchmaking").search(q)

            matched_user_id = None
            dist = 0.0

            # Evaluate Candidates
            # We want to find the best one that we can lock.
            candidates = []

            # My attributes for matching
            my_langs = set(user_data.get('languages', '').split(",")) if user_data.get('languages') else set()
            my_religion = user_data.get('religion')
            my_smoker = user_data.get('is_smoker')
            my_kids = user_data.get('wants_children')

            for doc in res.docs:
                uid = doc.user_id
                if uid == user1_id:
                    continue

                # Check My Blocklist
                if uid in my_blocked:
                    continue

                # --- SCORING ---
                score = 0

                # 1. History Penalty (Most Important Soft)
                if uid in my_history_data:
                    h_info = my_history_data[uid]
                    last_ts = h_info.get("last_ts", 0)
                    count = h_info.get("count", 1)

                    now_ts = datetime.now(timezone.utc).timestamp()
                    diff_seconds = max(0, now_ts - last_ts)
                    diff_minutes = diff_seconds / 60

                    # Formula: High penalty that decays with time
                    # (50,000 * count) / (minutes + 1)
                    # Example: 0 min, 1 chat -> -50,000
                    # Example: 60 min, 1 chat -> ~ -820
                    history_penalty = (50000 * count) / (diff_minutes + 1)
                    score -= history_penalty

                elif uid in my_history_ids: # Fallback
                    score -= 5000

                # 2. Common Language (Important)
                cand_langs = set(doc.languages.split(",")) if hasattr(doc, 'languages') and doc.languages else set()
                if not my_langs.isdisjoint(cand_langs):
                    # They share at least one language
                    score += 2000

                # 3. Distance (Important)
                dist = 0
                if hasattr(doc, 'location') and doc.location and user_data.get('location'):
                    try:
                         d = await r.geodist("user_geo", user1_id, uid, unit="km")
                         if d is not None:
                             dist = d
                             score -= d # -1 point per km
                    except:
                        pass

                # 4. Lifestyle (Less Important)
                # Religion
                if my_religion and hasattr(doc, 'religion') and doc.religion == my_religion:
                    score += 100
                # Smoker
                if my_smoker and hasattr(doc, 'is_smoker') and doc.is_smoker == my_smoker:
                    score += 100
                # Kids
                if my_kids and hasattr(doc, 'wants_children') and doc.wants_children == my_kids:
                    score += 100

                candidates.append((uid, score, dist))

            # Sort by score desc
            candidates.sort(key=lambda x: x[1], reverse=True)

            # Try to lock
            for cand_id, _, dist_val in candidates:
                # Attempt atomic remove
                removed = await r.zrem("matchmaking", cand_id)
                if removed > 0:
                    matched_user_id = cand_id
                    dist = dist_val # store for payload
                    break

            if matched_user_id:
                user2_id = matched_user_id
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

                # Prepare payloads
                def make_payload(peer_profile, distance_km, initiator_bool):
                    if not peer_profile:
                         return {
                            "peer_id": "unknown",
                            "conversation_id": conversation.id
                        }

                    # Age calc
                    age = 0
                    if peer_profile.birth_date:
                        now = datetime.now(timezone.utc)
                        bd = peer_profile.birth_date
                        if bd.tzinfo is None: bd = bd.replace(tzinfo=timezone.utc)
                        age = (now - bd).days // 365

                    return {
                        "peer_id": peer_profile.user_id,
                        "peer_name": peer_profile.first_name,
                        "peer_age": age,
                        "distance_km": distance_km,
                        "initiator": initiator_bool,
                        "conversation_id": conversation.id
                    }

                payload1 = make_payload(p2, dist, True)
                payload2 = make_payload(p1, dist, False)

                await r.publish(f"user:{user1_id}", json.dumps({
                    "type": "match_found",
                    "payload": payload1
                }))
                await r.publish(f"user:{user2_id}", json.dumps({
                    "type": "match_found",
                    "payload": payload2
                }))

                # Clean up mm_entries?
                # Usually we remove them from matchmaking (Already done via zrem)
                # And remove from geo?
                # The ws_endpoint handles cleanup on disconnect.
                # Should we remove them from feed visually? Frontend will likely navigate away.
                # But if they come back?
                # We leave "mm_entry" and "user_geo" until they disconnect or "left_feed".

            else:
                # No match found, put back
                await r.zadd("matchmaking", {user1_id: score1})
                await asyncio.sleep(0.5)

        except Exception as e:
            print(f"Matchmaking error: {e}")
            await asyncio.sleep(1)

