"""Comprehensive tests for get_realtime_token resolver — covers edge cases, caching, and error paths."""
import sys
import os
import json
import time
import pytest
from unittest.mock import patch, MagicMock
from io import BytesIO
from urllib.error import HTTPError, URLError

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", quest_id=VALID_UUID, stage_id=VALID_UUID_2):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": []},
        },
        "arguments": {
            "questId": quest_id,
            "stageId": stage_id,
        },
    }


def make_quest_with_stage(quest_id=VALID_UUID, stage_id=VALID_UUID_2, character=None, challenge=None):
    """Build a quest item with optional character/challenge overrides."""
    default_character = {
        "name": "Test Character",
        "role": "Guide",
        "personality": "Friendly and helpful",
        "backstory": "A wise old sage",
        "voiceStyle": "warm",
        "greetingMessage": "Hello adventurer!",
    }
    default_challenge = {
        "type": "knowledge",
        "description": "Answer the riddle",
    }
    return {
        "id": quest_id,
        "title": "Test Quest",
        "stages": [
            {
                "id": stage_id,
                "title": "Test Stage",
                "character": character if character is not None else default_character,
                "challenge": challenge if challenge is not None else default_challenge,
            },
        ],
    }


def make_openai_response(token="test-token-abc", expires_at=1700000000):
    return json.dumps({
        "client_secret": {
            "value": token,
            "expires_at": expires_at,
        },
    }).encode()


def _mock_urlopen_ok(response_bytes=None):
    """Return a mock that acts as a context-manager returning response_bytes."""
    mock_response = MagicMock()
    mock_response.read.return_value = response_bytes or make_openai_response()
    mock_response.__enter__ = MagicMock(return_value=mock_response)
    mock_response.__exit__ = MagicMock(return_value=False)
    return mock_response


def _reset_cache():
    import get_realtime_token
    get_realtime_token._cached_key = None
    get_realtime_token._cached_at = 0


# ── Quest and stage validation ────────────────────────────────────────

class TestQuestAndStageValidation:
    """Validates that quest and stage existence checks work correctly."""

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_quest_must_exist(self, mock_auth, mock_quests):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {}

        import get_realtime_token
        with pytest.raises(Exception, match="Quest not found"):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_stage_must_exist_in_quest(self, mock_auth, mock_quests):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = make_quest_with_stage()
        quest["stages"][0]["id"] = VALID_UUID_3  # different from requested
        mock_quests.get_item.return_value = {"Item": quest}

        import get_realtime_token
        with pytest.raises(Exception, match="Stage not found"):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_quest_with_empty_stages_list(self, mock_auth, mock_quests):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = {"id": VALID_UUID, "title": "Empty Quest", "stages": []}
        mock_quests.get_item.return_value = {"Item": quest}

        import get_realtime_token
        with pytest.raises(Exception, match="Stage not found"):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_quest_with_no_stages_key(self, mock_auth, mock_quests):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = {"id": VALID_UUID, "title": "No Stages Quest"}
        mock_quests.get_item.return_value = {"Item": quest}

        import get_realtime_token
        with pytest.raises(Exception, match="Stage not found"):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_finds_stage_among_multiple(self, mock_auth, mock_quests):
        """When quest has multiple stages, it finds the correct one."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = make_quest_with_stage()
        quest["stages"].insert(0, {
            "id": VALID_UUID_3,
            "title": "Other Stage",
            "character": {"name": "Other", "role": "NPC", "voiceStyle": "alloy"},
            "challenge": {"description": "other"},
        })
        mock_quests.get_item.return_value = {"Item": quest}

        import get_realtime_token
        _reset_cache()

        with patch("get_realtime_token.secrets_client") as mock_secrets, \
             patch("get_realtime_token.request.urlopen") as mock_urlopen:
            mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}
            mock_urlopen.return_value = _mock_urlopen_ok()

            result = get_realtime_token.handler(make_event(), None)
            assert result["token"] == "test-token-abc"

            # Verify it used the correct character
            req_obj = mock_urlopen.call_args[0][0]
            body = json.loads(req_obj.data)
            assert "Test Character" in body["instructions"]
            assert "Other" not in body["instructions"]


# ── Session config and voice mapping ──────────────────────────────────

class TestSessionConfig:
    """Tests that the OpenAI session request body is built correctly."""

    def _call_handler_and_get_body(self, character=None, challenge=None):
        """Helper: invoke handler and return the JSON body sent to OpenAI."""
        import get_realtime_token
        _reset_cache()

        quest = make_quest_with_stage(character=character, challenge=challenge)

        with patch("get_realtime_token.check_user_access") as mock_auth, \
             patch("get_realtime_token.quests_table") as mock_quests, \
             patch("get_realtime_token.secrets_client") as mock_secrets, \
             patch("get_realtime_token.request.urlopen") as mock_urlopen:

            mock_auth.return_value = {"userId": "user-1", "status": "active"}
            mock_quests.get_item.return_value = {"Item": quest}
            mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}
            mock_urlopen.return_value = _mock_urlopen_ok()

            get_realtime_token.handler(make_event(), None)

            req_obj = mock_urlopen.call_args[0][0]
            return json.loads(req_obj.data)

    def test_voice_map_friendly(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "friendly", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "alloy"

    def test_voice_map_authoritative(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "authoritative", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "echo"

    def test_voice_map_mysterious(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "mysterious", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "fable"

    def test_voice_map_warm(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "warm", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "shimmer"

    def test_voice_map_gruff(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "gruff", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "onyx"

    def test_voice_map_cheerful(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "cheerful", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "nova"

    def test_voice_map_unknown_falls_through(self):
        body = self._call_handler_and_get_body(
            character={"name": "A", "role": "R", "personality": "P", "backstory": "B",
                       "voiceStyle": "robotic", "greetingMessage": "Hi"},
        )
        assert body["voice"] == "robotic"

    def test_instructions_include_persona_details(self):
        body = self._call_handler_and_get_body(
            character={
                "name": "Luna",
                "role": "Mystic Seer",
                "personality": "Enigmatic and cryptic",
                "backstory": "Born under twin moons",
                "voiceStyle": "mysterious",
                "greetingMessage": "The stars foretold your coming...",
            },
            challenge={"description": "Decode the celestial cipher"},
        )
        assert "Luna" in body["instructions"]
        assert "Mystic Seer" in body["instructions"]
        assert "Enigmatic and cryptic" in body["instructions"]
        assert "Born under twin moons" in body["instructions"]
        assert "Decode the celestial cipher" in body["instructions"]
        assert "The stars foretold your coming..." in body["instructions"]

    def test_model_is_correct(self):
        body = self._call_handler_and_get_body()
        assert body["model"] == "gpt-4o-realtime-preview-2024-12-17"

    def test_modalities_include_audio_and_text(self):
        body = self._call_handler_and_get_body()
        assert "audio" in body["modalities"]
        assert "text" in body["modalities"]

    def test_instructions_contain_stay_in_character(self):
        body = self._call_handler_and_get_body()
        assert "Stay in character" in body["instructions"]


# ── Missing / partial character data ──────────────────────────────────

class TestMissingCharacterData:
    """Handles graceful defaults when character or challenge data is incomplete."""

    def _call_handler_and_get_body(self, character, challenge=None):
        import get_realtime_token
        _reset_cache()

        quest = make_quest_with_stage(character=character, challenge=challenge or {})

        with patch("get_realtime_token.check_user_access") as mock_auth, \
             patch("get_realtime_token.quests_table") as mock_quests, \
             patch("get_realtime_token.secrets_client") as mock_secrets, \
             patch("get_realtime_token.request.urlopen") as mock_urlopen:

            mock_auth.return_value = {"userId": "user-1", "status": "active"}
            mock_quests.get_item.return_value = {"Item": quest}
            mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}
            mock_urlopen.return_value = _mock_urlopen_ok()

            get_realtime_token.handler(make_event(), None)

            req_obj = mock_urlopen.call_args[0][0]
            return json.loads(req_obj.data)

    def test_empty_character_uses_defaults(self):
        body = self._call_handler_and_get_body(character={})
        assert "a character" in body["instructions"]
        assert "NPC" in body["instructions"]
        assert "Hello!" in body["instructions"]

    def test_missing_name_uses_default(self):
        body = self._call_handler_and_get_body(character={"role": "Guard"})
        assert "a character" in body["instructions"]

    def test_missing_role_uses_npc(self):
        body = self._call_handler_and_get_body(character={"name": "Bob"})
        assert "NPC" in body["instructions"]

    def test_missing_personality_still_works(self):
        body = self._call_handler_and_get_body(
            character={"name": "Bob", "role": "Guard", "voiceStyle": "warm"},
        )
        assert "Bob" in body["instructions"]

    def test_missing_backstory_still_works(self):
        body = self._call_handler_and_get_body(
            character={"name": "Bob", "role": "Guard", "personality": "Stern"},
        )
        assert "Stern" in body["instructions"]

    def test_missing_challenge_description(self):
        body = self._call_handler_and_get_body(
            character={"name": "Bob", "role": "Guard", "voiceStyle": "warm"},
            challenge={},
        )
        # Should still produce valid instructions without crashing
        assert "Bob" in body["instructions"]

    def test_missing_voice_style_defaults_to_alloy(self):
        body = self._call_handler_and_get_body(character={"name": "Bob"})
        assert body["voice"] == "alloy"

    def test_character_stored_as_json_string(self):
        """Character data stored as JSON string in DynamoDB."""
        import get_realtime_token
        _reset_cache()

        quest = make_quest_with_stage()
        quest["stages"][0]["character"] = json.dumps(quest["stages"][0]["character"])

        with patch("get_realtime_token.check_user_access") as mock_auth, \
             patch("get_realtime_token.quests_table") as mock_quests, \
             patch("get_realtime_token.secrets_client") as mock_secrets, \
             patch("get_realtime_token.request.urlopen") as mock_urlopen:

            mock_auth.return_value = {"userId": "user-1", "status": "active"}
            mock_quests.get_item.return_value = {"Item": quest}
            mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}
            mock_urlopen.return_value = _mock_urlopen_ok()

            result = get_realtime_token.handler(make_event(), None)
            assert result["token"] == "test-token-abc"

    def test_challenge_stored_as_json_string(self):
        """Challenge data stored as JSON string in DynamoDB."""
        import get_realtime_token
        _reset_cache()

        quest = make_quest_with_stage()
        quest["stages"][0]["challenge"] = json.dumps(quest["stages"][0]["challenge"])

        with patch("get_realtime_token.check_user_access") as mock_auth, \
             patch("get_realtime_token.quests_table") as mock_quests, \
             patch("get_realtime_token.secrets_client") as mock_secrets, \
             patch("get_realtime_token.request.urlopen") as mock_urlopen:

            mock_auth.return_value = {"userId": "user-1", "status": "active"}
            mock_quests.get_item.return_value = {"Item": quest}
            mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}
            mock_urlopen.return_value = _mock_urlopen_ok()

            result = get_realtime_token.handler(make_event(), None)
            assert result["token"] == "test-token-abc"


# ── Token caching ─────────────────────────────────────────────────────

class TestTokenCaching:
    """Verifies module-level secret caching behaviour."""

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_fresh_cache_skips_secrets_manager(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_urlopen.return_value = _mock_urlopen_ok()

        import get_realtime_token
        get_realtime_token._cached_key = "sk-cached"
        get_realtime_token._cached_at = time.time()

        get_realtime_token.handler(make_event(), None)
        mock_secrets.get_secret_value.assert_not_called()

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_expired_cache_refreshes_from_secrets_manager(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-refreshed"}
        mock_urlopen.return_value = _mock_urlopen_ok()

        import get_realtime_token
        get_realtime_token._cached_key = "sk-old"
        get_realtime_token._cached_at = time.time() - 301  # past TTL

        get_realtime_token.handler(make_event(), None)
        mock_secrets.get_secret_value.assert_called_once()

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_no_cache_fetches_from_secrets_manager(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-new"}
        mock_urlopen.return_value = _mock_urlopen_ok()

        import get_realtime_token
        _reset_cache()

        get_realtime_token.handler(make_event(), None)
        mock_secrets.get_secret_value.assert_called_once()

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_cache_at_boundary_299s_still_fresh(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_urlopen.return_value = _mock_urlopen_ok()

        import get_realtime_token
        get_realtime_token._cached_key = "sk-cached"
        get_realtime_token._cached_at = time.time() - 299  # just under TTL

        get_realtime_token.handler(make_event(), None)
        mock_secrets.get_secret_value.assert_not_called()

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_refreshed_key_used_in_authorization_header(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-new-key-123"}
        mock_urlopen.return_value = _mock_urlopen_ok()

        import get_realtime_token
        _reset_cache()

        get_realtime_token.handler(make_event(), None)

        req_obj = mock_urlopen.call_args[0][0]
        assert req_obj.get_header("Authorization") == "Bearer sk-new-key-123"


# ── OpenAI error handling ─────────────────────────────────────────────

class TestOpenAIErrorHandling:
    """Tests error scenarios from the OpenAI API call."""

    def _setup_handler(self):
        import get_realtime_token
        _reset_cache()
        return get_realtime_token

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_invalid_json_from_openai(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}

        mod = self._setup_handler()

        mock_response = MagicMock()
        mock_response.read.return_value = b"not valid json at all"
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with pytest.raises(Exception):
            mod.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_network_timeout(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}

        mod = self._setup_handler()

        mock_urlopen.side_effect = URLError("Connection timed out")

        with pytest.raises(Exception):
            mod.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_http_401_unauthorized(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-bad"}

        mod = self._setup_handler()

        mock_urlopen.side_effect = HTTPError(
            url="https://api.openai.com/v1/realtime/sessions",
            code=401, msg="Unauthorized", hdrs=None,
            fp=BytesIO(b"Unauthorized"),
        )

        with pytest.raises(Exception):
            mod.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_http_429_rate_limited(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}

        mod = self._setup_handler()

        mock_urlopen.side_effect = HTTPError(
            url="https://api.openai.com/v1/realtime/sessions",
            code=429, msg="Too Many Requests", hdrs=None,
            fp=BytesIO(b"Rate limited"),
        )

        with pytest.raises(Exception):
            mod.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_http_500_server_error(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}

        mod = self._setup_handler()

        mock_urlopen.side_effect = HTTPError(
            url="https://api.openai.com/v1/realtime/sessions",
            code=500, msg="Internal Server Error", hdrs=None,
            fp=BytesIO(b"Server Error"),
        )

        with pytest.raises(Exception):
            mod.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_openai_response_missing_client_secret(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}

        mod = self._setup_handler()

        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({"status": "ok"}).encode()
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with pytest.raises(Exception):
            mod.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_openai_empty_response_body(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-key"}

        mod = self._setup_handler()

        mock_response = MagicMock()
        mock_response.read.return_value = b""
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        with pytest.raises(Exception):
            mod.handler(make_event(), None)


# ── Input validation ──────────────────────────────────────────────────

class TestInputValidation:
    @patch("get_realtime_token.check_user_access")
    def test_empty_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        import get_realtime_token
        event = make_event(quest_id="")
        with pytest.raises(Exception, match="must be a non-empty string"):
            get_realtime_token.handler(event, None)

    @patch("get_realtime_token.check_user_access")
    def test_empty_stage_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        import get_realtime_token
        event = make_event(stage_id="")
        with pytest.raises(Exception, match="must be a non-empty string"):
            get_realtime_token.handler(event, None)

    @patch("get_realtime_token.check_user_access")
    def test_sql_injection_quest_id(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        import get_realtime_token
        event = make_event(quest_id="'; DROP TABLE quests; --")
        with pytest.raises(Exception, match="must be a valid UUID"):
            get_realtime_token.handler(event, None)

    @patch("get_realtime_token.check_user_access")
    def test_numeric_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        import get_realtime_token
        event = make_event(quest_id="12345")
        with pytest.raises(Exception, match="must be a valid UUID"):
            get_realtime_token.handler(event, None)
