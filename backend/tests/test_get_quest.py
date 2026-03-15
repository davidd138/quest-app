"""Comprehensive tests for get_quest resolver: retrieval, progress, not found, validation."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", arguments=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": []},
        },
        "arguments": arguments or {},
    }


SAMPLE_QUEST = {
    "id": VALID_UUID,
    "title": "The Lost Temple",
    "description": "An ancient temple awaits explorers.",
    "category": "adventure",
    "difficulty": "hard",
    "totalPoints": 500,
    "estimatedDuration": 60,
    "isPublished": True,
    "stages": [
        {"id": "s1", "order": 1, "title": "Entrance", "points": 100},
        {"id": "s2", "order": 2, "title": "Inner Chamber", "points": 200},
        {"id": "s3", "order": 3, "title": "Treasure Room", "points": 200},
    ],
    "createdAt": "2025-06-01T12:00:00+00:00",
}


class TestGetQuestReturnsCorrectFields:
    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_returns_quest_with_all_fields(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["id"] == VALID_UUID
        assert result["title"] == "The Lost Temple"
        assert result["description"] == "An ancient temple awaits explorers."
        assert result["category"] == "adventure"
        assert result["difficulty"] == "hard"
        assert result["totalPoints"] == 500
        assert result["estimatedDuration"] == 60
        assert len(result["stages"]) == 3

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_fetches_by_correct_key(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        handler(make_event(arguments={"id": VALID_UUID}), None)

        mock_quests.get_item.assert_called_once_with(Key={"id": VALID_UUID})


class TestGetQuestWithProgress:
    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_includes_user_progress_when_exists(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        progress = {
            "id": "p1",
            "userId": "user-1",
            "questId": VALID_UUID,
            "status": "in_progress",
            "currentStageIndex": 1,
            "completedStages": [{"stageId": "s1"}],
        }
        mock_progress.query.return_value = {"Items": [progress]}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert "userProgress" in result
        assert result["userProgress"]["status"] == "in_progress"
        assert result["userProgress"]["currentStageIndex"] == 1

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_no_user_progress_key_when_none(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert "userProgress" not in result

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_completed_progress(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        progress = {
            "id": "p1",
            "userId": "user-1",
            "questId": VALID_UUID,
            "status": "completed",
            "totalPoints": 500,
        }
        mock_progress.query.return_value = {"Items": [progress]}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["userProgress"]["status"] == "completed"
        assert result["userProgress"]["totalPoints"] == 500

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_queries_progress_by_user_and_quest(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        handler(make_event(arguments={"id": VALID_UUID}), None)

        mock_progress.query.assert_called_once()
        call_kwargs = mock_progress.query.call_args[1]
        assert call_kwargs["IndexName"] == "userId-questId-index"


class TestGetQuestNotFound:
    @patch("get_quest.check_user_access")
    @patch("get_quest.quests_table")
    def test_raises_quest_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {}

        from get_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_event(arguments={"id": VALID_UUID}), None)

    @patch("get_quest.check_user_access")
    @patch("get_quest.quests_table")
    def test_raises_when_item_is_none(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": None}

        from get_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_event(arguments={"id": VALID_UUID}), None)


class TestGetQuestValidation:
    @patch("get_quest.check_user_access")
    def test_invalid_uuid_raises(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"id": "not-a-uuid"}), None)

    @patch("get_quest.check_user_access")
    def test_empty_id_raises(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest import handler
        with pytest.raises(Exception):
            handler(make_event(arguments={"id": ""}), None)

    @patch("get_quest.check_user_access")
    def test_short_uuid_raises(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"id": "550e8400"}), None)

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_valid_uuid_v4_accepted(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)
        assert result["id"] == VALID_UUID

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_another_valid_uuid_accepted(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = {**SAMPLE_QUEST, "id": VALID_UUID_2}
        mock_quests.get_item.return_value = {"Item": quest}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID_2}), None)
        assert result["id"] == VALID_UUID_2
