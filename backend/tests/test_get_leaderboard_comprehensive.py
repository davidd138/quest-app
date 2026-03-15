"""Comprehensive tests for get_leaderboard resolver — edge cases and security."""
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


def _get_user_side_effect(users_map):
    """Helper to create a get_item side_effect from a dict of userId -> user data."""
    def get_user(Key):
        uid = Key["userId"]
        item = users_map.get(uid)
        return {"Item": item} if item else {}
    return get_user


class TestGetLeaderboardComprehensive:
    """Comprehensive edge-case tests for get_leaderboard."""

    # 1. Returns sorted by totalPoints descending
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_sorted_by_total_points_descending(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 50, "questId": "q1"},
                {"userId": "u2", "score": 300, "questId": "q1"},
                {"userId": "u3", "score": 150, "questId": "q1"},
            ],
        }
        mock_users.get_item.side_effect = _get_user_side_effect({
            "u1": {"userId": "u1", "name": "Alice"},
            "u2": {"userId": "u2", "name": "Bob"},
            "u3": {"userId": "u3", "name": "Charlie"},
        })

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["totalPoints"] == 300
        assert result[1]["totalPoints"] == 150
        assert result[2]["totalPoints"] == 50

    # 2. Correct rank numbers
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_correct_rank_numbers(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": f"u{i}", "score": (4 - i) * 100, "questId": "q1"}
                for i in range(1, 4)
            ],
        }
        mock_users.get_item.side_effect = _get_user_side_effect({
            f"u{i}": {"userId": f"u{i}", "name": f"User{i}"} for i in range(1, 4)
        })

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["rank"] == 1
        assert result[1]["rank"] == 2
        assert result[2]["rank"] == 3

    # 3. Limit parameter trims results
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_limit_parameter_trims(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": f"u{i}", "score": i * 10, "questId": "q1"}
                for i in range(1, 21)
            ],
        }
        mock_users.get_item.side_effect = _get_user_side_effect({
            f"u{i}": {"userId": f"u{i}", "name": f"User{i}"} for i in range(1, 21)
        })

        from get_leaderboard import handler

        result = handler(make_event(arguments={"limit": 5}), None)

        assert len(result) == 5

    # 4. Default limit is 20
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_default_limit_is_20(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": f"u{i}", "score": i * 10, "questId": "q1"}
                for i in range(1, 31)
            ],
        }
        mock_users.get_item.side_effect = _get_user_side_effect({
            f"u{i}": {"userId": f"u{i}", "name": f"User{i}"} for i in range(1, 31)
        })

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert len(result) == 20

    # 5. Empty scores returns empty list
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_empty_scores_returns_empty(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {"Items": []}

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result == []

    # 6. Ties get sequential ranks (current implementation)
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_ties_get_sequential_ranks(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 100, "questId": "q1"},
                {"userId": "u2", "score": 100, "questId": "q1"},
                {"userId": "u3", "score": 50, "questId": "q1"},
            ],
        }
        mock_users.get_item.side_effect = _get_user_side_effect({
            "u1": {"userId": "u1", "name": "Alice"},
            "u2": {"userId": "u2", "name": "Bob"},
            "u3": {"userId": "u3", "name": "Charlie"},
        })

        from get_leaderboard import handler

        result = handler(make_event(), None)

        # Both tied users have 100 points; ranks are sequential (1, 2, 3)
        ranks = [e["rank"] for e in result]
        assert ranks == [1, 2, 3]
        assert result[0]["totalPoints"] == 100
        assert result[1]["totalPoints"] == 100
        assert result[2]["totalPoints"] == 50

    # 7. User names from users table
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_user_names_from_users_table(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [{"userId": "u1", "score": 100, "questId": "q1"}],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice Wonderland"},
        }

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["userName"] == "Alice Wonderland"

    # 8. Missing user fallback to Unknown
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_missing_user_fallback_unknown(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [{"userId": "deleted-user", "score": 100, "questId": "q1"}],
        }
        mock_users.get_item.return_value = {}

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["userName"] == "Unknown"

    # 9. Avatar URL included
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_avatar_url_included(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [{"userId": "u1", "score": 100, "questId": "q1"}],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice", "avatarUrl": "https://example.com/avatar.jpg"},
        }

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["avatarUrl"] == "https://example.com/avatar.jpg"

    # 10. Average score calculation
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_average_score_calculation(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 100, "questId": "q1"},
                {"userId": "u1", "score": 200, "questId": "q2"},
            ],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice"},
        }

        from get_leaderboard import handler

        result = handler(make_event(), None)

        # totalPoints=300, questsCompleted=2, averageScore=150.0
        assert result[0]["averageScore"] == 150.0

    # 11. Multiple scores per user aggregated
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_multiple_scores_aggregated(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 50, "questId": "q1"},
                {"userId": "u1", "score": 75, "questId": "q2"},
                {"userId": "u1", "score": 25, "questId": "q3"},
            ],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice"},
        }

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["totalPoints"] == 150
        assert result[0]["questsCompleted"] == 3

    # 12. Single user leaderboard
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_single_user_leaderboard(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [{"userId": "u1", "score": 500, "questId": "q1"}],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Solo Player"},
        }

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert len(result) == 1
        assert result[0]["rank"] == 1
        assert result[0]["userName"] == "Solo Player"
        assert result[0]["totalPoints"] == 500

    # 13. Large dataset — many users sorted correctly
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_large_dataset_sorted_correctly(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        items = [
            {"userId": f"u{i}", "score": i * 10, "questId": "q1"}
            for i in range(1, 51)
        ]
        mock_scores.scan.return_value = {"Items": items}
        mock_users.get_item.side_effect = _get_user_side_effect({
            f"u{i}": {"userId": f"u{i}", "name": f"User{i}"} for i in range(1, 51)
        })

        from get_leaderboard import handler

        result = handler(make_event(arguments={"limit": 50}), None)

        # Highest scorer is u50 with 500 points
        assert result[0]["totalPoints"] == 500
        assert result[-1]["totalPoints"] == 10
        # Verify descending order
        for i in range(len(result) - 1):
            assert result[i]["totalPoints"] >= result[i + 1]["totalPoints"]

    # 14. Score without matching user still appears
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_score_without_matching_user(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 200, "questId": "q1"},
                {"userId": "orphan", "score": 100, "questId": "q1"},
            ],
        }

        def get_user(Key):
            if Key["userId"] == "u1":
                return {"Item": {"userId": "u1", "name": "Alice"}}
            return {}

        mock_users.get_item.side_effect = get_user

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert len(result) == 2
        orphan = next(e for e in result if e["userId"] == "orphan")
        assert orphan["userName"] == "Unknown"
        assert orphan["avatarUrl"] is None

    # 15. Avatar URL is None when user has no avatar
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_avatar_url_none_when_not_set(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [{"userId": "u1", "score": 100, "questId": "q1"}],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice"},
        }

        from get_leaderboard import handler

        result = handler(make_event(), None)

        assert result[0]["avatarUrl"] is None
