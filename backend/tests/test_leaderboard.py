"""Tests for get_leaderboard resolver."""
import sys
import os
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


class TestGetLeaderboard:
    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_empty_scores_returns_empty_list(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {"Items": []}

        from get_leaderboard import handler
        result = handler(make_event(), None)

        assert result == []

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_single_user_returns_one_entry(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 100, "questId": "q1"},
            ],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice", "email": "alice@example.com"},
        }

        from get_leaderboard import handler
        result = handler(make_event(), None)

        assert len(result) == 1
        assert result[0]["userId"] == "u1"
        assert result[0]["userName"] == "Alice"
        assert result[0]["totalPoints"] == 100
        assert result[0]["questsCompleted"] == 1
        assert result[0]["rank"] == 1

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_multiple_users_sorted_by_total_points(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 50, "questId": "q1"},
                {"userId": "u2", "score": 200, "questId": "q1"},
                {"userId": "u2", "score": 100, "questId": "q2"},
                {"userId": "u3", "score": 150, "questId": "q1"},
            ],
        }

        def get_user(Key):
            users = {
                "u1": {"userId": "u1", "name": "Alice"},
                "u2": {"userId": "u2", "name": "Bob"},
                "u3": {"userId": "u3", "name": "Charlie"},
            }
            uid = Key["userId"]
            return {"Item": users.get(uid)}

        mock_users.get_item.side_effect = get_user

        from get_leaderboard import handler
        result = handler(make_event(), None)

        assert len(result) == 3
        # Bob has 300 points (200 + 100), Charlie has 150, Alice has 50
        assert result[0]["userName"] == "Bob"
        assert result[0]["totalPoints"] == 300
        assert result[0]["rank"] == 1
        assert result[0]["questsCompleted"] == 2

        assert result[1]["userName"] == "Charlie"
        assert result[1]["totalPoints"] == 150
        assert result[1]["rank"] == 2
        assert result[1]["questsCompleted"] == 1

        assert result[2]["userName"] == "Alice"
        assert result[2]["totalPoints"] == 50
        assert result[2]["rank"] == 3

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_rank_calculation_sequential(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": f"u{i}", "score": (5 - i) * 100, "questId": "q1"}
                for i in range(1, 6)
            ],
        }

        def get_user(Key):
            uid = Key["userId"]
            return {"Item": {"userId": uid, "name": f"User {uid}"}}

        mock_users.get_item.side_effect = get_user

        from get_leaderboard import handler
        result = handler(make_event(), None)

        ranks = [entry["rank"] for entry in result]
        assert ranks == [1, 2, 3, 4, 5]

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_limit_parameter(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": f"u{i}", "score": (10 - i) * 100, "questId": "q1"}
                for i in range(1, 11)
            ],
        }

        def get_user(Key):
            uid = Key["userId"]
            return {"Item": {"userId": uid, "name": f"User {uid}"}}

        mock_users.get_item.side_effect = get_user

        from get_leaderboard import handler
        result = handler(make_event(arguments={"limit": 3}), None)

        assert len(result) == 3
        assert result[0]["rank"] == 1
        assert result[2]["rank"] == 3

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_user_name_fallback_to_email(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 100, "questId": "q1"},
            ],
        }
        # User has email but no name
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "email": "alice@example.com"},
        }

        from get_leaderboard import handler
        result = handler(make_event(), None)

        assert result[0]["userName"] == "alice@example.com"

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_user_not_found_shows_unknown(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 100, "questId": "q1"},
            ],
        }
        # User not found in table
        mock_users.get_item.return_value = {}

        from get_leaderboard import handler
        result = handler(make_event(), None)

        assert result[0]["userName"] == "Unknown"

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_average_score_calculation(self, mock_scores, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"userId": "u1", "score": 100, "questId": "q1"},
                {"userId": "u1", "score": 200, "questId": "q2"},
                {"userId": "u1", "score": 300, "questId": "q3"},
            ],
        }
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice"},
        }

        from get_leaderboard import handler
        result = handler(make_event(), None)

        # totalPoints = 600, questsCompleted = 3, averageScore = 200.0
        assert result[0]["totalPoints"] == 600
        assert result[0]["questsCompleted"] == 3
        assert result[0]["averageScore"] == 200.0

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_paginated_scan(self, mock_scores, mock_users, mock_auth):
        """Verify the resolver handles paginated DynamoDB scans."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        # First page returns items + LastEvaluatedKey, second page ends
        mock_scores.scan.side_effect = [
            {
                "Items": [{"userId": "u1", "score": 50, "questId": "q1"}],
                "LastEvaluatedKey": {"id": "key1"},
            },
            {
                "Items": [{"userId": "u1", "score": 50, "questId": "q2"}],
            },
        ]
        mock_users.get_item.return_value = {
            "Item": {"userId": "u1", "name": "Alice"},
        }

        from get_leaderboard import handler
        result = handler(make_event(), None)

        assert len(result) == 1
        assert result[0]["totalPoints"] == 100
        assert result[0]["questsCompleted"] == 2
        assert mock_scores.scan.call_count == 2
