"""Tests for get_realtime_token resolver with mocked Secrets Manager and HTTP."""
import sys
import os
import json
import time
import pytest
from unittest.mock import patch, MagicMock, PropertyMock
from io import BytesIO

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"


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


def make_quest_with_stage(quest_id=VALID_UUID, stage_id=VALID_UUID_2):
    """Build a quest item with a stage containing character and challenge data."""
    return {
        "id": quest_id,
        "title": "Test Quest",
        "stages": [
            {
                "id": stage_id,
                "title": "Test Stage",
                "character": {
                    "name": "Test Character",
                    "role": "Guide",
                    "personality": "Friendly and helpful",
                    "backstory": "A wise old sage",
                    "voiceStyle": "warm",
                    "greetingMessage": "Hello adventurer!",
                },
                "challenge": {
                    "type": "knowledge",
                    "description": "Answer the riddle",
                },
            },
        ],
    }


def make_openai_response():
    """Build a mock OpenAI realtime session response."""
    return json.dumps({
        "client_secret": {
            "value": "test-ephemeral-token-abc123",
            "expires_at": 1700000000,
        },
    }).encode()


class TestGetRealtimeToken:
    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_success_returns_token(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-test-key"}

        # Reset cache
        import get_realtime_token
        get_realtime_token._cached_key = None
        get_realtime_token._cached_at = 0

        # Mock urlopen context manager
        mock_response = MagicMock()
        mock_response.read.return_value = make_openai_response()
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = get_realtime_token.handler(make_event(), None)

        assert result["token"] == "test-ephemeral-token-abc123"
        assert result["expiresAt"] == 1700000000
        mock_secrets.get_secret_value.assert_called_once()

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_caches_secret_for_300_seconds(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-test-key"}

        import get_realtime_token
        # Pre-set the cache as if it was recently fetched
        get_realtime_token._cached_key = "sk-cached-key"
        get_realtime_token._cached_at = time.time()  # just now

        mock_response = MagicMock()
        mock_response.read.return_value = make_openai_response()
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        get_realtime_token.handler(make_event(), None)

        # Should NOT have called secrets manager because cache is fresh
        mock_secrets.get_secret_value.assert_not_called()

        # Now simulate expired cache
        get_realtime_token._cached_at = time.time() - 301
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-new-key"}

        get_realtime_token.handler(make_event(), None)

        # NOW it should have called secrets manager
        mock_secrets.get_secret_value.assert_called_once()

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_handles_openai_api_error(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-test-key"}

        import get_realtime_token
        get_realtime_token._cached_key = None
        get_realtime_token._cached_at = 0

        # Simulate HTTP error from OpenAI
        from urllib.error import HTTPError
        mock_urlopen.side_effect = HTTPError(
            url="https://api.openai.com/v1/realtime/sessions",
            code=401,
            msg="Unauthorized",
            hdrs=None,
            fp=BytesIO(b"Unauthorized"),
        )

        with pytest.raises(Exception):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.check_user_access")
    def test_validates_quest_id(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        import get_realtime_token
        event = make_event(quest_id="not-a-uuid")

        with pytest.raises(Exception, match="must be a valid UUID"):
            get_realtime_token.handler(event, None)

    @patch("get_realtime_token.check_user_access")
    def test_validates_stage_id(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        import get_realtime_token
        event = make_event(stage_id="bad-id")

        with pytest.raises(Exception, match="must be a valid UUID"):
            get_realtime_token.handler(event, None)

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_quest_not_found(self, mock_auth, mock_quests):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {}

        import get_realtime_token
        with pytest.raises(Exception, match="Quest not found"):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_stage_not_found_in_quest(self, mock_auth, mock_quests):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = make_quest_with_stage()
        quest["stages"][0]["id"] = "00000000-0000-4000-8000-000000000099"
        mock_quests.get_item.return_value = {"Item": quest}

        import get_realtime_token
        with pytest.raises(Exception, match="Stage not found"):
            get_realtime_token.handler(make_event(), None)

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_builds_correct_character_instructions(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest_with_stage()}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-test-key"}

        import get_realtime_token
        get_realtime_token._cached_key = None
        get_realtime_token._cached_at = 0

        mock_response = MagicMock()
        mock_response.read.return_value = make_openai_response()
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        get_realtime_token.handler(make_event(), None)

        # Inspect the request body sent to OpenAI
        call_args = mock_urlopen.call_args
        req_obj = call_args[0][0]
        body = json.loads(req_obj.data)

        assert "Test Character" in body["instructions"]
        assert "Guide" in body["instructions"]
        assert "Friendly and helpful" in body["instructions"]
        assert "A wise old sage" in body["instructions"]
        assert "Answer the riddle" in body["instructions"]
        assert "Hello adventurer!" in body["instructions"]
        assert body["model"] == "gpt-4o-realtime-preview-2024-12-17"

    @patch("get_realtime_token.request.urlopen")
    @patch("get_realtime_token.secrets_client")
    @patch("get_realtime_token.quests_table")
    @patch("get_realtime_token.check_user_access")
    def test_handles_stages_as_json_string(self, mock_auth, mock_quests, mock_secrets, mock_urlopen):
        """Verify the resolver can handle stages stored as a JSON string in DynamoDB."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = make_quest_with_stage()
        quest["stages"] = json.dumps(quest["stages"])
        mock_quests.get_item.return_value = {"Item": quest}
        mock_secrets.get_secret_value.return_value = {"SecretString": "sk-test-key"}

        import get_realtime_token
        get_realtime_token._cached_key = None
        get_realtime_token._cached_at = 0

        mock_response = MagicMock()
        mock_response.read.return_value = make_openai_response()
        mock_response.__enter__ = MagicMock(return_value=mock_response)
        mock_response.__exit__ = MagicMock(return_value=False)
        mock_urlopen.return_value = mock_response

        result = get_realtime_token.handler(make_event(), None)
        assert result["token"] == "test-ephemeral-token-abc123"
