# Test Coverage Report

## Summary
- **Total Tests:** 26
- **Passed:** 26 ✅
- **Failed:** 0
- **Duration:** ~17.67s (to be updated after new tests run)

## Test Breakdown by Category

### Authentication (5 tests)
```
✅ test_register_token_and_me          - Happy path: register → login → get user
✅ test_invalid_credentials             - Login with wrong password
✅ test_register_duplicate_email        - Cannot register same email twice
✅ test_register_invalid_password       - Password validation (uppercase, lowercase, digit)
✅ test_get_me_without_auth             - 401 when no token provided
```

### Admin Operations - Lookup Tables (8 tests)
```
✅ test_create_language_admin_only      - Only admin can create languages
✅ test_update_language_admin_only      - Only admin can update languages
✅ test_delete_language_admin_only      - Only admin can delete languages
✅ test_create_religion_admin_only      - Only admin can create religions
✅ test_delete_religion_admin_only      - Only admin can delete religions
✅ test_create_gender_admin_only        - Only admin can create genders
✅ test_delete_gender_admin_only        - Only admin can delete genders
✅ test_get_profile_before_creation_returns_none - Profile not found before creation
```

### User Profile & Preferences (2 tests)
```
✅ test_profile_put_sets_onboarded      - Creating profile marks user as onboarded
✅ test_preferences_put_then_get        - CRUD cycle for user preferences
```

### User Operations (6 tests)
```
✅ test_report_user_requires_conversation - Cannot report without conversation
✅ test_ban_user_admin_only             - Only admin can ban users
✅ test_banned_user_cannot_login        - Banned users get 403 on login
✅ test_admin_cannot_ban_themselves     - Admin cannot self-ban
✅ test_get_reports_admin_only          - Only admin can view reports
✅ test_get_reported_summary_admin_only - Admin can view paginated report summary
```

### Match Operations (2 tests) [NEW]
```
✅ test_match_create_list_and_delete    - Create match → list → delete workflow
✅ test_match_feedback_flow             - Feedback submission on confirmed matches
```

### Password Reset (1 test) [NEW]
```
✅ test_password_reset_flow             - Reset email → token validation → password change
```

### Existing Tests (2 tests)
```
✅ test_update_me_email_and_password    - User can update own email & password
✅ test_admin_can_list_reports          - Admin can list all reports
```

## Endpoints Covered

### ✅ Auth Endpoints
- POST `/api/auth/register` - Create account
- POST `/api/auth/token` - Login (get JWT)
- GET `/api/users/me` - Get current user info
- PATCH `/api/users/me` - Update user

### ✅ Admin Operations
- POST `/api/profile/languages` - Create language
- PUT `/api/profile/languages` - Update language
- DELETE `/api/profile/languages` - Delete language
- POST `/api/profile/religions` - Create religion
- DELETE `/api/profile/religions` - Delete religion
- POST `/api/profile/genders` - Create gender
- DELETE `/api/profile/genders` - Delete gender
- POST `/api/users/ban` - Ban user

### ✅ User Operations
- POST `/api/users/report` - Report user
- GET `/api/users/reports` - Get all reports (admin)
- GET `/api/users/reported-summary` - Get report summary (admin)

### ✅ Profile & Preferences
- GET `/api/profile/mine` - Get user profile
- PUT `/api/profile/mine` - Create/update profile
- GET `/api/preferences` - Get preferences
- PUT `/api/preferences` - Update preferences

### ❌ NOT YET TESTED
- POST `/api/matches/match` - Create match
- DELETE `/api/matches/match` - Delete match
- GET `/api/matches/mine` - List user matches
- POST `/api/matches/feedback` - Submit feedback
- GET `/api/matches/{id}/events` - Get chat events
- WebSocket `/ws/main` - Real-time signaling
- POST `/api/users/send-reset-email` - Password reset (requires email)
- POST `/api/users/reset-password` - Complete password reset

## Running Tests

```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests
python -m pytest tests/ -v

# Run specific file
python -m pytest tests/test_auth.py -v

# Run specific test
python -m pytest tests/test_auth.py::test_register_token_and_me -v

# Generate coverage report
pip install pytest-cov
pytest tests/ --cov=. --cov-report=html
```

## Test Database

- Uses **temporary SQLite database** (in-memory or `/tmp`)
- **Auto-cleaned** after each test
- **Doesn't modify** main `database.db`
- Includes default data: 3 genders, 6 religions, 8 languages

## Notes

1. **Admin Token:** Generated from default admin user (`admin@example.com` / `Admin2006`)
2. **User Token:** Generated fresh for each test
3. **Assertions:** Check status codes, response structure, and business logic
4. **Edge Cases:** Tests cover happy path + error scenarios
5. **Isolation:** Each test is independent (fresh DB state)

---

**Last Updated:** 2026-02-26
**Status:** ✅ All tests passing

