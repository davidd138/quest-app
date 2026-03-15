"""Comprehensive tests for the update_conversation resolver."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-123"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def make_conversation(conv_id=VALID_UUID, user_id=USER_ID, **overrides):
    """Build a mock conversation item."""
    base = {
        "id": conv_id,
        "userId": user_id,
        "status": "in_progress",
        "transcript": "[]",
    }
    base.update(overrides)
    return base


class TestUpdateConversationTranscript:
    """Tests for updating conversation transcript."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_updates_transcript(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        transcript = json.dumps([{"role": "user", "text": "Hello"}])
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "transcript": transcript}
        })
        result = handler(event, None)

        assert result["transcript"] == transcript
        mock_convs.update_item.assert_called_once()

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_transcript_size_limit(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        # 512KB + 1 byte should fail
        huge_transcript = "x" * (524289)
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "transcript": huge_transcript}
        })
        with pytest.raises(Exception, match="transcript"):
            handler(event, None)


class TestUpdateConversationStatus:
    """Tests for updating conversation status."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_updates_status(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "completed"}
        })
        result = handler(event, None)

        assert result["status"] == "completed"

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_updates_to_analyzed(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "analyzed"}
        })
        result = handler(event, None)

        assert result["status"] == "analyzed"

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_invalid_status_enum(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "invalid_status"}
        })
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)


class TestUpdateConversationDuration:
    """Tests for updating conversation duration."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_updates_duration(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "duration": 300}
        })
        result = handler(event, None)

        assert result["duration"] == 300


class TestUpdateConversationMultipleFields:
    """Tests for updating multiple fields at once."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_updates_multiple_fields(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        transcript = json.dumps([{"role": "user", "text": "Hi"}])
        event = make_event(arguments={
            "input": {
                "id": VALID_UUID,
                "transcript": transcript,
                "status": "completed",
                "duration": 180,
            }
        })
        result = handler(event, None)

        assert result["transcript"] == transcript
        assert result["status"] == "completed"
        assert result["duration"] == 180
        mock_convs.update_item.assert_called_once()


class TestUpdateConversationOwnership:
    """Tests for ownership checks."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_wrong_user_rejected(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation(user_id="other-user")
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "completed"}
        })
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_not_found_handling(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "completed"}
        })
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)


class TestUpdateConversationNoOp:
    """Tests for no-op updates."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_no_changes_returns_existing(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={"input": {"id": VALID_UUID}})
        result = handler(event, None)

        assert result == conv
        mock_convs.update_item.assert_not_called()

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_null_values_treated_as_no_change(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = make_conversation()
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": None, "transcript": None}
        })
        result = handler(event, None)

        assert result == conv
        mock_convs.update_item.assert_not_called()
