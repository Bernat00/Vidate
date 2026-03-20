# Testing Gaps and Coverage Status

Last updated: 2026-03-20

## What Changed In This Update

- Endpoint tests were moved under `backend/tests/integration/`.
- New unit tests were added under `backend/tests/unit/` for:
  - auth token helpers (`create_access_token`, `decode_token`, `get_token`)
  - schema validation (`UserCreate`, `PreferenceCreate`)
  - helper field copy logic (`copy_non_none_fields`)
  - password hashing/checking on `User`
- Current local run status:
  - `tests/unit`: 13 passed
  - `tests/integration`: 30 passed

## Remaining High-Value Gaps

### 1) WebSocket realtime endpoint
- `WS /ws/main`
- Why it still matters: this is a core realtime surface (matchmaking, signaling, chat relay).
- Current blocker: the test redis double in `backend/tests/integration/conftest.py` does not yet implement pubsub and sorted-set operations used by websocket flow.

### 2) Match events depth tests
- `GET /api/matches/{match_id}/events` currently has basic access/path coverage.
- Missing depth:
  - pagination behavior via `last_id`
  - expected ordering across multiple chat events

### 3) Negative-path admin token tests
- `POST /api/auth/register-admin` has happy path + one-time token reuse coverage.
- Missing depth:
  - wrong token type
  - malformed/expired token cases

### 4) Lookup-table integrity constraints
- Delete endpoints are covered for happy path.
- Missing depth:
  - deleting a gender/language/religion that is in use should return `400`

## Suggested Next Steps (priority order)

1. Add a lightweight websocket smoke test by extending `DummyRedis` in `backend/tests/integration/conftest.py` with minimal pubsub and sorted-set support.
2. Add pagination assertions in `backend/tests/integration/test_matches.py` for `last_id`.
3. Add admin-token negative tests in `backend/tests/integration/test_auth_errors.py`.
4. Add in-use delete protection tests in `backend/tests/integration/test_lookup_tables.py`.

## Notes

- Endpoint paths in this file match current route declarations.
- This file tracks meaningful functional gaps, not every possible branch combination.
