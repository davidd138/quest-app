"""Tests for get_quest_stats resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


class TestGetQuestStats:
    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_returns_correct_stats_with_multiple_completions(
        self, mock_progress, mock_scores, mock_auth
    ):
        """Should return correct stats when multiple users have completed the quest."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 300},
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 600},
                {"questId": VALID_UUID, "status": "in_progress"},
            ]
        }
        # Scores scan (score items)
        # Ratings scan
        mock_scores.scan.side_effect = [
            {
                "Items": [
                    {"id": f"score#s1", "questId": VALID_UUID, "score": Decimal("80")},
                    {"id": f"score#s2", "questId": VALID_UUID, "score": Decimal("90")},
                ]
            },
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("4")},
                    {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("5")},
                ]
            },
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["questId"] == VALID_UUID
        assert result["totalPlays"] == 3
        assert result["completionRate"] == 66.67
        assert result["avgScore"] == 85.0
        assert result["avgTime"] == 450  # (300 + 600) / 2
        assert result["totalRatings"] == 2
        assert result["avgRating"] == 4.5

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_empty_quest_no_plays(self, mock_progress, mock_scores, mock_auth):
        """Quest with no plays should return all zeros."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {"Items": []}
        mock_scores.scan.side_effect = [
            {"Items": []},
            {"Items": []},
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["questId"] == VALID_UUID
        assert result["totalPlays"] == 0
        assert result["completionRate"] == 0.0
        assert result["avgScore"] == 0.0
        assert result["avgTime"] == 0
        assert result["totalRatings"] == 0
        assert result["avgRating"] == 0.0

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_single_completion(self, mock_progress, mock_scores, mock_auth):
        """Quest with a single completed play."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 420},
            ]
        }
        mock_scores.scan.side_effect = [
            {"Items": [{"id": "score#s1", "questId": VALID_UUID, "score": Decimal("75")}]},
            {"Items": [{"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("3")}]},
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalPlays"] == 1
        assert result["completionRate"] == 100.0
        assert result["avgScore"] == 75.0
        assert result["avgTime"] == 420
        assert result["totalRatings"] == 1
        assert result["avgRating"] == 3.0

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_calculation_accuracy_averages(self, mock_progress, mock_scores, mock_auth):
        """Averages and rates should be calculated correctly with varied data."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 100},
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 200},
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 300},
                {"questId": VALID_UUID, "status": "abandoned"},
                {"questId": VALID_UUID, "status": "in_progress"},
            ]
        }
        mock_scores.scan.side_effect = [
            {
                "Items": [
                    {"id": "score#s1", "questId": VALID_UUID, "score": Decimal("60")},
                    {"id": "score#s2", "questId": VALID_UUID, "score": Decimal("80")},
                    {"id": "score#s3", "questId": VALID_UUID, "score": Decimal("100")},
                ]
            },
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("1")},
                    {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("3")},
                    {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("5")},
                ]
            },
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalPlays"] == 5
        assert result["completionRate"] == 60.0  # 3/5 * 100
        assert result["avgScore"] == 80.0  # (60+80+100)/3
        assert result["avgTime"] == 200  # (100+200+300)/3
        assert result["totalRatings"] == 3
        assert result["avgRating"] == 3.0  # (1+3+5)/3

    @patch("get_quest_stats.check_user_access")
    def test_invalid_quest_id(self, mock_auth):
        """Non-UUID questId should raise a validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest_stats import handler

        event = make_event(arguments={"questId": "not-a-uuid"})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_quest_not_found_returns_empty_stats(self, mock_progress, mock_scores, mock_auth):
        """A valid UUID for a non-existent quest should return zero stats."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {"Items": []}
        mock_scores.scan.side_effect = [
            {"Items": []},
            {"Items": []},
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID_2}), None)

        assert result["questId"] == VALID_UUID_2
        assert result["totalPlays"] == 0
        assert result["completionRate"] == 0.0
        assert result["avgScore"] == 0.0

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_no_scores_but_has_plays(self, mock_progress, mock_scores, mock_auth):
        """Quest with plays but no scores should return zero avg score."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": VALID_UUID, "status": "in_progress"},
                {"questId": VALID_UUID, "status": "in_progress"},
            ]
        }
        mock_scores.scan.side_effect = [
            {"Items": []},
            {"Items": []},
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalPlays"] == 2
        assert result["completionRate"] == 0.0
        assert result["avgScore"] == 0.0
        assert result["avgTime"] == 0

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_ratings_without_completions(self, mock_progress, mock_scores, mock_auth):
        """Quest can have ratings even without completions."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {"Items": []}
        mock_scores.scan.side_effect = [
            {"Items": []},
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("5")},
                    {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("4")},
                ]
            },
        ]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalPlays"] == 0
        assert result["totalRatings"] == 2
        assert result["avgRating"] == 4.5

    def test_user_access_denied(self):
        """Non-active users should be rejected."""
        from get_quest_stats import handler

        with patch("get_quest_stats.check_user_access") as mock_auth:
            mock_auth.side_effect = PermissionError("Account is suspended")
            event = make_event(arguments={"questId": VALID_UUID})
            with pytest.raises(PermissionError, match="suspended"):
                handler(event, None)

    @patch("get_quest_stats.check_user_access")
    def test_empty_quest_id(self, mock_auth):
        """Empty questId should raise a validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest_stats import handler

        event = make_event(arguments={"questId": ""})
        with pytest.raises(Exception, match="must be a non-empty string"):
            handler(event, None)

    @patch("get_quest_stats.check_user_access")
    def test_missing_quest_id(self, mock_auth):
        """Missing questId should raise a validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest_stats import handler

        event = make_event(arguments={})
        with pytest.raises(Exception):
            handler(event, None)

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_completion_rate_all_completed(self, mock_progress, mock_scores, mock_auth):
        """100% completion rate when all plays are completed."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 100},
                {"questId": VALID_UUID, "status": "completed", "totalDuration": 200},
            ]
        }
        mock_scores.scan.side_effect = [{"Items": []}, {"Items": []}]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["completionRate"] == 100.0

    @patch("get_quest_stats.check_user_access")
    @patch("get_quest_stats.scores_table")
    @patch("get_quest_stats.progress_table")
    def test_completion_rate_none_completed(self, mock_progress, mock_scores, mock_auth):
        """0% completion rate when no plays are completed."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": VALID_UUID, "status": "in_progress"},
                {"questId": VALID_UUID, "status": "abandoned"},
            ]
        }
        mock_scores.scan.side_effect = [{"Items": []}, {"Items": []}]

        from get_quest_stats import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["completionRate"] == 0.0
