"""Tests for data export format and structure."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

USER_ID = "user-export-456"
USERNAME = "export@example.com"


def make_event(user_id=USER_ID, username=USERNAME):
    return {
        "identity": {"sub": user_id, "username": username, "claims": {}},
        "request": {"headers": {"x-forwarded-for": "10.0.0.1"}},
    }


class TestExportUserDataFormat:
    """Verify that export_user_data returns the correct structure and formatting."""

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_export_returns_correct_top_level_structure(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """export_user_data must return user, progress, conversations, scores, achievements, exportedAt."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {"userId": USER_ID, "email": USERNAME, "totalPoints": Decimal("0")}
        }
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        expected_keys = {"user", "progress", "conversations", "scores", "achievements", "exportedAt"}
        assert set(result.keys()) == expected_keys

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_all_user_fields_present(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """The user object should contain all profile fields."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "email": USERNAME,
                "name": "Export User",
                "role": "user",
                "status": "active",
                "totalPoints": Decimal("1250"),
                "questsCompleted": Decimal("7"),
                "createdAt": "2026-01-15T10:30:00+00:00",
                "updatedAt": "2026-03-10T14:00:00+00:00",
            }
        }
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        user = result["user"]
        assert user["userId"] == USER_ID
        assert user["email"] == USERNAME
        assert user["name"] == "Export User"
        assert user["role"] == "user"
        assert user["status"] == "active"
        assert user["totalPoints"] == 1250
        assert user["questsCompleted"] == 7
        assert "createdAt" in user
        assert "updatedAt" in user

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_exported_at_is_iso_format(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """exportedAt should be a valid ISO 8601 timestamp."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        exported_at = result["exportedAt"]
        # Should parse without error as ISO format
        parsed = datetime.fromisoformat(exported_at)
        assert parsed.tzinfo is not None  # Should include timezone info

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_decimal_values_converted_to_int(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """DynamoDB Decimal values should be converted to Python int when they are whole numbers."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "totalPoints": Decimal("500"),
                "questsCompleted": Decimal("3"),
            }
        }
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {
            "Items": [
                {
                    "id": "prog-1",
                    "userId": USER_ID,
                    "currentStageIndex": Decimal("2"),
                    "totalPoints": Decimal("300"),
                    "totalDuration": Decimal("1800"),
                },
            ],
        }
        mock_conversations.query.return_value = {
            "Items": [
                {
                    "id": "conv-1",
                    "userId": USER_ID,
                    "duration": Decimal("120"),
                },
            ],
        }
        mock_scores.query.return_value = {
            "Items": [
                {
                    "id": "score-1",
                    "userId": USER_ID,
                    "totalPoints": Decimal("250"),
                    "completionTime": Decimal("900"),
                    "stagesCompleted": Decimal("3"),
                    "totalStages": Decimal("5"),
                },
            ],
        }
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        # User decimals
        assert isinstance(result["user"]["totalPoints"], int)
        assert result["user"]["totalPoints"] == 500
        assert isinstance(result["user"]["questsCompleted"], int)
        assert result["user"]["questsCompleted"] == 3

        # Progress decimals
        prog = result["progress"][0]
        assert isinstance(prog["currentStageIndex"], int)
        assert prog["currentStageIndex"] == 2
        assert isinstance(prog["totalPoints"], int)
        assert prog["totalPoints"] == 300
        assert isinstance(prog["totalDuration"], int)

        # Conversation decimals
        conv = result["conversations"][0]
        assert isinstance(conv["duration"], int)
        assert conv["duration"] == 120

        # Score decimals
        score = result["scores"][0]
        assert isinstance(score["totalPoints"], int)
        assert score["totalPoints"] == 250
        assert isinstance(score["completionTime"], int)
        assert isinstance(score["stagesCompleted"], int)
        assert isinstance(score["totalStages"], int)

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_decimal_float_values_converted_to_float(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """DynamoDB Decimal values with fractional parts should convert to float."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "averageScore": Decimal("85.5"),
            }
        }
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert isinstance(result["user"]["averageScore"], float)
        assert result["user"]["averageScore"] == 85.5

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_collections_are_lists(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """progress, conversations, scores, achievements should all be lists."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert isinstance(result["progress"], list)
        assert isinstance(result["conversations"], list)
        assert isinstance(result["scores"], list)
        assert isinstance(result["achievements"], list)

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_string_fields_not_affected_by_decimal_conversion(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        """String and boolean fields should pass through unchanged."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "email": USERNAME,
                "name": "Test User",
                "status": "active",
            }
        }
        mock_users.update_item.return_value = {}
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert isinstance(result["user"]["userId"], str)
        assert isinstance(result["user"]["email"], str)
        assert isinstance(result["user"]["name"], str)
        assert isinstance(result["user"]["status"], str)
