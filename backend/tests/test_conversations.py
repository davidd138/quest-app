"""Tests for conversation resolvers: create, update, get, list."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

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


# ── create_conversation ────────────────────────────────────────────────

class TestCreateConversation:
    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_create_conversation_success(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = {
            "id": VALID_UUID,
            "stages": [
                {
                    "id": VALID_UUID_2,
                    "character": {"name": "Pedro", "role": "Merchant"},
                }
            ],
        }
        mock_quests.get_item.return_value = {"Item": quest}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["userId"] == USER_ID
        assert result["questId"] == VALID_UUID
        assert result["stageId"] == VALID_UUID_2
        assert result["characterName"] == "Pedro"
        assert result["status"] == "in_progress"
        assert result["transcript"] == "[]"
        mock_convs.put_item.assert_called_once()

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.quests_table")
    def test_create_conversation_quest_not_found(self, mock_quests, mock_auth):
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
    def test_create_conversation_stage_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = {"id": VALID_UUID, "stages": [{"id": "other-stage-id"}]}
        mock_quests.get_item.return_value = {"Item": quest}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception, match="Stage not found"):
            handler(event, None)

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_create_conversation_no_character_defaults_unknown(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = {"id": VALID_UUID, "stages": [{"id": VALID_UUID_2}]}
        mock_quests.get_item.return_value = {"Item": quest}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": VALID_UUID, "stageId": VALID_UUID_2}
        })
        result = handler(event, None)

        assert result["characterName"] == "Unknown"

    @patch("create_conversation.check_user_access")
    def test_create_conversation_invalid_quest_id(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from create_conversation import handler
        event = make_event(arguments={
            "input": {"questId": "bad", "stageId": VALID_UUID_2}
        })
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)


# ── update_conversation ────────────────────────────────────────────────

class TestUpdateConversation:
    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_transcript(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID, "status": "in_progress"}
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
    def test_update_status(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID, "status": "in_progress"}
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "completed"}
        })
        result = handler(event, None)

        assert result["status"] == "completed"

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_duration(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID}
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "duration": 300}
        })
        result = handler(event, None)

        assert result["duration"] == 300

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_not_found_or_unauthorized(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {}

        from update_conversation import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "completed"}})
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_wrong_user(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": "other-user"}
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "completed"}})
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_invalid_status(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID}
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "invalid"}})
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_no_changes_returns_existing(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID, "status": "in_progress"}
        mock_convs.get_item.return_value = {"Item": conv}

        from update_conversation import handler
        event = make_event(arguments={"input": {"id": VALID_UUID}})
        result = handler(event, None)

        assert result == conv
        mock_convs.update_item.assert_not_called()


# ── get_conversation ───────────────────────────────────────────────────

class TestGetConversation:
    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_get_conversation_success(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": USER_ID, "status": "in_progress"}
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result == conv

    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_get_conversation_not_found(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {}

        from get_conversation import handler
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"id": VALID_UUID}), None)

    @patch("get_conversation.check_user_access")
    @patch("get_conversation.conversations_table")
    def test_get_conversation_wrong_user(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": "other-user"}
        mock_convs.get_item.return_value = {"Item": conv}

        from get_conversation import handler
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"id": VALID_UUID}), None)

    @patch("get_conversation.check_user_access")
    def test_get_conversation_invalid_id(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_conversation import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"id": "bad"}), None)


# ── list_conversations ─────────────────────────────────────────────────

class TestListConversations:
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_list_conversations_basic(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        items = [
            {"id": "c1", "userId": USER_ID},
            {"id": "c2", "userId": USER_ID},
        ]
        mock_convs.query.return_value = {"Items": items}

        from list_conversations import handler
        result = handler(make_event(), None)

        assert result["items"] == items

    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_list_conversations_with_quest_filter(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler
        event = make_event(arguments={"questId": VALID_UUID})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert "FilterExpression" in call_kwargs

    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_list_conversations_pagination(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {
            "Items": [{"id": "c1"}],
            "LastEvaluatedKey": {"id": "c1", "userId": USER_ID},
        }

        from list_conversations import handler
        result = handler(make_event(), None)

        assert "nextToken" in result
        assert result["nextToken"] is not None

    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_list_conversations_with_limit(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler
        event = make_event(arguments={"limit": 5})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["Limit"] == 5

    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_list_conversations_with_next_token(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler
        start_key = json.dumps({"id": "c1", "userId": USER_ID})
        event = make_event(arguments={"nextToken": start_key})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["ExclusiveStartKey"] == {"id": "c1", "userId": USER_ID}
