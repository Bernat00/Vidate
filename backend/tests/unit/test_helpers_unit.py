from pydantic import BaseModel

from backend.helpers import copy_non_none_fields


class SourceModel(BaseModel):
    first_name: str | None = None
    age: int | None = None
    ignored: str | None = None


class TargetModel(BaseModel):
    first_name: str = "Original"
    age: int = 21


def test_copy_non_none_fields_updates_only_known_non_none_fields():
    source = SourceModel(first_name="Updated", age=None, ignored="skip")
    target = TargetModel()

    copy_non_none_fields(source, target)

    assert target.first_name == "Updated"
    assert target.age == 21
    assert not hasattr(target, "ignored")

