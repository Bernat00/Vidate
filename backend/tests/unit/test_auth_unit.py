from datetime import timedelta

import pytest

from backend.routes.auth import create_access_token, credentials_exception, decode_token, get_token


def test_create_and_decode_access_token_roundtrip():
    token = create_access_token(
        {"sub": "user-123", "type": "register-admin"},
        expires_delta=timedelta(minutes=5),
    )

    token_data = decode_token(token, credentials_exception)

    assert token_data.user_id == "user-123"
    assert token_data.type == "register-admin"


def test_decode_token_requires_subject_claim():
    token = create_access_token({"type": "register-admin"})

    with pytest.raises(type(credentials_exception)) as exc_info:
        decode_token(token, credentials_exception)

    assert exc_info.value.status_code == 401


def test_decode_token_rejects_malformed_token():
    with pytest.raises(type(credentials_exception)) as exc_info:
        decode_token("not-a-real-jwt", credentials_exception)

    assert exc_info.value.status_code == 401


def test_get_token_prefers_header_then_query():
    assert get_token("header-token", None) == "header-token"
    assert get_token(None, "query-token") == "query-token"


def test_get_token_raises_when_missing():
    with pytest.raises(type(credentials_exception)):
        get_token(None, None)

