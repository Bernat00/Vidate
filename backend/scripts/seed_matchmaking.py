import asyncio
import random
import time
import json
from redis.asyncio import Redis

# Configuration
REDIS_URL = "redis://localhost:6379"

# Mock Data
GENDERS = ["1", "2", "3"] # 1: Male, 2: Female, 3: Non-binary
LANGUAGES = ["1", "2", "3", "4", "5"] # en, es, fr, de, it
RELIGIONS = ["1", "2", "3"]

async def seed():
    r = Redis.from_url(REDIS_URL)

    # Check connection
    try:
        await r.ping()
        print("Connected to Redis")
    except Exception as e:
        print(f"Could not connect to Redis: {e}")
        return

    # Clear existing matchmaking data
    keys = await r.keys("mm_entry:*")
    if keys:
        await r.delete(*keys)
    await r.delete("matchmaking")
    await r.delete("user_geo")

    print("Cleared old data")

    users = []

    # History data for main user
    history_data_mock = {
        "user_recent_1": {
            "last_ts": time.time() - 3600, # 1 hour ago
            "count": 5
        },
        "user_recent_2": {
            "last_ts": time.time() - 200, # 3 mins ago (Should be blocked by logic)
            "count": 1
        },
        "user_frequent_history": {
            "last_ts": time.time() - 7200, # 2 hours ago
            "count": 20 # Spoke A LOT
        },
        "user_old_history": {
            "last_ts": time.time() - 86400 * 2, # 2 days ago (outside 12h window usually, but let's test logic if it persists)
            # Actually logic in endpoint only fetches last 12h. But here we force inject.
            "count": 1
        }
    }

    # Main User: Male, 25, NY, Speaks 1,2. Seeks Female(2)/NB(3).
    main_user = {
        "user_id": "user_main",
        "gender": "1",
        "pref_genders": "2,3",
        "blocked_ids": "user_blocked",
        "history_ids": "user_recent_1|user_recent_2|user_frequent_history|user_old_history",
        "history_data": json.dumps(history_data_mock),
        "joined_at": time.time(),
        "age": 25,
        "languages": "1,2",
        "location": "-74.0060,40.7128", # NY
        "religion": "1",
        "is_smoker": "0",
        "wants_children": "1",
        "pref_age_min": 20,
        "pref_age_max": 30,
        "pref_wants_children": "1",
        "pref_is_smoker": "0",
        "pref_languages": "1,2",
        "pref_religions": "1"
    }
    users.append(main_user)

    # Base template for candidate users (Ideal match to start with)
    base_candidate = {
        "gender": "2", # Female (Matches main)
        "pref_genders": "1,2", # Seeks Male (Matches main)
        "blocked_ids": "",
        "history_ids": "",
        "history_data": "",
        "joined_at": time.time() - 100,
        "age": 24,
        "languages": "1", # Common language
        "location": "-74.0060,40.7128", # NY
        "religion": "1", # Match
        "is_smoker": "0", # Match
        "wants_children": "1", # Match
        "pref_age_min": 20,
        "pref_age_max": 30,
        "pref_wants_children": "1",
        "pref_is_smoker": "0",
        "pref_languages": "1",
        "pref_religions": "1"
    }

    # 1. Perfect Match
    u1 = base_candidate.copy()
    u1["user_id"] = "user_perfect"
    users.append(u1)

    # 2. Far Away Match (London approx)
    u2 = base_candidate.copy()
    u2["user_id"] = "user_far"
    u2["location"] = "-0.1276,51.5074"
    users.append(u2)

    # 3. Language Mismatch
    u3 = base_candidate.copy()
    u3["user_id"] = "user_diff_lang"
    u3["languages"] = "3" # French only (Main speaks 1,2)
    users.append(u3)

    # 4. Lifestyle Mismatch: Smoker
    u4 = base_candidate.copy()
    u4["user_id"] = "user_smoker"
    u4["is_smoker"] = "1" # Main wants non-smoker (0)
    users.append(u4)

    # 5. Lifestyle Mismatch: Religion
    u5 = base_candidate.copy()
    u5["user_id"] = "user_diff_religion"
    u5["religion"] = "2"
    users.append(u5)

    # 6. Reverse Gender Mismatch (She doesn't want men)
    u6 = base_candidate.copy()
    u6["user_id"] = "user_lesbian"
    u6["pref_genders"] = "2" # Only wants Female
    users.append(u6)

    # 7. Age Mismatch (Too old)
    u7 = base_candidate.copy()
    u7["user_id"] = "user_old"
    u7["age"] = 45 # Main wants 20-30
    users.append(u7)

    # 8. History: Recent 1 (1h ago, 5 chats)
    u8 = base_candidate.copy()
    u8["user_id"] = "user_recent_1"
    users.append(u8)

    # 9. History: Recent 2 (3 mins ago -> Blocked)
    u9 = base_candidate.copy()
    u9["user_id"] = "user_recent_2"
    users.append(u9)

    # 10. History: Frequent (2h ago, 20 chats)
    u10 = base_candidate.copy()
    u10["user_id"] = "user_frequent_history"
    users.append(u10)

    # 11. History: Old (2 days ago, 1 chat)
    u11 = base_candidate.copy()
    u11["user_id"] = "user_old_history"
    users.append(u11)

    # 12. Blocked User
    u12 = base_candidate.copy()
    u12["user_id"] = "user_blocked"
    users.append(u12)

    # 13. Reverse Blocked (They blocked me)
    u13 = base_candidate.copy()
    u13["user_id"] = "user_who_blocked_me"
    u13["blocked_ids"] = "user_main|user_other"
    users.append(u13)

    # 14. Open to all genders (empty pref_genders) - Should match with main user
    # Note: In production, empty pref_genders will be populated with all gender IDs from DB
    # For testing, we simulate that by setting it to "1,2,3" (all available genders)
    u14 = base_candidate.copy()
    u14["user_id"] = "user_open_all_genders"
    u14["pref_genders"] = "1,2,3"  # Simulating "all genders" (populated by endpoint)
    users.append(u14)

    # 15. Main user with no gender preference - test the other direction
    u15 = {
        "user_id": "user_main_no_pref",
        "gender": "1",  # Male
        "pref_genders": "1,2,3",  # Simulating "all genders" (populated by endpoint)
        "blocked_ids": "",
        "history_ids": "",
        "history_data": "",
        "joined_at": time.time() - 50,
        "age": 26,
        "languages": "1,2",
        "location": "-74.0060,40.7128",  # NY
        "religion": "1",
        "is_smoker": "0",
        "wants_children": "1",
        "pref_age_min": 20,
        "pref_age_max": 30,
        "pref_wants_children": "1",
        "pref_is_smoker": "0",
        "pref_languages": "1,2",
        "pref_religions": "1"
    }
    users.append(u15)

    # 16. Non-binary user with no gender preference
    u16 = base_candidate.copy()
    u16["user_id"] = "user_nonbinary_open"
    u16["gender"] = "3"  # Non-binary
    u16["pref_genders"] = "1,2,3"  # Simulating "all genders" (populated by endpoint)
    users.append(u16)

    # Insert data
    for u in users:
        # Convert to Redis hash format (no None, json stringify if needed?)
        # Redis-py hset handles basics, but let's be safe
        u_cleaned = {k: v for k, v in u.items() if v is not None}
        await r.hset(f"mm_entry:{u['user_id']}", mapping=u_cleaned)

        # Parse location "lon,lat"
        if "location" in u:
            lon, lat = map(float, u['location'].split(","))
            await r.geoadd("user_geo", (lon, lat, u['user_id']))

        await r.zadd("matchmaking", {u['user_id']: u['joined_at']})

    print(f"Seeded {len(users)} users.")
    await r.aclose()

if __name__ == "__main__":
    asyncio.run(seed())

