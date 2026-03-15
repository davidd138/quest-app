"""Tests for complete_stage scoring logic: points calculation, achievement milestones, user stats, score records."""
import sys
import os
import json
import uuid
import pytest
from unittest.mock import patch, MagicMock, call
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440000"
VALID_UUID_4 = "880e8400-e29b-41d4-a716-446655440000"
VALID_UUID_5 = "990e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-scoring-test"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def make_quest(stage_ids, reward_points=None):
    """Create a quest with the given stage IDs and optional per-stage reward points."""
    if reward_points is None:
        reward_points = [100] * len(stage_ids)
    stages = [
        {"id": sid, "title": f"Stage {i+1}", "rewardPoints": pts}
        for i, (sid, pts) in enumerate(zip(stage_ids, reward_points))
    ]
    return {"id": VALID_UUID, "title": "Test Quest", "stages": stages}


def make_conversation(conv_id=VALID_UUID_3, user_id=USER_ID, duration=300):
    return {
        "id": conv_id,
        "userId": user_id,
        "duration": duration,
        "result": "completed",
    }


def make_progress(user_id=USER_ID, quest_id=VALID_UUID, completed_stages=None, total_points=0, total_duration=0):
    return {
        "id": VALID_UUID_4,
        "userId": user_id,
        "questId": quest_id,
        "currentStageIndex": len(completed_stages) if completed_stages else 0,
        "completedStages": completed_stages or [],
        "status": "in_progress",
        "totalPoints": total_points,
        "totalDuration": total_duration,
    }


def make_complete_event(quest_id=VALID_UUID, stage_id=VALID_UUID_2, conv_id=VALID_UUID_3):
    return make_event(arguments={
        "input": {
            "questId": quest_id,
            "stageId": stage_id,
            "conversationId": conv_id,
        }
    })


class TestPointsCalculation:
    """Test that points are correctly accumulated from stage reward points."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_single_stage_points(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Points from a single stage are added correctly."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2], [150])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 150, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        result = handler(make_complete_event(), None)

        assert result["totalPoints"] == 150

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_cumulative_points_across_stages(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Points accumulate across multiple completed stages."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        # Quest with 2 stages: 100pts and 200pts
        mock_quests.get_item.return_value = {
            "Item": make_quest([VALID_UUID_2, VALID_UUID_5], [100, 200])
        }
        mock_convs.get_item.return_value = {"Item": make_conversation()}

        # Stage 1 already completed with 100 points
        progress = make_progress(
            completed_stages=[{"stageId": VALID_UUID_2, "pointsEarned": 100}],
            total_points=100,
        )
        progress["currentStageIndex"] = 1
        mock_progress.query.return_value = {"Items": [progress]}

        # Completing stage 2 (200 pts) -> total = 300
        updated = {**progress, "totalPoints": 300, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        event = make_event(arguments={
            "input": {
                "questId": VALID_UUID,
                "stageId": VALID_UUID_5,
                "conversationId": VALID_UUID_3,
            }
        })
        result = handler(event, None)

        assert result["totalPoints"] == 300

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_zero_point_stage(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """A stage with 0 reward points still completes but adds no points."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2], [0])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 0, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        result = handler(make_complete_event(), None)

        assert result["totalPoints"] == 0


class TestAchievementMilestones:
    """Test that achievements are created at the correct milestone thresholds."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_first_quest_achievement(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Achievement 'First Quest' is created when user completes their 1st quest."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 1}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_achievements.put_item.assert_called_once()
        achievement = mock_achievements.put_item.call_args[1]["Item"]
        assert achievement["title"] == "First Quest"
        assert achievement["userId"] == USER_ID

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_five_quests_achievement(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Achievement 'Adventurer' is created at 5 completed quests."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 5}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_achievements.put_item.assert_called_once()
        achievement = mock_achievements.put_item.call_args[1]["Item"]
        assert achievement["title"] == "Adventurer"
        assert achievement["questsCompleted"] == 5

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_ten_quests_achievement(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Achievement 'Seasoned Explorer' is created at 10 completed quests."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 10}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_achievements.put_item.assert_called_once()
        achievement = mock_achievements.put_item.call_args[1]["Item"]
        assert achievement["title"] == "Seasoned Explorer"

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_twentyfive_quests_achievement(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Achievement 'Quest Master' is created at 25 completed quests."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 25}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_achievements.put_item.assert_called_once()
        achievement = mock_achievements.put_item.call_args[1]["Item"]
        assert achievement["title"] == "Quest Master"

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_fifty_quests_achievement(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Achievement 'Legend' is created at 50 completed quests."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 50}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_achievements.put_item.assert_called_once()
        achievement = mock_achievements.put_item.call_args[1]["Item"]
        assert achievement["title"] == "Legend"

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
        """No achievement is created when questsCompleted is not a milestone number."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "status": "completed", "totalPoints": 100}
        mock_progress.update_item.return_value = {"Attributes": updated}
        # 3 quests is not a milestone
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 3}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_achievements.put_item.assert_not_called()


class TestUserStatsUpdate:
    """Test that user stats (totalPoints, questsCompleted) are updated on quest completion."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_user_stats_updated_on_quest_completion(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """users_table.update_item is called with correct points and increment."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2], [250])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 250, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 2}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_users.update_item.assert_called_once()
        call_kwargs = mock_users.update_item.call_args[1]
        assert call_kwargs["Key"] == {"userId": USER_ID}
        assert call_kwargs["ExpressionAttributeValues"][":pts"] == 250
        assert call_kwargs["ExpressionAttributeValues"][":one"] == 1

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_user_stats_not_updated_for_partial_completion(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """User stats are NOT updated when only some stages are completed."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        # Quest with 2 stages - completing first one
        mock_quests.get_item.return_value = {
            "Item": make_quest([VALID_UUID_2, VALID_UUID_5])
        }
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 100, "status": "in_progress"}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_users.update_item.assert_not_called()
        mock_scores.put_item.assert_not_called()


class TestScoreRecordCreation:
    """Test that score records are created when a quest is fully completed."""

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_score_record_created_on_completion(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """A score entry is created in scores_table when all stages are completed."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2], [100])}
        mock_convs.get_item.return_value = {"Item": make_conversation(duration=500)}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 100, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 2}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_scores.put_item.assert_called_once()
        score = mock_scores.put_item.call_args[1]["Item"]
        assert score["userId"] == USER_ID
        assert score["questId"] == VALID_UUID
        assert score["totalPoints"] == 100
        assert score["totalDuration"] == 500
        assert "id" in score
        assert "completedAt" in score

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_no_score_record_for_partial_completion(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """No score entry is created when not all stages are completed."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {
            "Item": make_quest([VALID_UUID_2, VALID_UUID_5])
        }
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 100, "status": "in_progress"}
        mock_progress.update_item.return_value = {"Attributes": updated}

        from complete_stage import handler
        handler(make_complete_event(), None)

        mock_scores.put_item.assert_not_called()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_score_record_has_progress_id(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Score record includes the progress ID for traceability."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}
        mock_progress.query.return_value = {"Items": [make_progress()]}

        updated = {**make_progress(), "totalPoints": 100, "status": "completed"}
        mock_progress.update_item.return_value = {"Attributes": updated}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "questsCompleted": 2}}

        from complete_stage import handler
        handler(make_complete_event(), None)

        score = mock_scores.put_item.call_args[1]["Item"]
        assert score["progressId"] == VALID_UUID_4

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_already_completed_stage_no_duplicate_score(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Re-completing an already completed stage does not create a new score record."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_quest([VALID_UUID_2])}
        mock_convs.get_item.return_value = {"Item": make_conversation()}

        progress = make_progress(
            completed_stages=[{"stageId": VALID_UUID_2, "pointsEarned": 100}],
            total_points=100,
        )
        mock_progress.query.return_value = {"Items": [progress]}

        from complete_stage import handler
        result = handler(make_complete_event(), None)

        # Should return existing progress without creating score
        assert result == progress
        mock_scores.put_item.assert_not_called()
        mock_progress.update_item.assert_not_called()
