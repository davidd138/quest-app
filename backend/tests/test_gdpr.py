"""Tests for GDPR resolvers: export_user_data and delete_user_data."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock, call
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

USER_ID = "user-gdpr-123"
USERNAME = "testuser@example.com"


def make_event(user_id=USER_ID, username=USERNAME):
    return {
        "identity": {"sub": user_id, "username": username, "claims": {}},
        "request": {"headers": {"x-forwarded-for": "127.0.0.1"}},
    }


# ── export_user_data ──────────────────────────────────────────────────────

class TestExportUserData:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_export_success_collects_from_all_tables(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        # User profile
        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "email": "test@example.com",
                "displayName": "Test User",
                "totalPoints": Decimal("500"),
            }
        }
        mock_users.update_item.return_value = {}

        # Progress records
        mock_progress.query.return_value = {
            "Items": [
                {"id": "prog-1", "userId": USER_ID, "questId": "q-1", "completedStages": Decimal("2")},
                {"id": "prog-2", "userId": USER_ID, "questId": "q-2", "completedStages": Decimal("0")},
            ],
        }

        # Conversations
        mock_conversations.query.return_value = {
            "Items": [
                {"id": "conv-1", "userId": USER_ID, "transcript": "[]"},
            ],
        }

        # Scores
        mock_scores.query.return_value = {
            "Items": [
                {"id": "score-1", "userId": USER_ID, "points": Decimal("100")},
            ],
        }

        # Achievements
        mock_achievements.query.return_value = {
            "Items": [
                {"id": "ach-1", "userId": USER_ID, "type": "first_quest"},
            ],
        }

        from export_user_data import handler
        result = handler(make_event(), None)

        # Verify all data sections present
        assert "user" in result
        assert "progress" in result
        assert "conversations" in result
        assert "scores" in result
        assert "achievements" in result
        assert "exportedAt" in result

        # Verify user data
        assert result["user"]["userId"] == USER_ID
        assert result["user"]["totalPoints"] == 500  # Decimal converted to int

        # Verify counts
        assert len(result["progress"]) == 2
        assert len(result["conversations"]) == 1
        assert len(result["scores"]) == 1
        assert len(result["achievements"]) == 1

        # Verify Decimal conversion
        assert result["progress"][0]["completedStages"] == 2
        assert isinstance(result["progress"][0]["completedStages"], int)
        assert result["scores"][0]["points"] == 100

        # Verify audit log update
        mock_users.update_item.assert_called_once()
        update_call = mock_users.update_item.call_args
        assert update_call[1]["Key"] == {"userId": USER_ID}
        assert "lastDataExportAt" in update_call[1]["UpdateExpression"]

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_export_user_not_found_returns_empty_data(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        # User profile not found
        mock_users.get_item.return_value = {}
        mock_users.update_item.return_value = {}

        # All tables return empty
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert result["user"] == {}
        assert result["progress"] == []
        assert result["conversations"] == []
        assert result["scores"] == []
        assert result["achievements"] == []
        assert "exportedAt" in result


# ── delete_user_data ──────────────────────────────────────────────────────

class TestDeleteUserData:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_delete_success_removes_from_all_tables_and_cognito(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        # Progress records to delete
        mock_progress.query.return_value = {
            "Items": [
                {"id": "prog-1", "userId": USER_ID},
                {"id": "prog-2", "userId": USER_ID},
            ],
        }
        mock_progress.delete_item.return_value = {}

        # Conversations to delete
        mock_conversations.query.return_value = {
            "Items": [
                {"id": "conv-1", "userId": USER_ID},
            ],
        }
        mock_conversations.delete_item.return_value = {}

        # Scores to delete
        mock_scores.query.return_value = {
            "Items": [
                {"id": "score-1", "userId": USER_ID},
            ],
        }
        mock_scores.delete_item.return_value = {}

        # Achievements to delete
        mock_achievements.query.return_value = {
            "Items": [
                {"id": "ach-1", "userId": USER_ID},
            ],
        }
        mock_achievements.delete_item.return_value = {}

        # User profile delete
        mock_users.delete_item.return_value = {}

        # Cognito delete
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)

        assert result is True

        # Verify progress items deleted
        assert mock_progress.delete_item.call_count == 2
        mock_progress.delete_item.assert_any_call(Key={"id": "prog-1"})
        mock_progress.delete_item.assert_any_call(Key={"id": "prog-2"})

        # Verify conversation deleted
        mock_conversations.delete_item.assert_called_once_with(Key={"id": "conv-1"})

        # Verify score deleted
        mock_scores.delete_item.assert_called_once_with(Key={"id": "score-1"})

        # Verify achievement deleted
        mock_achievements.delete_item.assert_called_once_with(Key={"id": "ach-1"})

        # Verify user profile deleted
        mock_users.delete_item.assert_called_once_with(Key={"userId": USER_ID})

        # Verify Cognito account deleted
        mock_cognito.admin_delete_user.assert_called_once_with(
            UserPoolId=os.environ["USER_POOL_ID"],
            Username=USERNAME,
        )

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_delete_user_not_found_still_completes(
        self, mock_achievements, mock_scores, mock_conversations,
        mock_progress, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        # All tables return empty (user has no data)
        mock_progress.query.return_value = {"Items": []}
        mock_conversations.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_achievements.query.return_value = {"Items": []}

        # User profile delete succeeds even if no item
        mock_users.delete_item.return_value = {}

        # Cognito delete succeeds
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)

        assert result is True

        # No items to delete from data tables
        mock_progress.delete_item.assert_not_called()
        mock_conversations.delete_item.assert_not_called()
        mock_scores.delete_item.assert_not_called()
        mock_achievements.delete_item.assert_not_called()

        # User profile and Cognito still attempted
        mock_users.delete_item.assert_called_once_with(Key={"userId": USER_ID})
        mock_cognito.admin_delete_user.assert_called_once()
