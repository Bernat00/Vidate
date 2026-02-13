import sys
from datetime import datetime, timezone
import json
from backend.persistence.repository import Repo
from backend.persistence.model.conversation import Conversation
from redis.commands.search.query import Query
from redis.commands.search.field import TagField, NumericField, GeoField
from redis.commands.search.indexDefinition import IndexDefinition, IndexType

# Matchmaking Scoring Constants
MAX_CANDIDATES = 100
MAX_GEO_BONUS = 3000
MAX_GEO_DIST_KM = 2000
HISTORY_PENALTY_BASE = 20000
AGE_BONUS_IN_RANGE = 2000
AGE_PENALTY_PER_YEAR = 100
LANGUAGE_BONUS = 1500
LIFESTYLE_BONUS = 500

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
    try:
        schema = (
            TagField("user_id"),
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
    except Exception as e:
        # Silently ignore if index already exists
        if "Index already exists" not in str(e):
            print(f"Index creation observation: {e}")


async def _try_claim_pair(r, user1_id: str, user2_id: str) -> bool:
    result = await r.eval(_LUA_CLAIM_PAIR, 1, "matchmaking", user1_id, user2_id)
    return result == 1


async def _build_candidates(r, user_id: str, user_data: dict) -> list[tuple[str, float, float]]:
    # Parse attributes
    my_gender = user_data.get("gender", "")
    my_prefs_genders = user_data.get("pref_genders", "").split(",") if user_data.get("pref_genders") else []
    my_blocked = [b for b in user_data.get("blocked_ids", "").split("|") if b]
    my_history_ids = [hid for hid in user_data.get("history_ids", "").split("|") if hid]

    age_min_str = user_data.get("pref_age_min")
    my_age_min = int(age_min_str) if age_min_str else None

    age_max_str = user_data.get("pref_age_max")
    my_age_max = int(age_max_str) if age_max_str else None

    # --- BUILD QUERY ---
    filters = []

    # Filter by candidate's gender (must match my preferences)
    # If I have no specific gender preferences (ANY), I skip this filter
    if my_prefs_genders and "ANY" not in my_prefs_genders:
        gender_terms = [
            _escape_tag_value(g) for g in my_prefs_genders if g
        ]
        if gender_terms:
            filters.append(f"@gender:{{{'|'.join(gender_terms)}}}")

    # Filter by my gender (must match candidate's preferences)
    # The candidate matches if my_gender is in their pref_genders OR if their pref_genders is ANY
    if my_gender:
        filters.append(f"@pref_genders:{{{_escape_tag_value(my_gender)}|ANY}}")

    # They must not have blocked me
    filters.append(f"-@blocked_ids:{{{_escape_tag_value(user_id)}}}")

    # I must not have blocked them, and it shouldn't be me (history is allowed but penalized)
    exclude_ids = {user_id} | set(my_blocked)
    if exclude_ids:
        exclude_str = "|".join(_escape_tag_value(eid) for eid in exclude_ids)
        filters.append(f"-@user_id:{{{exclude_str}}}")

    query_str = " ".join(filters)

    q = (
        Query(query_str)
        .return_fields("user_id", "first_name", "joined_at", "age", "location", "gender", "languages", "religion", "is_smoker", "wants_children")
        .sort_by("joined_at", asc=True)
        .paging(0, MAX_CANDIDATES)
        .dialect(2)
    )

    res = await r.ft("idx:matchmaking").search(q)
    if not res.docs:
        return []

    # Batch geodist calls
    pipe = r.pipeline()
    for doc in res.docs:
        pipe.geodist("user_geo", user_id, doc.user_id, unit="km")
    geodists = await pipe.execute()

    candidates: list[tuple[str, float, float]] = []

    # My attributes for matching
    my_langs = set(user_data.get("languages", "").split(",")) if user_data.get("languages") else set()
    my_pref_religions = set(user_data.get("pref_religions", "").split(",")) if user_data.get("pref_religions") else set()
    my_pref_is_smoker = user_data.get("pref_is_smoker") if user_data.get("pref_is_smoker") else ""
    my_pref_wants_children = user_data.get("pref_wants_children") if user_data.get("pref_wants_children") else ""

    for i, doc in enumerate(res.docs):
        uid = doc.user_id
        # Parse all fields from the document to avoid later hgetall
        doc_data = {
            "user_id": uid,
            "first_name": doc.first_name if hasattr(doc, "first_name") else "Unknown",
            "age": doc.age if hasattr(doc, "age") else "0",
            "gender": doc.gender if hasattr(doc, "gender") else "",
            "languages": doc.languages if hasattr(doc, "languages") else "",
            "religion": doc.religion if hasattr(doc, "religion") else "",
            "is_smoker": doc.is_smoker if hasattr(doc, "is_smoker") else "0",
            "wants_children": doc.wants_children if hasattr(doc, "wants_children") else "",
        }

        dist = None
        geo_bonus = 0.0
        if geodists[i] is not None:
            dist = float(geodists[i])
            # Linear bonus: MAX_GEO_BONUS at 0km, decreasing to 0 at MAX_GEO_DIST_KM.
            geo_bonus = max(0.0, MAX_GEO_BONUS - (dist * (MAX_GEO_BONUS / MAX_GEO_DIST_KM)))

        score = 0
        score += geo_bonus

        # History penalty: most recent matches get higher penalties
        if uid in my_history_ids:
            idx = my_history_ids.index(uid)
            # my_history_ids is ordered oldest first, so higher index = more recent
            penalty = (idx + 1) * HISTORY_PENALTY_BASE
            score -= penalty

        # Age bonus with deviation penalty
        if hasattr(doc, "age") and (my_age_min is not None or my_age_max is not None):
            try:
                cand_age = int(doc.age)
                min_bound = my_age_min if my_age_min is not None else -sys.maxsize
                max_bound = my_age_max if my_age_max is not None else sys.maxsize
                if min_bound <= cand_age <= max_bound:
                    score += AGE_BONUS_IN_RANGE
                else:
                    if cand_age < min_bound:
                        diff = min_bound - cand_age
                    else:
                        diff = cand_age - max_bound
                    age_score = AGE_BONUS_IN_RANGE - (diff * AGE_PENALTY_PER_YEAR)
                    score += age_score
            except Exception:
                pass

        # Common language
        cand_langs = set(doc.languages.split(",")) if hasattr(doc, "languages") and doc.languages else set()
        if not my_langs.isdisjoint(cand_langs):
            score += LANGUAGE_BONUS

        # Lifestyle (preferences; empty means "any")
        if my_pref_religions and hasattr(doc, "religion") and doc.religion in my_pref_religions:
            score += LIFESTYLE_BONUS
        if my_pref_is_smoker and hasattr(doc, "is_smoker") and doc.is_smoker == my_pref_is_smoker:
            score += LIFESTYLE_BONUS
        if my_pref_wants_children and hasattr(doc, "wants_children") and doc.wants_children == my_pref_wants_children:
            score += LIFESTYLE_BONUS

        candidates.append((uid, score, dist, doc_data))

    candidates.sort(key=lambda x: x[1], reverse=True)
    return candidates


async def attempt_match_for_user(r, user_id: str, repo: Repo) -> bool:
    # Ensure user still in pool
    if await r.zscore("matchmaking", user_id) is None:
        return False

    user_data = await r.hgetall(f"mm_entry:{user_id}")
    if not user_data:
        await r.zrem("matchmaking", user_id)
        return False

    candidates = await _build_candidates(r, user_id, user_data)
    if not candidates:
        return False

    for cand_id, _, dist, cand_entry in candidates:
        # We already have cand_entry from the search results! No need for hgetall.
        claimed = await _try_claim_pair(r, user_id, cand_id)
        if not claimed:
            continue

        # Create conversation
        conversation = Conversation(user1_id=user_id, user2_id=cand_id)
        await repo.conversation_repo.save(conversation)

        def make_payload(peer_id, peer_name, peer_age, distance, initiator):
            return {
                "peer_id": peer_id,
                "peer_name": peer_name,
                "peer_age": int(peer_age) if peer_age else 0,
                "distance_km": distance,
                "initiator": initiator,
                "conversation_id": conversation.id,
            }

        payload1 = make_payload(
            cand_id,
            cand_entry.get("first_name", "Unknown"),
            cand_entry.get("age", 0),
            dist,
            True
        )
        payload2 = make_payload(
            user_id,
            user_data.get("first_name", "Unknown"),
            user_data.get("age", 0),
            dist,
            False
        )

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
