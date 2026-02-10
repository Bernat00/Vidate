import sys
import math
from datetime import datetime, timezone
import asyncio
import json
from backend.persistence.repository import Repo
from backend.persistence.model.conversation import Conversation
from redis.commands.search.query import Query
from redis.commands.search.field import TagField, NumericField, GeoField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

_INDEX_READY = False
_INDEX_LOCK = asyncio.Lock()

_LUA_CLAIM_PAIR = """
if ARGV[1] == ARGV[2] then
  return 0
end
local s1 = redis.call('zscore', KEYS[1], ARGV[1])
local s2 = redis.call('zscore', KEYS[1], ARGV[2])
if s1 and s2 then
  redis.call('zrem', KEYS[1], ARGV[1], ARGV[2])
  return 1
end
return 0
"""

_TAG_SPECIAL_CHARS = set(",.<>:{}[]\"'`;!@#$%^&*()-+=~|?/\\ ")


def _escape_tag_value(value: str) -> str:
    if not value:
        return ""
    escaped = []
    for ch in value:
        if ch in _TAG_SPECIAL_CHARS:
            escaped.append("\\" + ch)
        else:
            escaped.append(ch)
    return "".join(escaped)


async def ensure_matchmaking_index(r):
    global _INDEX_READY
    if _INDEX_READY:
        return
    async with _INDEX_LOCK:
        if _INDEX_READY:
            return
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
            await r.ft("idx:matchmaking").create_index(
                schema,
                definition=IndexDefinition(prefix=["mm_entry:"], index_type=IndexType.HASH)
            )
        except Exception:
            # Index likely already exists
            pass
        _INDEX_READY = True


async def _try_claim_pair(r, user1_id: str, user2_id: str) -> bool:
    result = await r.eval(_LUA_CLAIM_PAIR, 1, "matchmaking", user1_id, user2_id)
    return result == 1


async def _build_candidates(r, user_id: str, user_data: dict) -> list[tuple[str, float, float]]:
    # Parse attributes
    my_gender = user_data.get("gender", "")
    my_prefs_genders = user_data.get("pref_genders", "").split(",") if user_data.get("pref_genders") else []
    my_blocked = user_data.get("blocked_ids", "").split("|")

    # Parse History Data
    my_history_ids = [hid for hid in user_data.get("history_ids", "").split("|") if hid]

    age_min_str = user_data.get("pref_age_min")
    my_age_min = int(age_min_str) if age_min_str else None

    age_max_str = user_data.get("pref_age_max")
    my_age_max = int(age_max_str) if age_max_str else None

    # --- BUILD QUERY ---
    filters = []

    if my_prefs_genders:
        gender_terms = [
            _escape_tag_value(g) for g in my_prefs_genders if g
        ]
        if gender_terms:
            filters.append(f"@gender:{{{'|'.join(gender_terms)}}}")

    if my_gender:
        filters.append(f"@pref_genders:{{{_escape_tag_value(my_gender)}}}")

    # They must not have blocked me
    filters.append(f"-@blocked_ids:{{{_escape_tag_value(user_id)}}}")

    query_str = " ".join(filters)

    q = (
        Query(query_str)
        .return_fields("user_id", "joined_at", "age", "location", "gender", "languages", "religion", "is_smoker", "wants_children")
        .sort_by("joined_at", asc=True)
        .paging(0, 20)
        .dialect(2)
    )

    res = await r.ft("idx:matchmaking").search(q)

    candidates: list[tuple[str, float, float]] = []

    # My attributes for matching
    my_langs = set(user_data.get("languages", "").split(",")) if user_data.get("languages") else set()
    my_pref_religions = set(user_data.get("pref_religions", "").split(",")) if user_data.get("pref_religions") else set()
    my_pref_is_smoker = user_data.get("pref_is_smoker") if user_data.get("pref_is_smoker") else ""
    my_pref_wants_children = user_data.get("pref_wants_children") if user_data.get("pref_wants_children") else ""

    for doc in res.docs:
        uid = doc.user_id
        if uid == user_id:
            continue

        if uid in my_blocked:
            continue

        score = 0

        # History penalty (ranking-based)
        if uid in my_history_ids:
            # my_history_ids is ordered oldest first.
            # penalty is higher for more recent ones.
            idx = my_history_ids.index(uid)
            penalty = (idx + 1) * 10000
            score -= penalty

        # Age bonus with deviation penalty
        if hasattr(doc, "age") and (my_age_min is not None or my_age_max is not None):
            try:
                cand_age = int(doc.age)
                min_bound = my_age_min if my_age_min is not None else -sys.maxsize
                max_bound = my_age_max if my_age_max is not None else sys.maxsize
                if min_bound <= cand_age <= max_bound:
                    score += 5000
                else:
                    if cand_age < min_bound:
                        diff = min_bound - cand_age
                    else:
                        diff = cand_age - max_bound
                    age_score = 5000 - (diff * 100)
                    score += age_score
            except Exception:
                pass

        # Common language
        cand_langs = set(doc.languages.split(",")) if hasattr(doc, "languages") and doc.languages else set()
        if not my_langs.isdisjoint(cand_langs):
            score += 2000

        # Distance
        dist = 0.0
        # Check distance via Redis Geo
        try:
            d = await r.geodist("user_geo", user_id, uid, unit="km")
            if d is not None:
                dist = float(d)
                score -= dist  # -1 point per km
        except Exception:
            pass

        # Lifestyle (preferences; empty means "any")
        if my_pref_religions and hasattr(doc, "religion") and doc.religion in my_pref_religions:
            score += 100
        if my_pref_is_smoker and hasattr(doc, "is_smoker") and doc.is_smoker == my_pref_is_smoker:
            score += 100
        if my_pref_wants_children and hasattr(doc, "wants_children") and doc.wants_children == my_pref_wants_children:
            score += 100

        candidates.append((uid, score, dist))

    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates


async def attempt_match_for_user(r, user_id: str, repo: Repo) -> bool:
    # Ensure user still in pool
    if await r.zscore("matchmaking", user_id) is None:
        return False

    user_data = await r.hgetall(f"mm_entry:{user_id}")
    if not user_data:
        return False

    user_joined_at = float(user_data.get("joined_at", 0) or 0)

    candidates = await _build_candidates(r, user_id, user_data)
    if not candidates:
        return False

    for cand_id, _, dist in candidates:
        if cand_id == user_id:
            continue

        cand_entry = await r.hgetall(f"mm_entry:{cand_id}")
        if not cand_entry:
            continue

        cand_joined_at = float(cand_entry.get("joined_at", 0) or 0)

        claimed = await _try_claim_pair(r, user_id, cand_id)
        if not claimed:
            continue

        # Distance is already computed in _build_candidates
        distance_km = dist

        # Create conversation
        conversation = Conversation(user1_id=user_id, user2_id=cand_id)
        await repo.conversation_repo.save(conversation)

        p1 = await repo.profile_repo.get_by_id(user_id)
        p2 = await repo.profile_repo.get_by_id(cand_id)

        if not p1 or not p2:
            # Restore both users if profiles are missing
            await r.zadd("matchmaking", {user_id: user_joined_at, cand_id: cand_joined_at})
            continue

        def make_payload(peer_profile, distance, initiator):
            if not peer_profile:
                return {
                    "peer_id": "unknown",
                    "conversation_id": conversation.id
                }

            age = 0
            if peer_profile.birth_date:
                now = datetime.now(timezone.utc)
                bd = peer_profile.birth_date
                if bd.tzinfo is None:
                    bd = bd.replace(tzinfo=timezone.utc)
                age = (now - bd).days // 365

            return {
                "peer_id": peer_profile.user_id,
                "peer_name": peer_profile.first_name,
                "peer_age": age,
                "distance_km": distance,
                "initiator": initiator,
                "conversation_id": conversation.id,
            }

        payload1 = make_payload(p2, distance_km, True)
        payload2 = make_payload(p1, distance_km, False)

        await r.publish(f"user:{user_id}", json.dumps({
            "type": "match_found",
            "payload": payload1
        }))
        await r.publish(f"user:{cand_id}", json.dumps({
            "type": "match_found",
            "payload": payload2
        }))

        # Cleanup after successful match
        await r.zrem("user_geo", user_id, cand_id)
        await r.delete(f"mm_entry:{user_id}")
        await r.delete(f"mm_entry:{cand_id}")

        return True

    return False
