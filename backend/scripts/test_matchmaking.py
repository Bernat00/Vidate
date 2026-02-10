import asyncio
import json
import math
import time
from datetime import datetime, timezone
from redis.asyncio import Redis
from redis.commands.search.query import Query

REDIS_URL = "redis://localhost:6379"

# Main User Config
MAIN_USER_ID = "user_main"

def calculate_haversine(lon1, lat1, lon2, lat2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def test_matchmaking():
    r = Redis.from_url(REDIS_URL, decode_responses=True)

    # Fetch Main User Data
    user_data = await r.hgetall(f"mm_entry:{MAIN_USER_ID}")
    if not user_data:
        print("Main user not found. Run seed first.")
        return

    # User Attributes
    my_gender = user_data.get('gender')
    my_prefs_genders = user_data.get('pref_genders').strip().split(",") if user_data.get('pref_genders') else []
    my_blocked = user_data.get('blocked_ids', '').split("|")

    # History Parsing
    my_history_data = {}
    if user_data.get('history_data'):
        try:
            my_history_data = json.loads(user_data.get('history_data'))
        except:
            pass
    my_history_ids = user_data.get('history_ids', '').split("|")

    my_age_min = int(user_data['pref_age_min']) if user_data.get('pref_age_min') else 18
    my_age_max = int(user_data['pref_age_max']) if user_data.get('pref_age_max') else 99

    # My Attributes for scoring
    my_langs = set(user_data['languages'].split(",")) if user_data.get('languages') else set()
    my_religion = user_data.get('religion')
    my_smoker = user_data.get('is_smoker')
    my_kids = user_data.get('wants_children')
    my_location = user_data.get("location")
    my_lon, my_lat = map(float, my_location.split(",")) if my_location else (None, None)

    print(f"Testing matchmaking for {MAIN_USER_ID}")
    print(f"  Gender: {my_gender}, Seeking: {my_prefs_genders}")
    print(f"  History Data Keys: {list(my_history_data.keys())}")

    # --- QUERY CONSTRUCTION ---

    filters = []

    # 1. Hard Constraints
    if my_prefs_genders:
        # Check for empty strings in split
        clean_genders = [g for g in my_prefs_genders if g]
        if clean_genders:
             filters.append(f"@gender:{{{'|'.join(clean_genders)}}}")

    if my_gender:
        filters.append(f"@pref_genders:{{{my_gender}}}")

    filters.append(f"-@blocked_ids:{{{MAIN_USER_ID}}}")

    # AGE FILTER REMOVED (Soft constraint now)
    # filters.append(f"@age:[{my_age_min} {my_age_max}]")

    base_query = " ".join(filters)
    print(f"\nQuery: {base_query}")

    q = Query(base_query)\
        .return_fields("user_id", "joined_at", "age", "location", "gender", "languages", "religion", "is_smoker", "wants_children")\
        .sort_by("joined_at", asc=True)\
        .paging(0, 20)\
        .dialect(2)

    # Perform Search
    res = await r.ft("idx:matchmaking").search(q)

    print(f"Found {res.total} matches (showing top {len(res.docs)} from RediSearch)")

    candidates = []

    print(f"\nProcessing candidates...")

    for doc in res.docs:
        uid = doc.user_id
        if uid == MAIN_USER_ID:
            continue

        # Fetch full object for display
        raw_obj = await r.hgetall(f"mm_entry:{uid}")

        # Check MY Blocklist
        if uid in my_blocked:
            print(f"SKIPPED {uid}: Blocked by me")
            continue

        score = 0
        details = []

        # 1. History Penalty
        if uid in my_history_data:
            h_info = my_history_data[uid]
            last_ts = h_info.get("last_ts", 0)
            count = h_info.get("count", 1)

            now_ts = time.time()
            diff_seconds = max(0, now_ts - last_ts)
            diff_minutes = diff_seconds / 60

            penalty = (50000 * count) / (diff_minutes + 1)
            score -= penalty
            details.append(f"History ({diff_minutes:.1f}m ago, {count}x): -{penalty:.0f}")
        elif uid in my_history_ids:
            score -= 5000
            details.append("History (Legacy via ID): -5000")

        # 2. Age (Very Important)
        cand_age = getattr(doc, 'age', None)
        if cand_age is not None:
            try:
                c_age = int(cand_age)
                if my_age_min <= c_age <= my_age_max:
                    score += 5000
                    details.append(f"Age ({c_age} in [{my_age_min}-{my_age_max}]): +5000")
                else:
                    diff = 0
                    if c_age < my_age_min:
                        diff = my_age_min - c_age
                    else:
                        diff = c_age - my_age_max

                    age_score = 5000 - (diff * 100)
                    score += age_score
                    details.append(f"Age ({c_age} off by {diff}y): {age_score:+}")
            except:
                pass

        # 3. Common Language
        cand_langs = set(doc.languages.split(",")) if hasattr(doc, 'languages') and doc.languages else set()
        if not my_langs.isdisjoint(cand_langs):
            score += 2000
            shared = my_langs.intersection(cand_langs)
            details.append(f"Lang ({','.join(shared)}): +2000")

        # 3. Distance
        dist = 0
        if hasattr(doc, 'location') and doc.location and my_lat is not None:
            try:
                c_lon, c_lat = map(float, doc.location.split(","))
                dist = calculate_haversine(my_lon, my_lat, c_lon, c_lat)
                score -= dist
                details.append(f"Dist ({dist:.1f}km): -{dist:.1f}")
            except Exception:
                pass

        # 4. Lifestyle
        if my_religion and hasattr(doc, 'religion') and doc.religion == my_religion:
            score += 100
            details.append("Religion: +100")
        if my_smoker and hasattr(doc, 'is_smoker') and doc.is_smoker == my_smoker:
            score += 100
            details.append("SmokerMatch: +100")
        if my_kids and hasattr(doc, 'wants_children') and doc.wants_children == my_kids:
            score += 100
            details.append("KidsMatch: +100")

        # Store tuple with raw object
        candidates.append((uid, score, details, raw_obj))

    # Sort final candidates
    candidates.sort(key=lambda x: x[1], reverse=True)

    print("\n" + "="*80)
    print("FINAL RANKING & DATA")
    print("="*80)

    for i, (uid, score, details_list, raw_obj) in enumerate(candidates, 1):
        print(f"\n{i}. USER: {uid} (Score: {score:.2f})")
        print(f"   Breakdown: {', '.join(details_list)}")
        # print(f"   Raw Redis Data: {json.dumps(raw_obj, indent=2)}")

    await r.aclose()

if __name__ == "__main__":
    asyncio.run(test_matchmaking())

