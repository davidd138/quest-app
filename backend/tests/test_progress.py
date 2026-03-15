"""Tests for progress resolvers: start_quest, get_progress, update_progress, complete_stage."""
import sys
import os
import json
import uuid
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440000"
VALID_UUID_4 = "880e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-123"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


# ── start_quest ────────────────────────────────────────────────────────

class TestStartQuest:
    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_start_quest_creates_progress(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "isPublished": True}}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["userId"] == USER_ID
        assert result["questId"] == VALID_UUID
        assert result["status"] == "in_progress"
        assert result["currentStageIndex"] == 0
        assert result["completedStages"] == []
        mock_progress.put_item.assert_called_once()

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_start_quest_returns_existing_progress(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "isPublished": True}}
        existing = {"id": "p1", "userId": USER_ID, "questId": VALID_UUID, "status": "in_progress"}
        mock_progress.query.return_value = {"Items": [existing]}

        from start_quest import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result == existing
        mock_progress.put_item.assert_not_called()

    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_start_quest_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {}

        from start_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_event(arguments={"questId": VALID_UUID}), None)

    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_start_quest_not_published(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "isPublished": False}}

        from start_quest import handler
        with pytest.raises(Exception, match="Quest is not available"):
            handler(make_event(arguments={"questId": VALID_UUID}), None)

    @patch("start_quest.check_user_access")
    def test_start_quest_invalid_uuid(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from start_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"questId": "bad"}), None)


# ── get_progress ───────────────────────────────────────────────────────

class TestGetProgress:
    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_get_progress_found(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress = {"id": "p1", "userId": USER_ID, "questId": VALID_UUID}
        mock_progress.query.return_value = {"Items": [progress]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result == progress

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_get_progress_not_found(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_progress.query.return_value = {"Items": []}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result is None

    @patch("get_progress.check_user_access")
    def test_get_progress_invalid_quest_id(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_progress import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"questId": "invalid"}), None)


# ── update_progress ────────────────────────────────────────────────────

class TestUpdateProgress:
    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_progress_status(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = {"id": VALID_UUID, "userId": USER_ID, "status": "in_progress"}
        mock_progress.get_item.return_value = {"Item": existing}
        updated = {**existing, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "completed"}})
        result = handler(event, None)

        assert result["status"] == "completed"

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_progress_stage_index(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = {"id": VALID_UUID, "userId": USER_ID, "currentStageIndex": 0}
        mock_progress.get_item.return_value = {"Item": existing}
        updated = {**existing, "currentStageIndex": 2}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": 2}})
        result = handler(event, None)

        assert result["currentStageIndex"] == 2

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_progress_not_found(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_progress.get_item.return_value = {}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID}})
        with pytest.raises(Exception, match="Progress not found"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_progress_wrong_user(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = {"id": VALID_UUID, "userId": "other-user"}
        mock_progress.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "completed"}})
        with pytest.raises(Exception, match="Not authorized"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_progress_invalid_status(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = {"id": VALID_UUID, "userId": USER_ID}
        mock_progress.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "invalid"}})
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_progress_negative_stage_index(self, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = {"id": VALID_UUID, "userId": USER_ID}
        mock_progress.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": -1}})
        with pytest.raises(Exception, match="non-negative integer"):
            handler(event, None)


# ── complete_stage ─────────────────────────────────────────────────────

class TestCompleteStage:
    def _make_quest(self, stage_ids=None):
        if stage_ids is None:
            stage_ids = [VALID_UUID_2]
        stages = [
            {"id": sid, "title": f"Stage {i+1}", "rewardPoints": 100}
            for i, sid in enumerate(stage_ids)
        ]
        return {"id": VALID_UUID, "title": "Quest", "stages": stages}

    def _make_conversation(self, conv_id=VALID_UUID_3, user_id=USER_ID):
        return {
            "id": conv_id,
            "userId": user_id,
            "duration": 300,
            "result": "completed",
        }

    def _make_progress(self, user_id=USER_ID, quest_id=VALID_UUID):
        return {
            "id": VALID_UUID_4,
            "userId": user_id,
            "questId": quest_id,
            "currentStageIndex": 0,
            "completedStages": [],
            "status": "in_progress",
            "totalPoints": 0,
            "totalDuration": 0,
        }

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_complete_stage_success(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": self._make_quest()}
        mock_convs.get_item.return_value = {"Item": self._make_conversation()}
        mock_progress.query.return_value = {"Items": [self._make_progress()]}
        updated = {**self._make_progress(), "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        })
        result = handler(event, None)

        assert result["totalPoints"] == 100
        mock_progress.update_item.assert_called_once()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.quests_table")
    def test_complete_stage_quest_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        })
        with pytest.raises(Exception, match="Quest not found"):
            handler(event, None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.quests_table")
    def test_complete_stage_stage_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": self._make_quest()}

        from complete_stage import handler
        wrong_stage_id = "990e8400-e29b-41d4-a716-446655440000"
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": wrong_stage_id,
                "conversationId": VALID_UUID_3,
            }
        })
        with pytest.raises(Exception, match="Stage not found"):
            handler(event, None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.quests_table")
    def test_complete_stage_conversation_not_found(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": self._make_quest()}
        mock_convs.get_item.return_value = {}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        })
        with pytest.raises(Exception, match="Conversation not found"):
            handler(event, None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.quests_table")
    def test_complete_stage_conversation_wrong_user(self, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": self._make_quest()}
        conv = self._make_conversation()
        conv["userId"] = "other-user"
        mock_convs.get_item.return_value = {"Item": conv}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        })
        with pytest.raises(Exception, match="Not authorized"):
            handler(event, None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_complete_stage_already_completed_returns_progress(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": self._make_quest()}
        mock_convs.get_item.return_value = {"Item": self._make_conversation()}

        progress = self._make_progress()
        progress["completedStages"] = [{"stageId": VALID_UUID_2}]
        mock_progress.query.return_value = {"Items": [progress]}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        })
        result = handler(event, None)

        # Should return existing progress without updating
        assert result == progress
        mock_progress.update_item.assert_not_called()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_complete_all_stages_creates_score(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """When all stages are completed, a score entry is created and user stats updated."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        # Quest with only 1 stage
        mock_quests.get_item.return_value = {"Item": self._make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": self._make_conversation()}
        mock_progress.query.return_value = {"Items": [self._make_progress()]}

        updated = {
            **self._make_progress(),
            "completedStages": [{"stageId": VALID_UUID_2}],
            "status": "completed",
            "totalPoints": 100,
        }
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        })
        handler(event, None)

        mock_scores.put_item.assert_called_once()
        mock_users.update_item.assert_called_once()
