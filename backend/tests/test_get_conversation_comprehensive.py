"""Comprehensive tests for get_conversation resolver — edge cases and security."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-123"
OTHER_USER = "user-999"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


class TestGetConversationComprehensive:
    """Comprehensive edge-case tests for get_conversation."""

    # 1. Returns conversation with all fields
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_returns_conversation_all_fields(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "questId": VALID_UUID_2,
            "stageId": "stage-1",
            "status": "completed",
            "characterName": "Pedro",
            "transcript": json.dumps([{"role": "user", "text": "Hello"}]),
            "duration": 300,
            "startedAt": "2025-01-01T00:00:00Z",
            "completedAt": "2025-01-01T00:05:00Z",
            "challengeResult": {"passed": True, "score": 85},
        }
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["id"] == VALID_UUID
        assert result["userId"] == USER_ID
        assert result["questId"] == VALID_UUID_2
        assert result["status"] == "completed"
        assert result["characterName"] == "Pedro"
        assert result["duration"] == 300
        assert result["challengeResult"]["passed"] is True

    # 2. Ownership check — wrong user rejected
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_ownership_check_rejects_wrong_user(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": OTHER_USER}
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"id": VALID_UUID}), None)

    # 3. Not found
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_conversation_not_found(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {}

        from get_conversation import handler

        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"id": VALID_UUID}), None)

    # 4. Invalid UUID
    @patch("get_conversation.check_user_access")
    def test_invalid_uuid_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_conversation import handler

        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"id": "not-a-uuid"}), None)

    # 5. Empty UUID
    @patch("get_conversation.check_user_access")
    def test_empty_uuid_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_conversation import handler

        with pytest.raises(Exception, match="non-empty string"):
            handler(make_event(arguments={"id": ""}), None)

    # 6. Returns challengeResult if present
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_returns_challenge_result_if_present(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        challenge_result = {
            "passed": True,
            "score": 92,
            "feedback": "Excellent conversation!",
        }
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "challengeResult": challenge_result,
        }
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["challengeResult"]["passed"] is True
        assert result["challengeResult"]["score"] == 92
        assert result["challengeResult"]["feedback"] == "Excellent conversation!"

    # 7. Returns null challengeResult if not analyzed
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_returns_no_challenge_result_if_not_analyzed(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "status": "in_progress",
        }
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert "challengeResult" not in result

    # 8. Returns transcript as string
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_returns_transcript_as_string(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        transcript = json.dumps([
            {"role": "user", "text": "Hello"},
            {"role": "assistant", "text": "Welcome, traveler!"},
        ])
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "transcript": transcript,
        }
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert isinstance(result["transcript"], str)
        parsed = json.loads(result["transcript"])
        assert len(parsed) == 2
        assert parsed[0]["role"] == "user"

    # 9. Returns duration
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_returns_duration(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "duration": 450,
        }
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["duration"] == 450

    # 10. Returns character name
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_returns_character_name(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "characterName": "Dr. Elena Vidal",
        }
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["characterName"] == "Dr. Elena Vidal"

    # 11. Correct DynamoDB get_item key
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_correct_dynamo_key(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID}
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler

        handler(make_event(arguments={"id": VALID_UUID}), None)

        mock_convs.get_item.assert_called_once_with(Key={"id": VALID_UUID})

    # 12. Suspended user rejected
    @patch("get_conversation.check_user_access", side_effect=PermissionError("Account is suspended"))
    def test_suspended_user_rejected(self, mock_auth):
        from get_conversation import handler

        with pytest.raises(PermissionError, match="suspended"):
            handler(make_event(arguments={"id": VALID_UUID}), None)
