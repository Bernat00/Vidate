# Testing Gaps & Future Enhancements

## Missing Test Coverage (27 endpoints not tested)

### 1. Match Operations (4 endpoints)
```python
# POST /api/matches/match
@pytest.mark.asyncio
async def test_create_match():
    """Requires: 2 users with profiles, conversation setup"""
    # Create user1, user2
    # Create profiles for both
    # Create conversation between them
    # Call POST /api/matches/match?userid=user2_id
    # Assert match created and status code 200
    pass

# DELETE /api/matches/match
@pytest.mark.asyncio
async def test_delete_match():
    """Delete a match"""
    pass

# GET /api/matches/mine
@pytest.mark.asyncio
async def test_get_my_matches():
    """List authenticated user's matches"""
    pass

# POST /api/matches/feedback
@pytest.mark.asyncio
async def test_submit_match_feedback():
    """Like/dislike feedback, may trigger auto-match"""
    pass
```

### 2. Chat & Events (2 endpoints)
```python
# GET /api/matches/{match_id}/events
@pytest.mark.asyncio
async def test_get_match_chat_events():
    """Requires: match with chat history"""
    # Create match
    # Create chat events
    # Test pagination with last_id
    pass

# GET /api/matches/{match_id}/feedback-profile/{partner_id}
@pytest.mark.asyncio
async def test_get_feedback_profile():
    """Get partner's profile for match feedback"""
    pass
```

### 3. Admin Users (2 endpoints)
```python
# GET /api/users
@pytest.mark.asyncio
async def test_admin_list_all_users():
    """Admin-only: get all users"""
    # Create multiple users
    # Call GET /api/users with admin token
    # Verify all users returned
    pass

# GET /api/users/reports/{user_id}
@pytest.mark.asyncio
async def test_admin_get_user_reports():
    """Admin-only: get reports about specific user"""
    pass
```

### 4. Password Reset (2 endpoints)
```python
# POST /api/users/send-reset-email
@pytest.mark.asyncio
async def test_send_reset_email(monkeypatch):
    """Requires: Email mocking"""
    # Mock smtplib
    # Create user
    # Request password reset
    # Verify email would be sent
    # Extract token from mock
    pass

# POST /api/users/reset-password
@pytest.mark.asyncio
async def test_reset_password():
    """Complete password reset with token"""
    pass
```

### 5. Admin Registration (1 endpoint)
```python
# POST /api/auth/register-admin
@pytest.mark.asyncio
async def test_register_admin_with_token():
    """Create admin user with one-time token"""
    # Get token from GET /api/auth/register-admin-token
    # Use token to register admin
    # Verify new user has admin role
    pass
```

### 6. WebSocket (1 endpoint)
```python
# WebSocket /ws/main
@pytest.mark.asyncio
async def test_websocket_connection():
    """Requires: websockets client"""
    # Connect with token
    # Send joined_feed message
    # Receive updates
    # Test reconnection
    # Test message broadcast
    pass
```

---

## How to Add These Tests

### For Match Operations:
```python
# backend/tests/test_matches.py

@pytest.fixture
async def two_users_with_profiles(client):
    """Helper fixture for match tests"""
    # Create user1
    user1_creds = {"email": "user1@example.com", "password": "Password1"}
    await client.post("/api/auth/register", json=user1_creds)
    user1_token = await _get_token(client, ...)
    
    # Create user2
    user2_creds = {"email": "user2@example.com", "password": "Password1"}
    await client.post("/api/auth/register", json=user2_creds)
    user2_token = await _get_token(client, ...)
    
    # Create profiles for both
    profile_data = {...}
    await client.put("/api/profile/mine", json=profile_data, 
                     headers={"Authorization": f"Bearer {user1_token}"})
    await client.put("/api/profile/mine", json=profile_data,
                     headers={"Authorization": f"Bearer {user2_token}"})
    
    return (user1_token, user1_id), (user2_token, user2_id)

@pytest.mark.asyncio
async def test_match_workflow(client, two_users_with_profiles):
    (token1, id1), (token2, id2) = two_users_with_profiles
    
    # User1 creates conversation with User2
    res = await client.post(
        f"/api/matches/match?userid={id2}",
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res.status_code == 200
    match_id = res.json()["id"]
    
    # User2 matches back
    res = await client.post(
        f"/api/matches/match?userid={id1}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 200
    assert res.json()["confirmed"] == True  # Should be auto-confirmed
```

### For Email Testing:
```python
# backend/tests/test_password_reset.py
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_password_reset(client, monkeypatch):
    # Mock SMTP
    mock_smtp = MagicMock()
    monkeypatch.setattr('smtplib.SMTP_SSL', MagicMock(return_value=mock_smtp))
    
    # Register user
    creds = {"email": "reset@example.com", "password": "Password1"}
    await client.post("/api/auth/register", json=creds)
    
    # Request reset
    res = await client.post(
        "/api/users/send-reset-email",
        json={"email": "reset@example.com"}
    )
    assert res.status_code == 200
    
    # Extract token from mock email call
    call_args = mock_smtp.send_message.call_args
    email_body = call_args[0][0].get_payload()
    # Parse token from "token=..." URL
    
    # Reset password with token
    res = await client.post(
        f"/api/users/reset-password?token={extracted_token}",
        json={"password": "NewPassword1"}
    )
    assert res.status_code == 200
    
    # Verify new password works
    res = await client.post(
        "/api/auth/token",
        data={"username": "reset@example.com", "password": "NewPassword1"}
    )
    assert res.status_code == 200
```

### For WebSocket Testing:
```python
# backend/tests/test_websocket.py
import websockets
import json

@pytest.mark.asyncio
async def test_websocket_match_found(client, user_token):
    """Test real-time match notifications via WebSocket"""
    token, _ = user_token
    
    # Connect to WebSocket
    uri = "ws://localhost:8000/api/ws/main"
    async with websockets.connect(f"{uri}?token={token}") as ws:
        # Send joined_feed message with location
        msg = {
            "type": "joined_feed",
            "payload": {
                "lat": 40.7128,
                "lon": -74.0060
            }
        }
        await ws.send(json.dumps(msg))
        
        # Wait for match notification
        response = await asyncio.wait_for(ws.recv(), timeout=5.0)
        data = json.loads(response)
        
        assert data["type"] == "match_found"
        assert "peer_id" in data["payload"]
        assert "distance_km" in data["payload"]
```

---

## Dependencies to Add for Full Coverage

```python
# For email testing
pip install pytest-mock

# For WebSocket testing
pip install websockets

# For Redis testing (if testing matchmaking)
pip install testcontainers[redis]

# For coverage reporting
pip install pytest-cov
```

---

## Estimated Effort

| Test Category | Tests | Complexity | Time |
|---|---|---|---|
| Match Operations | 4 | Medium | 2-3h |
| Chat Events | 2 | Low | 1h |
| Admin Users | 2 | Low | 1h |
| Password Reset | 2 | Medium | 1-2h |
| Admin Registration | 1 | Low | 30min |
| WebSocket | 1 | High | 2-3h |
| **Total** | **12** | | **8-11h** |

---

## Priority Recommendation

### 🔴 HIGH PRIORITY
1. **Match Operations** - Core user feature
2. **Password Reset** - Essential user functionality
3. **WebSocket** - Real-time critical feature

### 🟡 MEDIUM PRIORITY
4. **Admin Registration** - Admin workflow
5. **Chat Events** - User communication

### 🟢 LOW PRIORITY
6. **Admin Users Endpoint** - Duplicate of existing admin ops

---

## Notes

- Tests should use same fixture pattern as existing tests
- Each test file should be independent
- Use temporary test data (cleanup automatic)
- Consider Redis/WebSocket infrastructure needs
- Document any external service mocking

---

**For implementation, start with Match Operations as they're critical to the app's core functionality.**

