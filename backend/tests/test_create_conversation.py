"""Comprehensive tests for the create_conversation resolver."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-123"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def make_quest(quest_id=VALID_UUID, stages=None):
    """Build a mock quest with stages."""
    if stages is None:
        stages = [
            {
                "id": VALID_UUID_2,
                "title": "Stage 1",
                "character": {"name": "Pedro", "role": "Merchant"},
            }
        ]
    return {"id": quest_id, "stages": stages}


class TestCreateConversationSuccess:
    """Tests for successful conversation creation."""

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_creates_with_correct_fields(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest()}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["userId"] == USER_ID
        assert result["questId"] == VALID_UUID
        assert result["stageId"] == VALID_UUID_2
        assert result["transcript"] == "[]"
        mock_convs.put_item.assert_called_once()

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_links_to_quest_and_stage(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest()}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["questId"] == VALID_UUID
        assert result["stageId"] == VALID_UUID_2

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_gets_character_name_from_quest(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = make_quest(stages=[
            {"id": VALID_UUID_2, "character": {"name": "Maria", "role": "Guide"}}
        ])
        mock_quests.get_item.return_value = {"Item": quest}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["characterName"] == "Maria"

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_defaults_character_name_to_unknown(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = make_quest(stages=[{"id": VALID_UUID_2}])
        mock_quests.get_item.return_value = {"Item": quest}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["characterName"] == "Unknown"

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_generates_conversation_id(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest()}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert "id" in result
        assert len(result["id"]) == 36

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_sets_status_to_in_progress(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest()}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["status"] == "in_progress"

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_sets_started_at_timestamp(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest()}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert "startedAt" in result
        # Verify it's a valid ISO timestamp
        datetime.fromisoformat(result["startedAt"])


class TestCreateConversationErrors:
    """Tests for error conditions in create_conversation."""

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.quests_table")
    def test_missing_quest_raises_error(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception, match="Quest not found"):
            handler(event, None)

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.quests_table")
    def test_missing_stage_raises_error(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = make_quest(stages=[{"id": "other-stage-id"}])
        mock_quests.get_item.return_value = {"Item": quest}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception, match="Stage not found"):
            handler(event, None)

    @patch("create_conversation.check_user_access")
    def test_invalid_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": "bad-id", "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)

    @patch("create_conversation.check_user_access")
    def test_invalid_stage_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": "not-a-uuid"}
        })
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)

    @patch("create_conversation.check_user_access")
    def test_empty_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": "", "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_conversation.check_user_access")
    def test_none_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": None, "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception):
            handler(event, None)
