"""Comprehensive tests for get_admin_analytics resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="admin-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or ["admins"]},
        },
        "arguments": arguments or {},
    }


class TestGetAdminAnalyticsComprehensive:
    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_returns_all_metrics(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """Should return all expected metric fields."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "status": "active", "createdAt": "2025-01-01T00:00:00Z"},
            ]
        }
        mock_quests.scan.return_value = {
            "Items": [{"id": "q1", "title": "Quest"}]
        }
        mock_progress.scan.return_value = {
            "Items": [{"questId": "q1", "status": "completed", "totalDuration": 300, "completedAt": "2025-01-01"}]
        }
        mock_scores.scan.return_value = {
            "Items": [{"questId": "q1", "score": 80}]
        }

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        assert "totalUsers" in result
        assert "activeUsers" in result
        assert "totalQuests" in result
        assert "totalCompletions" in result
        assert "popularQuests" in result
        assert "userGrowth" in result

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_empty_tables_return_zeros(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """All empty tables should return zero metrics."""
        mock_admin.return_value = True
        for tbl in [mock_users, mock_quests, mock_progress, mock_scores]:
            tbl.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        assert result["totalUsers"] == 0
        assert result["activeUsers"] == 0
        assert result["totalQuests"] == 0
        assert result["totalCompletions"] == 0
        assert result["popularQuests"] == []
        assert result["userGrowth"] == []

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_counts_active_vs_total_users(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """Should correctly count active users out of total."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "status": "active", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u2", "status": "active", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u3", "status": "suspended", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u4", "status": "pending", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u5", "status": "expired", "createdAt": "2025-01-01T00:00:00Z"},
            ]
        }
        mock_quests.scan.return_value = {"Items": []}
        mock_progress.scan.return_value = {"Items": []}
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        assert result["totalUsers"] == 5
        assert result["activeUsers"] == 2

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_calculates_popular_quests_correctly(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """Popular quests should be sorted by completions descending."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Quest 1"},
                {"id": "q2", "title": "Quest 2"},
                {"id": "q3", "title": "Quest 3"},
            ]
        }
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "totalDuration": 100},
                {"questId": "q2", "status": "completed", "totalDuration": 200},
                {"questId": "q2", "status": "completed", "totalDuration": 300},
                {"questId": "q2", "status": "completed", "totalDuration": 250},
                {"questId": "q3", "status": "completed", "totalDuration": 150},
                {"questId": "q3", "status": "completed", "totalDuration": 350},
            ]
        }
        mock_scores.scan.return_value = {
            "Items": [
                {"questId": "q1", "score": 70},
                {"questId": "q2", "score": 90},
                {"questId": "q2", "score": 80},
            ]
        }

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        popular = result["popularQuests"]
        assert len(popular) == 3
        assert popular[0]["questId"] == "q2"
        assert popular[0]["completions"] == 3
        assert popular[0]["questTitle"] == "Quest 2"
        assert popular[1]["questId"] == "q3"
        assert popular[1]["completions"] == 2
        assert popular[2]["questId"] == "q1"
        assert popular[2]["completions"] == 1

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_user_growth_aggregation(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """User growth should aggregate users and completions by date."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "status": "active", "createdAt": "2025-01-01T10:00:00Z"},
                {"userId": "u2", "status": "active", "createdAt": "2025-01-01T14:00:00Z"},
                {"userId": "u3", "status": "active", "createdAt": "2025-01-02T08:00:00Z"},
                {"userId": "u4", "status": "active", "createdAt": "2025-01-03T12:00:00Z"},
            ]
        }
        mock_quests.scan.return_value = {"Items": []}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "completedAt": "2025-01-01T15:00:00Z"},
                {"questId": "q2", "status": "completed", "completedAt": "2025-01-01T16:00:00Z"},
                {"questId": "q3", "status": "completed", "completedAt": "2025-01-03T10:00:00Z"},
            ]
        }
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        growth = result["userGrowth"]
        assert len(growth) == 3
        day1 = next(g for g in growth if g["date"] == "2025-01-01")
        day2 = next(g for g in growth if g["date"] == "2025-01-02")
        day3 = next(g for g in growth if g["date"] == "2025-01-03")
        assert day1["users"] == 2
        assert day1["completions"] == 2
        assert day2["users"] == 1
        assert day2["completions"] == 0
        assert day3["users"] == 1
        assert day3["completions"] == 1

    @patch("get_admin_analytics.check_admin_access")
    def test_non_admin_rejected(self, mock_admin):
        """Non-admin users should be rejected."""
        mock_admin.side_effect = PermissionError("Admin access required")

        from get_admin_analytics import handler

        event = make_event(user_id="regular-user", groups=[])
        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_multiple_quests_and_scores(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """Should correctly handle multiple quests with different score sets."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Easy Quest"},
                {"id": "q2", "title": "Hard Quest"},
            ]
        }
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "totalDuration": 100, "completedAt": "2025-01-01"},
                {"questId": "q1", "status": "completed", "totalDuration": 200, "completedAt": "2025-01-02"},
                {"questId": "q2", "status": "completed", "totalDuration": 500, "completedAt": "2025-01-03"},
            ]
        }
        mock_scores.scan.return_value = {
            "Items": [
                {"questId": "q1", "score": 100},
                {"questId": "q1", "score": 80},
                {"questId": "q2", "score": 50},
            ]
        }

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        assert result["totalCompletions"] == 3
        popular = result["popularQuests"]
        q1 = next(p for p in popular if p["questId"] == "q1")
        q2 = next(p for p in popular if p["questId"] == "q2")
        assert q1["completions"] == 2
        assert q1["averageScore"] == 90.0  # (100+80)/2
        assert q1["averageTime"] == 150  # (100+200)/2
        assert q2["completions"] == 1
        assert q2["averageScore"] == 50.0

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_growth_sorted_by_date(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """User growth entries should be sorted chronologically."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "status": "active", "createdAt": "2025-03-15T00:00:00Z"},
                {"userId": "u2", "status": "active", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u3", "status": "active", "createdAt": "2025-02-10T00:00:00Z"},
            ]
        }
        mock_quests.scan.return_value = {"Items": []}
        mock_progress.scan.return_value = {"Items": []}
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        dates = [g["date"] for g in result["userGrowth"]]
        assert dates == sorted(dates)

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_quest_title_unknown_when_not_in_map(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """Quest title should be 'Unknown' when quest is not in quests table."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {"Items": []}  # No quests
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "deleted-quest", "status": "completed", "totalDuration": 100},
            ]
        }
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        popular = result["popularQuests"]
        assert len(popular) == 1
        assert popular[0]["questTitle"] == "Unknown"

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_in_progress_not_counted_as_completion(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """In-progress records should not count towards completions."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {"Items": [{"id": "q1", "title": "Q"}]}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "in_progress"},
                {"questId": "q1", "status": "in_progress"},
                {"questId": "q1", "status": "abandoned"},
            ]
        }
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        assert result["totalCompletions"] == 0

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_average_time_calculated_correctly(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        """Average time should be calculated from completed progress durations."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {"Items": [{"id": "q1", "title": "Q1"}]}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "totalDuration": 100},
                {"questId": "q1", "status": "completed", "totalDuration": 300},
            ]
        }
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler

        result = handler(make_event(), None)

        q1 = result["popularQuests"][0]
        assert q1["averageTime"] == 200  # (100+300)/2
