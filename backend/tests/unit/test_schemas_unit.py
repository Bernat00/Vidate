import pytest
from pydantic import ValidationError

from backend.schemas.preference import PreferenceCreate
from backend.schemas.user import UserCreate


@pytest.mark.parametrize(
    "password,error_snippet",
    [
        ("alllowercase1", "uppercase"),
        ("ALLUPPERCASE1", "lowercase"),
        ("NoDigits", "digit"),
    ],
)
def test_user_create_password_validation(password, error_snippet):
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(email="person@example.com", password=password)

    assert error_snippet in str(exc_info.value)


def test_preference_create_rejects_underage_minimum():
    with pytest.raises(ValidationError) as exc_info:
        PreferenceCreate(age_min=17)

    assert "at least 18" in str(exc_info.value)


def test_preference_create_rejects_invalid_age_range():
    with pytest.raises(ValidationError) as exc_info:
        PreferenceCreate(age_min=25, age_max=25)

    assert "greater than age_min" in str(exc_info.value)


def test_preference_create_accepts_valid_age_range():
    pref = PreferenceCreate(age_min=25, age_max=30, wants_children=True)

    assert pref.age_min == 25
    assert pref.age_max == 30
    assert pref.wants_children is True

