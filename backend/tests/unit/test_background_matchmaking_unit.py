from types import SimpleNamespace

import pytest

import backend.background.matchmaking as mm


class _FTSearchResult:
    def __init__(self, docs):
        self.docs = docs


class _FakePipeline:
    def __init__(self, geodists):
        self._geodists = geodists

    def geodist(self, *_args, **_kwargs):
        return self

    async def execute(self):
        return self._geodists


class _FakeRedisForBuild:
    def __init__(self, docs, geodists):
        self._docs = docs
        self._geodists = geodists

    def ft(self, _index):
        return self

    async def search(self, _query):
        return _FTSearchResult(self._docs)

    def pipeline(self):
        return _FakePipeline(self._geodists)


@pytest.mark.asyncio
async def test_try_claim_pair_true_and_false():
    class _R:
        def __init__(self, result):
            self.result = result

        async def eval(self, *_args):
            return self.result

    assert await mm._try_claim_pair(_R(1), "u1", "u2") is True
    assert await mm._try_claim_pair(_R(0), "u1", "u2") is False


def test_escape_tag_value_escapes_reserved_chars():
    assert mm._escape_tag_value("a,b c") == "a\\,b\\ c"


@pytest.mark.asyncio
async def test_build_candidates_scores_and_sorts():
    docs = [
        SimpleNamespace(
            user_id="u2",
            age="30",
            gender="2",
            languages="1,2",
            religion="1",
            is_smoker="0",
            wants_children="1",
        ),
        SimpleNamespace(
            user_id="u3",
            age="70",
            gender="2",
            languages="3",
            religion="2",
            is_smoker="1",
            wants_children="0",
        ),
    ]
    r = _FakeRedisForBuild(docs, geodists=[10.0, None])

    user_data = {
        "gender": "1",
        "pref_genders": "2",
        "blocked_ids": "",
        "history_ids": "u3",
        "pref_age_min": "25",
        "pref_age_max": "35",
        "languages": "1",
        "pref_religions": "1",
        "pref_is_smoker": "0",
        "pref_wants_children": "1",
    }

    candidates = await mm._build_candidates(r, "u1", user_data)

    assert len(candidates) == 2
    assert candidates[0][0] == "u2"


@pytest.mark.asyncio
async def test_attempt_match_for_user_handles_missing_and_success(monkeypatch):
    class _ConversationRepo:
        def __init__(self):
            self.saved = []

        async def save(self, conversation):
            conversation.id = "conv-1"
            self.saved.append(conversation)

    class _Repo:
        def __init__(self):
            self.conversation_repo = _ConversationRepo()

    class _R:
        def __init__(self):
            self.store = {
                "mm_entry:u1": {"first_name": "A", "age": "20", "joined_at": "1"},
                "mm_entry:u2": {"first_name": "B", "age": "21", "joined_at": "1"},
            }
            self.calls = []

        async def zscore(self, _key, _member):
            return 1

        async def hgetall(self, key):
            return self.store.get(key, {})

        async def zrem(self, key, *members):
            self.calls.append(("zrem", key, members))

        async def publish(self, channel, payload):
            self.calls.append(("publish", channel, payload))

        async def delete(self, key):
            self.calls.append(("delete", key))

    r = _R()
    repo = _Repo()

    async def fake_build_candidates(_r, _uid, _ud):
        return [("u2", 999.0, 3.0)]

    async def fake_claim(_r, _uid1, _uid2):
        return True

    monkeypatch.setattr(mm, "_build_candidates", fake_build_candidates)
    monkeypatch.setattr(mm, "_try_claim_pair", fake_claim)

    matched = await mm.attempt_match_for_user(r, "u1", repo)

    assert matched is True
    assert repo.conversation_repo.saved
    assert any(c[0] == "publish" for c in r.calls)

