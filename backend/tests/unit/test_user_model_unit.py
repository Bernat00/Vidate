from pydantic import SecretStr

from backend.persistence.model.user import User


def test_user_hash_password_and_check_password():
    hashed = User.hash_password(SecretStr("Password1"))
    user = User(email="hashcheck@example.com", password_hash=hashed)

    assert hashed != "Password1"
    assert user.check_password("Password1") is True
    assert user.check_password("WrongPassword1") is False

