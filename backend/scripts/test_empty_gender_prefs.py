"""
Test script to verify that empty gender preferences work correctly.
Run this after seeding the matchmaking data.
"""
import asyncio
from redis.asyncio import Redis

REDIS_URL = "redis://localhost:6379"


async def test_empty_gender_prefs():
    r = Redis.from_url(REDIS_URL)

    try:
        await r.ping()
        print("✓ Connected to Redis\n")
    except Exception as e:
        print(f"✗ Could not connect to Redis: {e}")
        return

    # Test cases to verify
    test_cases = [
        {
            "user_id": "user_main",
            "description": "Main user (Male, seeks Female/NB)",
            "expected_matches": [
                "user_perfect",  # Female seeking Male
                "user_open_all_genders",  # Female open to all (empty pref)
                "user_nonbinary_open",  # Non-binary open to all
            ]
        },
        {
            "user_id": "user_main_no_pref",
            "description": "Male user open to all genders (empty pref)",
            "expected_note": "Should match with anyone whose gender prefs include Male OR empty"
        },
        {
            "user_id": "user_open_all_genders",
            "description": "Female user open to all genders (empty pref)",
            "expected_note": "Should match with anyone (any gender)"
        }
    ]

    print("=" * 60)
    print("TESTING EMPTY GENDER PREFERENCE LOGIC")
    print("=" * 60)
    print()

    for test in test_cases:
        user_id = test["user_id"]
        print(f"Test: {test['description']}")
        print(f"User ID: {user_id}")

        # Check if user exists in matchmaking
        exists = await r.exists(f"mm_entry:{user_id}")
        if not exists:
            print(f"  ✗ User not found in matchmaking pool")
            print()
            continue

        # Get user data
        user_data = await r.hgetall(f"mm_entry:{user_id}")
        gender = user_data.get("gender", "").decode() if user_data.get("gender") else ""
        pref_genders = user_data.get("pref_genders", b"").decode() if user_data.get("pref_genders") else ""

        print(f"  Gender: {gender if gender else '(none)'}")
        print(f"  Preferred Genders: {pref_genders if pref_genders else '(empty = all genders)'}")

        if "expected_matches" in test:
            print(f"  Expected to match with: {', '.join(test['expected_matches'])}")
        elif "expected_note" in test:
            print(f"  Expected: {test['expected_note']}")

        print()

    print("=" * 60)
    print("VERIFICATION TIPS")
    print("=" * 60)
    print()
    print("Run the actual matchmaking to verify:")
    print("1. Empty pref_genders should match with all genders")
    print("2. Bidirectional matching should work:")
    print("   - If A seeks B's gender AND")
    print("   - If B seeks A's gender OR B has empty pref (open to all)")
    print("   - Then A and B can match")
    print()

    await r.aclose()


if __name__ == "__main__":
    asyncio.run(test_empty_gender_prefs())

