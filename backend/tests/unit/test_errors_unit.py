from backend.errors import MatchAlreadyConfirmedError, SameValueError


def test_same_value_error_stores_value():
    err = SameValueError("same")
    assert err.value == "same"


def test_match_already_confirmed_error_type():
    err = MatchAlreadyConfirmedError()
    assert isinstance(err, Exception)

