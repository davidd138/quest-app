"""Tests for get_analytics and get_admin_analytics resolvers."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


def make_admin_event(user_id="admin-1", arguments=None):
    return make_event(user_id=user_id, arguments=arguments, groups=["admins"])


# ── get_analytics ────────────────────────────────────────────────────

class TestGetAnalytics:
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_empty_data_returns_zeros(
        self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth
    ):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_progress.query.return_value = {"Items": []}
        mock_quests.scan.return_value = {"Items": []}

        from get_analytics import handler
        result = handler(make_event(), None)

        assert result["totalQuests"] == 0
        assert result["questsCompleted"] == 0
        assert result["totalPoints"] == 0
        assert result["averageScore"] == 0
        assert result["totalPlayTime"] == 0
        assert result["completionRate"] == 0
        assert result["favoriteCategory"] is None
        assert result["recentActivity"] == []
        assert result["categoryBreakdown"] == []

    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_with_scores_and_progress(
        self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth
    ):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        mock_scores.query.return_value = {
            "Items": [
                {"userId": "user-1", "score": 80, "questId": "q1"},
                {"userId": "user-1", "score": 90, "questId": "q2"},
            ],
        }
        mock_convs.query.return_value = {
            "Items": [
                {"userId": "user-1", "duration": 300, "questId": "q1", "startedAt": "2025-01-01T00:00:00Z", "status": "completed"},
                {"userId": "user-1", "duration": 600, "questId": "q2", "startedAt": "2025-01-02T00:00:00Z", "status": "in_progress"},
            ],
        }
        mock_progress.query.return_value = {
            "Items": [
                {"userId": "user-1", "questId": "q1", "status": "completed"},
                {"userId": "user-1", "questId": "q2", "status": "in_progress"},
            ],
        }
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Quest 1", "category": "adventure"},
                {"id": "q2", "title": "Quest 2", "category": "mystery"},
            ],
        }

        from get_analytics import handler
        result = handler(make_event(), None)

        assert result["totalQuests"] == 2
        assert result["questsCompleted"] == 1
        assert result["totalPoints"] == 170
        assert result["averageScore"] == 85.0
        assert result["totalPlayTime"] == 900
        assert result["completionRate"] == 50.0

    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_category_breakdown_calculation(
        self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth
    ):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        mock_scores.query.return_value = {
            "Items": [
                {"userId": "user-1", "score": 100, "questId": "q1"},
                {"userId": "user-1", "score": 80, "questId": "q2"},
                {"userId": "user-1", "score": 60, "questId": "q3"},
            ],
        }
        mock_convs.query.return_value = {"Items": []}
        mock_progress.query.return_value = {
            "Items": [
                {"userId": "user-1", "questId": "q1", "status": "completed"},
                {"userId": "user-1", "questId": "q2", "status": "completed"},
                {"userId": "user-1", "questId": "q3", "status": "in_progress"},
            ],
        }
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Q1", "category": "adventure"},
                {"id": "q2", "title": "Q2", "category": "adventure"},
                {"id": "q3", "title": "Q3", "category": "mystery"},
            ],
        }

        from get_analytics import handler
        result = handler(make_event(), None)

        breakdown = {b["category"]: b for b in result["categoryBreakdown"]}

        assert "adventure" in breakdown
        assert breakdown["adventure"]["completed"] == 2
        assert breakdown["adventure"]["total"] == 2
        assert breakdown["adventure"]["averageScore"] == 90.0

        assert "mystery" in breakdown
        assert breakdown["mystery"]["completed"] == 0
        assert breakdown["mystery"]["total"] == 1

    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_recent_activity_generation(
        self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth
    ):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        mock_scores.query.return_value = {"Items": []}
        mock_convs.query.return_value = {
            "Items": [
                {"userId": "user-1", "questId": "q1", "startedAt": "2025-01-03T00:00:00Z", "status": "completed", "duration": 100},
                {"userId": "user-1", "questId": "q2", "startedAt": "2025-01-01T00:00:00Z", "status": "in_progress", "duration": 200},
                {"userId": "user-1", "questId": "q1", "startedAt": "2025-01-02T00:00:00Z", "status": "completed", "duration": 150},
            ],
        }
        mock_progress.query.return_value = {"Items": []}
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Quest 1", "category": "adventure"},
                {"id": "q2", "title": "Quest 2", "category": "mystery"},
            ],
        }

        from get_analytics import handler
        result = handler(make_event(), None)

        activity = result["recentActivity"]
        assert len(activity) == 3
        # Should be sorted by date descending
        assert activity[0]["date"] == "2025-01-03T00:00:00Z"
        assert activity[0]["action"] == "completed"
        assert activity[0]["questTitle"] == "Quest 1"
        assert activity[1]["date"] == "2025-01-02T00:00:00Z"
        assert activity[2]["date"] == "2025-01-01T00:00:00Z"
        assert activity[2]["action"] == "started"

    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_favorite_category_is_most_common(
        self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth
    ):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        mock_scores.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_progress.query.return_value = {
            "Items": [
                {"userId": "user-1", "questId": "q1", "status": "completed"},
                {"userId": "user-1", "questId": "q2", "status": "completed"},
                {"userId": "user-1", "questId": "q3", "status": "in_progress"},
            ],
        }
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Q1", "category": "mystery"},
                {"id": "q2", "title": "Q2", "category": "mystery"},
                {"id": "q3", "title": "Q3", "category": "adventure"},
            ],
        }

        from get_analytics import handler
        result = handler(make_event(), None)

        assert result["favoriteCategory"] == "mystery"


# ── get_admin_analytics ──────────────────────────────────────────────

class TestGetAdminAnalytics:
    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_empty_tables(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        mock_admin.return_value = True
        for tbl in [mock_users, mock_quests, mock_progress, mock_scores]:
            tbl.scan.return_value = {"Items": []}

        from get_admin_analytics import handler
        result = handler(make_admin_event(), None)

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
    def test_user_counts(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "status": "active", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u2", "status": "active", "createdAt": "2025-01-01T00:00:00Z"},
                {"userId": "u3", "status": "suspended", "createdAt": "2025-01-02T00:00:00Z"},
                {"userId": "u4", "status": "pending", "createdAt": "2025-01-02T00:00:00Z"},
            ],
        }
        mock_quests.scan.return_value = {"Items": []}
        mock_progress.scan.return_value = {"Items": []}
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler
        result = handler(make_admin_event(), None)

        assert result["totalUsers"] == 4
        assert result["activeUsers"] == 2

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_quest_stats(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Quest 1"},
                {"id": "q2", "title": "Quest 2"},
            ],
        }
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "totalDuration": 300, "completedAt": "2025-01-01"},
                {"questId": "q1", "status": "completed", "totalDuration": 600, "completedAt": "2025-01-02"},
                {"questId": "q2", "status": "in_progress"},
            ],
        }
        mock_scores.scan.return_value = {
            "Items": [
                {"questId": "q1", "score": 80},
                {"questId": "q1", "score": 90},
            ],
        }

        from get_admin_analytics import handler
        result = handler(make_admin_event(), None)

        assert result["totalQuests"] == 2
        assert result["totalCompletions"] == 2

        popular = result["popularQuests"]
        assert len(popular) > 0
        q1_stats = next(p for p in popular if p["questId"] == "q1")
        assert q1_stats["completions"] == 2
        assert q1_stats["averageScore"] == 85.0
        assert q1_stats["questTitle"] == "Quest 1"

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_user_growth_aggregation(self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin):
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "status": "active", "createdAt": "2025-01-01T10:00:00Z"},
                {"userId": "u2", "status": "active", "createdAt": "2025-01-01T14:00:00Z"},
                {"userId": "u3", "status": "active", "createdAt": "2025-01-02T08:00:00Z"},
            ],
        }
        mock_quests.scan.return_value = {"Items": []}
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "completedAt": "2025-01-01T12:00:00Z"},
                {"questId": "q2", "status": "completed", "completedAt": "2025-01-02T09:00:00Z"},
            ],
        }
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler
        result = handler(make_admin_event(), None)

        growth = result["userGrowth"]
        assert len(growth) == 2
        day1 = next(g for g in growth if g["date"] == "2025-01-01")
        day2 = next(g for g in growth if g["date"] == "2025-01-02")
        assert day1["users"] == 2
        assert day1["completions"] == 1
        assert day2["users"] == 1
        assert day2["completions"] == 1

    @patch("get_admin_analytics.check_admin_access")
    @patch("get_admin_analytics.scores_table")
    @patch("get_admin_analytics.progress_table")
    @patch("get_admin_analytics.quests_table")
    @patch("get_admin_analytics.users_table")
    def test_popular_quests_sorted_by_completions(
        self, mock_users, mock_quests, mock_progress, mock_scores, mock_admin
    ):
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}
        mock_quests.scan.return_value = {
            "Items": [
                {"id": "q1", "title": "Quest 1"},
                {"id": "q2", "title": "Quest 2"},
            ],
        }
        mock_progress.scan.return_value = {
            "Items": [
                {"questId": "q1", "status": "completed", "totalDuration": 100},
                {"questId": "q2", "status": "completed", "totalDuration": 200},
                {"questId": "q2", "status": "completed", "totalDuration": 300},
            ],
        }
        mock_scores.scan.return_value = {"Items": []}

        from get_admin_analytics import handler
        result = handler(make_admin_event(), None)

        popular = result["popularQuests"]
        assert popular[0]["questId"] == "q2"
        assert popular[0]["completions"] == 2
        assert popular[1]["questId"] == "q1"
        assert popular[1]["completions"] == 1
