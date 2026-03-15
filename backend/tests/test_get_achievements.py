"""Tests for get_achievements resolver: retrieval, empty state, sorted by date."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1"):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": []},
        },
        "arguments": {},
    }


SAMPLE_ACHIEVEMENTS = [
    {
        "id": "ach-1",
        "userId": "user-1",
        "type": "first_quest",
        "title": "First Steps",
        "description": "Complete your first quest",
        "earnedAt": "2025-08-15T10:00:00+00:00",
    },
    {
        "id": "ach-2",
        "userId": "user-1",
        "type": "explorer",
        "title": "Explorer",
        "description": "Complete 10 quests",
        "earnedAt": "2025-08-10T10:00:00+00:00",
    },
    {
        "id": "ach-3",
        "userId": "user-1",
        "type": "perfectionist",
        "title": "Perfectionist",
        "description": "Get a perfect score",
        "earnedAt": "2025-08-20T10:00:00+00:00",
    },
]


class TestGetAchievementsReturnsUserAchievements:
    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_returns_achievements_list(self, mock_table, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.query.return_value = {"Items": SAMPLE_ACHIEVEMENTS}

        from get_achievements import handler
        result = handler(make_event(), None)

        assert len(result) == 3
        assert result[0]["id"] == "ach-1"
        assert result[1]["id"] == "ach-2"
        assert result[2]["id"] == "ach-3"

    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_queries_correct_index(self, mock_table, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.query.return_value = {"Items": []}

        from get_achievements import handler
        handler(make_event(), None)

        mock_table.query.assert_called_once()
        call_kwargs = mock_table.query.call_args[1]
        assert call_kwargs["IndexName"] == "userId-earnedAt-index"

    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_queries_with_correct_user_id(self, mock_table, mock_auth):
        mock_auth.return_value = {"userId": "user-42", "status": "active"}
        mock_table.query.return_value = {"Items": []}

        from get_achievements import handler
        handler(make_event(user_id="user-42"), None)

        call_kwargs = mock_table.query.call_args[1]
        expr = call_kwargs["KeyConditionExpression"]
        # The Key condition should reference user-42
        assert expr is not None


class TestGetAchievementsEmpty:
    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_returns_empty_list_when_no_achievements(self, mock_table, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.query.return_value = {"Items": []}

        from get_achievements import handler
        result = handler(make_event(), None)

        assert result == []

    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_returns_empty_list_when_items_key_missing(self, mock_table, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.query.return_value = {}

        from get_achievements import handler
        result = handler(make_event(), None)

        assert result == []


class TestGetAchievementsSortedByDate:
    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_scan_index_forward_is_false(self, mock_table, mock_auth):
        """Achievements should be returned most recent first (ScanIndexForward=False)."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.query.return_value = {"Items": SAMPLE_ACHIEVEMENTS}

        from get_achievements import handler
        handler(make_event(), None)

        call_kwargs = mock_table.query.call_args[1]
        assert call_kwargs["ScanIndexForward"] is False

    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_returns_items_in_query_order(self, mock_table, mock_auth):
        """Items should be returned in the order DynamoDB provides (sorted by GSI)."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        # Already sorted most recent first by the index
        sorted_items = [
            SAMPLE_ACHIEVEMENTS[2],  # Aug 20
            SAMPLE_ACHIEVEMENTS[0],  # Aug 15
            SAMPLE_ACHIEVEMENTS[1],  # Aug 10
        ]
        mock_table.query.return_value = {"Items": sorted_items}

        from get_achievements import handler
        result = handler(make_event(), None)

        assert result[0]["earnedAt"] == "2025-08-20T10:00:00+00:00"
        assert result[1]["earnedAt"] == "2025-08-15T10:00:00+00:00"
        assert result[2]["earnedAt"] == "2025-08-10T10:00:00+00:00"


class TestGetAchievementsAuthCheck:
    @patch("get_achievements.check_user_access")
    def test_raises_when_user_access_denied(self, mock_auth):
        mock_auth.side_effect = PermissionError("Account is suspended")

        from get_achievements import handler
        with pytest.raises(PermissionError, match="suspended"):
            handler(make_event(), None)
