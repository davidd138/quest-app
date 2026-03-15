"""Comprehensive tests for get_analytics resolver — edge cases and security."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": []},
        },
        "arguments": arguments or {},
    }


def _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                 scores=None, conversations=None, progress=None, quests=None):
    """Helper to configure all mocks with default empty data."""
    mock_auth.return_value = {"userId": "user-1", "status": "active"}
    mock_scores.query.return_value = {"Items": scores or []}
    mock_convs.query.return_value = {"Items": conversations or []}
    mock_progress.query.return_value = {"Items": progress or []}
    mock_quests.scan.return_value = {"Items": quests or []}


ANALYTICS_PATCHES = [
    "get_analytics.scores_table",
    "get_analytics.conversations_table",
    "get_analytics.progress_table",
    "get_analytics.quests_table",
    "get_analytics.achievements_table",
    "get_analytics.check_user_access",
]


class TestGetAnalyticsComprehensive:
    """Comprehensive edge-case tests for get_analytics."""

    # 1. Returns all expected fields
    @patch(*ANALYTICS_PATCHES[:1])
    @patch(*ANALYTICS_PATCHES[1:2])
    @patch(*ANALYTICS_PATCHES[2:3])
    @patch(*ANALYTICS_PATCHES[3:4])
    @patch(*ANALYTICS_PATCHES[4:5])
    @patch(*ANALYTICS_PATCHES[5:6])
    def test_returns_all_fields(self, mock_auth, mock_achievements, mock_quests, mock_progress, mock_convs, mock_scores):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth)

        from get_analytics import handler

        result = handler(make_event(), None)

        expected_keys = [
            "totalQuests", "questsCompleted", "totalPoints", "averageScore",
            "totalPlayTime", "favoriteCategory", "completionRate",
            "recentActivity", "categoryBreakdown",
        ]
        for key in expected_keys:
            assert key in result

    # 2. Empty data returns zeros
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_empty_data_returns_zeros(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth)

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

    # 3. Calculates totalQuests from progress entries
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_total_quests_from_progress(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                         {"questId": "q2", "status": "in_progress"},
                         {"questId": "q3", "status": "completed"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["totalQuests"] == 3

    # 4. Calculates questsCompleted
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_quests_completed_count(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                         {"questId": "q2", "status": "in_progress"},
                         {"questId": "q3", "status": "completed"},
                         {"questId": "q4", "status": "in_progress"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["questsCompleted"] == 2

    # 5. Calculates totalPoints
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_total_points(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     scores=[
                         {"score": 80, "questId": "q1"},
                         {"score": 90, "questId": "q2"},
                         {"score": 100, "questId": "q3"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["totalPoints"] == 270

    # 6. Calculates averageScore
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_average_score(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     scores=[
                         {"score": 60, "questId": "q1"},
                         {"score": 80, "questId": "q2"},
                         {"score": 100, "questId": "q3"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        # 240 / 3 = 80.0
        assert result["averageScore"] == 80.0

    # 7. Calculates totalPlayTime
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_total_play_time(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     conversations=[
                         {"duration": 120, "questId": "q1", "startedAt": "2025-01-01T00:00:00Z", "status": "completed"},
                         {"duration": 300, "questId": "q2", "startedAt": "2025-01-02T00:00:00Z", "status": "completed"},
                         {"duration": 180, "questId": "q3", "startedAt": "2025-01-03T00:00:00Z", "status": "in_progress"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["totalPlayTime"] == 600

    # 8. Finds favoriteCategory
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_favorite_category(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                         {"questId": "q2", "status": "completed"},
                         {"questId": "q3", "status": "completed"},
                     ],
                     quests=[
                         {"id": "q1", "title": "Q1", "category": "mystery"},
                         {"id": "q2", "title": "Q2", "category": "adventure"},
                         {"id": "q3", "title": "Q3", "category": "mystery"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["favoriteCategory"] == "mystery"

    # 9. Calculates completionRate
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_completion_rate(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                         {"questId": "q2", "status": "in_progress"},
                         {"questId": "q3", "status": "completed"},
                         {"questId": "q4", "status": "in_progress"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        # 2/4 = 50.0%
        assert result["completionRate"] == 50.0

    # 10. Builds recentActivity
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_builds_recent_activity(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     conversations=[
                         {"questId": "q1", "startedAt": "2025-01-02T00:00:00Z", "status": "completed", "duration": 100},
                         {"questId": "q1", "startedAt": "2025-01-01T00:00:00Z", "status": "in_progress", "duration": 50},
                     ],
                     quests=[
                         {"id": "q1", "title": "Quest One", "category": "adventure"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        activity = result["recentActivity"]
        assert len(activity) == 2
        assert activity[0]["date"] == "2025-01-02T00:00:00Z"
        assert activity[0]["action"] == "completed"
        assert activity[0]["questTitle"] == "Quest One"
        assert activity[1]["action"] == "started"

    # 11. Builds categoryBreakdown
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_builds_category_breakdown(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                     ],
                     scores=[
                         {"score": 90, "questId": "q1"},
                     ],
                     quests=[
                         {"id": "q1", "title": "Q1", "category": "cultural"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        breakdown = result["categoryBreakdown"]
        assert len(breakdown) == 1
        assert breakdown[0]["category"] == "cultural"
        assert breakdown[0]["completed"] == 1
        assert breakdown[0]["total"] == 1
        assert breakdown[0]["averageScore"] == 90.0

    # 12. Multiple categories breakdown
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_multiple_categories_breakdown(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                         {"questId": "q2", "status": "completed"},
                         {"questId": "q3", "status": "in_progress"},
                     ],
                     scores=[
                         {"score": 80, "questId": "q1"},
                         {"score": 100, "questId": "q2"},
                         {"score": 60, "questId": "q3"},
                     ],
                     quests=[
                         {"id": "q1", "title": "Q1", "category": "adventure"},
                         {"id": "q2", "title": "Q2", "category": "mystery"},
                         {"id": "q3", "title": "Q3", "category": "adventure"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        breakdown = {b["category"]: b for b in result["categoryBreakdown"]}
        assert "adventure" in breakdown
        assert "mystery" in breakdown
        assert breakdown["adventure"]["total"] == 2
        assert breakdown["adventure"]["completed"] == 1
        assert breakdown["mystery"]["completed"] == 1

    # 13. No scores but has progress
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_no_scores_but_has_progress(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "in_progress"},
                         {"questId": "q2", "status": "in_progress"},
                     ],
                     quests=[
                         {"id": "q1", "title": "Q1", "category": "adventure"},
                         {"id": "q2", "title": "Q2", "category": "adventure"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["totalQuests"] == 2
        assert result["totalPoints"] == 0
        assert result["averageScore"] == 0
        assert result["questsCompleted"] == 0

    # 14. No progress but has scores
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_no_progress_but_has_scores(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     scores=[
                         {"score": 100, "questId": "q1"},
                         {"score": 200, "questId": "q2"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["totalQuests"] == 0
        assert result["totalPoints"] == 300
        assert result["averageScore"] == 150.0

    # 15. Multiple conversations counted correctly for play time
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_multiple_conversations_play_time(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        convs = [
            {"questId": f"q{i}", "startedAt": f"2025-01-0{i+1}T00:00:00Z", "status": "completed", "duration": 60 * (i + 1)}
            for i in range(5)
        ]
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     conversations=convs)

        from get_analytics import handler

        result = handler(make_event(), None)

        # durations: 60, 120, 180, 240, 300 = 900
        assert result["totalPlayTime"] == 900

    # 16. Recent activity limited to 10
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_recent_activity_limited_to_10(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        convs = [
            {"questId": "q1", "startedAt": f"2025-01-{i+1:02d}T00:00:00Z", "status": "completed", "duration": 60}
            for i in range(15)
        ]
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     conversations=convs,
                     quests=[{"id": "q1", "title": "Quest 1", "category": "adventure"}])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert len(result["recentActivity"]) == 10

    # 17. Date in recent activity matches conversation startedAt
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_recent_activity_date_matches(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     conversations=[
                         {"questId": "q1", "startedAt": "2025-03-15T10:30:00Z", "status": "completed", "duration": 60},
                     ],
                     quests=[{"id": "q1", "title": "Quest 1", "category": "adventure"}])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["recentActivity"][0]["date"] == "2025-03-15T10:30:00Z"

    # 18. Non-active user rejected
    @patch("get_analytics.check_user_access", side_effect=PermissionError("Account is suspended"))
    def test_non_active_user_rejected(self, mock_auth):
        from get_analytics import handler

        with pytest.raises(PermissionError, match="suspended"):
            handler(make_event(), None)

    # 19. Unknown quest in progress falls back to "unknown" category
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_unknown_quest_category_fallback(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "deleted-quest", "status": "completed"},
                     ],
                     quests=[])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["totalQuests"] == 1
        assert result["favoriteCategory"] == "unknown"

    # 20. Completion rate is 100% when all quests completed
    @patch("get_analytics.check_user_access")
    @patch("get_analytics.achievements_table")
    @patch("get_analytics.quests_table")
    @patch("get_analytics.progress_table")
    @patch("get_analytics.conversations_table")
    @patch("get_analytics.scores_table")
    def test_completion_rate_100_percent(self, mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth):
        _setup_mocks(mock_scores, mock_convs, mock_progress, mock_quests, mock_achievements, mock_auth,
                     progress=[
                         {"questId": "q1", "status": "completed"},
                         {"questId": "q2", "status": "completed"},
                         {"questId": "q3", "status": "completed"},
                     ])

        from get_analytics import handler

        result = handler(make_event(), None)

        assert result["completionRate"] == 100.0
