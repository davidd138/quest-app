"""Comprehensive tests for the complete_stage resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock, call
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440000"
VALID_UUID_4 = "880e8400-e29b-41d4-a716-446655440000"
VALID_UUID_5 = "990e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-comp-789"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def _make_quest(stage_ids=None, reward_points=100):
    if stage_ids is None:
        stage_ids = [VALID_UUID_2]
    stages = [
        {"id": sid, "title": f"Stage {i+1}", "rewardPoints": reward_points}
        for i, sid in enumerate(stage_ids)
    ]
    return {"id": VALID_UUID, "title": "Test Quest", "stages": stages}


def _make_conversation(conv_id=VALID_UUID_3, user_id=USER_ID, duration=300):
    return {
        "id": conv_id,
        "userId": user_id,
        "duration": duration,
        "result": "completed",
    }


def _make_progress(user_id=USER_ID, quest_id=VALID_UUID, completed_stages=None):
    return {
        "id": VALID_UUID_4,
        "userId": user_id,
        "questId": quest_id,
        "currentStageIndex": 0,
        "completedStages": completed_stages or [],
        "status": "in_progress",
        "totalPoints": 0,
        "totalDuration": 0,
    }


def _default_input():
    return {
        "input": {
            "questId": VALID_UUID,
            "stageId": VALID_UUID_2,
            "conversationId": VALID_UUID_3,
        }
    }


class TestCompleteStageComprehensiveFetchFlow:
    """Tests for the full fetch flow: quest, conversation, progress."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_full_flow_fetches_quest_conversation_progress(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should fetch quest, conversation, and progress in sequence."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest()}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_quests.get_item.assert_called_once()
        mock_convs.get_item.assert_called_once()
        mock_progress.query.assert_called_once()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_awards_stage_reward_points(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should add stage reward points to the total."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest(reward_points=250)}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "totalPoints": 250}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        result = handler(make_event(arguments=_default_input()), None)

        assert result["totalPoints"] == 250


class TestCompleteStageScoreCreation:
    """Tests for score creation on final stage completion."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_creates_score_on_final_stage(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """When completing the last stage, a score entry should be created."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        # Single-stage quest
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_scores.put_item.assert_called_once()
        score_item = mock_scores.put_item.call_args[1]["Item"]
        assert score_item["userId"] == USER_ID
        assert score_item["questId"] == VALID_UUID

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_no_score_on_non_final_stage(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should not create a score when completing a non-final stage."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        # Two-stage quest, completing first stage
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2, VALID_UUID_5])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_scores.put_item.assert_not_called()


class TestCompleteStageUserStats:
    """Tests for user stats increment on quest completion."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_increments_user_stats(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should increment user's totalPoints and questsCompleted on quest completion."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 3}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_users.update_item.assert_called_once()


class TestCompleteStageAchievements:
    """Tests for achievement milestones."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_triggers_achievement_at_milestone_1(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should create 'First Quest' achievement when questsCompleted reaches 1."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_achievements.put_item.assert_called_once()
        ach_item = mock_achievements.put_item.call_args[1]["Item"]
        assert ach_item["title"] == "First Quest"
        assert ach_item["userId"] == USER_ID

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_triggers_achievement_at_milestone_5(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should create 'Adventurer' achievement when questsCompleted reaches 5."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 5}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_achievements.put_item.assert_called_once()
        ach_item = mock_achievements.put_item.call_args[1]["Item"]
        assert ach_item["title"] == "Adventurer"

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_triggers_achievement_at_milestone_10(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should create 'Seasoned Explorer' achievement at 10 quests."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 10}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_achievements.put_item.assert_called_once()
        ach_item = mock_achievements.put_item.call_args[1]["Item"]
        assert ach_item["title"] == "Seasoned Explorer"

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_no_achievement_at_non_milestone(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should NOT create achievement when questsCompleted is not a milestone."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": [_make_progress()]}
        updated = {**_make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 3}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_achievements.put_item.assert_not_called()


class TestCompleteStageErrorHandling:
    """Tests for error handling in complete_stage."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.quests_table")
    def test_handles_missing_quest(self, mock_quests, mock_auth):
        """Should raise when quest is not found."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {}

        from complete_stage import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_event(arguments=_default_input()), None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.quests_table")
    def test_handles_missing_conversation(self, mock_quests, mock_convs, mock_auth):
        """Should raise when conversation is not found."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest()}
        mock_convs.get_item.return_value = {}

        from complete_stage import handler
        with pytest.raises(Exception, match="Conversation not found"):
            handler(make_event(arguments=_default_input()), None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.quests_table")
    def test_handles_conversation_wrong_user(self, mock_quests, mock_convs, mock_auth):
        """Should raise when conversation belongs to a different user."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest()}
        conv = _make_conversation(user_id="other-user")
        mock_convs.get_item.return_value = {"Item": conv}

        from complete_stage import handler
        with pytest.raises(Exception, match="Not authorized"):
            handler(make_event(arguments=_default_input()), None)

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.quests_table")
    def test_handles_missing_stage_in_quest(self, mock_quests, mock_auth):
        """Should raise when stageId does not exist in the quest."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest()}

        from complete_stage import handler
        args = {
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_5,  # Not in the quest
                "conversationId": VALID_UUID_3,
            }
        }
        with pytest.raises(Exception, match="Stage not found"):
            handler(make_event(arguments=args), None)


class TestCompleteStageValidation:
    """Tests for input validation in complete_stage."""

    @patch("complete_stage.check_user_access")
    def test_validates_quest_id_uuid(self, mock_auth):
        """Should reject invalid questId."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from complete_stage import handler
        args = {
            "input": {
                "questId": "bad-quest",
                "stageId": VALID_UUID_2,
                "conversationId": VALID_UUID_3,
            }
        }
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments=args), None)

    @patch("complete_stage.check_user_access")
    def test_validates_stage_id_uuid(self, mock_auth):
        """Should reject invalid stageId."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from complete_stage import handler
        args = {
            "input": {
                "questId": VALID_UUID,
                "stageId": "bad-stage",
                "conversationId": VALID_UUID_3,
            }
        }
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments=args), None)

    @patch("complete_stage.check_user_access")
    def test_validates_conversation_id_uuid(self, mock_auth):
        """Should reject invalid conversationId."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from complete_stage import handler
        args = {
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_2,
                "conversationId": "bad-conv",
            }
        }
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments=args), None)

    @patch("complete_stage.check_user_access")
    def test_validates_all_three_uuids(self, mock_auth):
        """Should reject when all three IDs are invalid."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from complete_stage import handler
        args = {
            "input": {
                "questId": "bad",
                "stageId": "bad",
                "conversationId": "bad",
            }
        }
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments=args), None)


class TestCompleteStageDuplicateHandling:
    """Tests for duplicate stage completion handling."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_duplicate_completion_returns_existing_progress(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should return existing progress without updating when stage already completed."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest()}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}

        progress = _make_progress(completed_stages=[{"stageId": VALID_UUID_2}])
        mock_progress.query.return_value = {"Items": [progress]}

        from complete_stage import handler
        result = handler(make_event(arguments=_default_input()), None)

        assert result == progress
        mock_progress.update_item.assert_not_called()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_duplicate_does_not_create_score(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Duplicate completion should not create a new score entry."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest()}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}

        progress = _make_progress(completed_stages=[{"stageId": VALID_UUID_2}])
        mock_progress.query.return_value = {"Items": [progress]}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_scores.put_item.assert_not_called()
        mock_users.update_item.assert_not_called()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_creates_progress_if_none_exists(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Should create new progress if user has no existing progress for this quest."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": _make_quest([VALID_UUID_2, VALID_UUID_5])}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}
        mock_progress.query.return_value = {"Items": []}  # No existing progress
        updated = {"id": "new-id", "totalPoints": 100, "status": "in_progress"}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        # Should create new progress via put_item
        mock_progress.put_item.assert_called_once()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_multi_stage_quest_completion(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Completing the last stage in a multi-stage quest should trigger score creation."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        # 3-stage quest
        stage_ids = [VALID_UUID_2, VALID_UUID_5, "aa0e8400-e29b-41d4-a716-446655440000"]
        mock_quests.get_item.return_value = {"Item": _make_quest(stage_ids)}
        mock_convs.get_item.return_value = {"Item": _make_conversation()}

        # Already completed 2 stages, completing the 3rd
        progress = _make_progress(completed_stages=[
            {"stageId": VALID_UUID_5},
            {"stageId": "aa0e8400-e29b-41d4-a716-446655440000"},
        ])
        progress["currentStageIndex"] = 2
        progress["totalPoints"] = 200
        mock_progress.query.return_value = {"Items": [progress]}
        updated = {**progress, "status": "completed", "totalPoints": 300}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 5}}

        from complete_stage import handler
        handler(make_event(arguments=_default_input()), None)

        mock_scores.put_item.assert_called_once()
        mock_users.update_item.assert_called_once()
        # Should trigger Adventurer achievement at milestone 5
        mock_achievements.put_item.assert_called_once()
