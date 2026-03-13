# Testing Gaps and Coverage Status

Last updated: 2026-03-13

## What Was Outdated

The previous version of this document listed several endpoints as untested that are now covered in the test suite.

Now covered by tests:
- `POST /api/matches/match`
- `DELETE /api/matches/match`
- `GET /api/matches/mine`
- `POST /api/matches/feedback`
- `GET /api/matches/{match_id}/events`
- `GET /api/matches/feedback-profile/{partner_id}`
- `GET /api/users`
- `GET /api/users/reports/{user_id}`
- `POST /api/users/send-reset-email`
- `POST /api/users/reset-password`
- `POST /api/auth/register-admin`
- `GET /api/auth/register-admin-token`

## Remaining High-Value Gaps

### 1) WebSocket realtime endpoint
- `WS /ws/main`
- Why it still matters: this is a core realtime surface (matchmaking, signaling, chat relay).
- Current blocker: the test redis double in `backend/tests/conftest.py` does not yet implement pubsub and sorted-set operations used by the websocket flow.

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

1. Add a lightweight websocket smoke test by extending `DummyRedis` in `backend/tests/conftest.py` with minimal pubsub and sorted-set support.
2. Add pagination assertions in `backend/tests/test_matches.py` for `last_id`.
3. Add admin-token negative tests in `backend/tests/test_auth_errors.py`.
4. Add in-use delete protection tests in `backend/tests/test_lookup_tables.py`.

## Notes

- Endpoint paths in this file now match current route declarations.
- This file tracks meaningful functional gaps, not every possible branch combination.
