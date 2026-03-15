"""Tests for sync_user resolver: create/update user, admin detection, Cognito errors."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(username="testuser", sub="user-123"):
    return {
        "identity": {
            "username": username,
            "sub": sub,
        },
    }


MOCK_COGNITO_USER = {
    "UserAttributes": [
        {"Name": "email", "Value": "test@example.com"},
        {"Name": "name", "Value": "Test User"},
    ]
}

MOCK_COGNITO_GROUPS_EMPTY = {"Groups": []}
MOCK_COGNITO_GROUPS_ADMIN = {"Groups": [{"GroupName": "admins"}]}


class TestSyncUserCreatesNew:
    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_creates_new_user_with_correct_fields(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        mock_users.get_item.return_value = {}  # no existing user

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["userId"] == "user-123"
        assert result["email"] == "test@example.com"
        assert result["name"] == "Test User"
        assert result["role"] == "player"
        assert result["status"] == "active"
        assert result["totalPoints"] == 0
        assert result["questsCompleted"] == 0
        assert "createdAt" in result
        assert "updatedAt" in result
        mock_users.put_item.assert_called_once()

    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_sets_consented_at_for_new_users(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        mock_users.get_item.return_value = {}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["consentedAt"] != ""
        assert result["consentedAt"] == result["createdAt"]

    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_uses_email_prefix_when_no_name(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = {
            "UserAttributes": [
                {"Name": "email", "Value": "user@domain.com"},
            ]
        }
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        mock_users.get_item.return_value = {}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["name"] == "user"


class TestSyncUserUpdatesExisting:
    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_preserves_existing_fields(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        existing = {
            "userId": "user-123",
            "role": "player",
            "status": "active",
            "totalPoints": 500,
            "questsCompleted": 10,
            "createdAt": "2025-01-01T00:00:00+00:00",
            "consentedAt": "2025-01-01T00:00:00+00:00",
        }
        mock_users.get_item.return_value = {"Item": existing}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["totalPoints"] == 500
        assert result["questsCompleted"] == 10
        assert result["createdAt"] == "2025-01-01T00:00:00+00:00"
        assert result["consentedAt"] == "2025-01-01T00:00:00+00:00"

    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_updates_name_and_email(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = {
            "UserAttributes": [
                {"Name": "email", "Value": "new@example.com"},
                {"Name": "name", "Value": "New Name"},
            ]
        }
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        existing = {
            "userId": "user-123",
            "role": "player",
            "status": "active",
            "totalPoints": 0,
            "questsCompleted": 0,
            "createdAt": "2025-01-01T00:00:00+00:00",
        }
        mock_users.get_item.return_value = {"Item": existing}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["email"] == "new@example.com"
        assert result["name"] == "New Name"

    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_preserves_suspended_status(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        existing = {
            "userId": "user-123",
            "role": "player",
            "status": "suspended",
            "totalPoints": 0,
            "questsCompleted": 0,
            "createdAt": "2025-01-01T00:00:00+00:00",
        }
        mock_users.get_item.return_value = {"Item": existing}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["status"] == "suspended"


class TestSyncUserAdminDetection:
    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_detects_admin_group_new_user(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_ADMIN
        mock_users.get_item.return_value = {}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["role"] == "admin"

    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_detects_admin_group_existing_user(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_ADMIN
        existing = {
            "userId": "user-123",
            "role": "player",
            "status": "active",
            "totalPoints": 0,
            "questsCompleted": 0,
            "createdAt": "2025-01-01T00:00:00+00:00",
        }
        mock_users.get_item.return_value = {"Item": existing}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["role"] == "admin"

    @patch("sync_user.users_table")
    @patch("sync_user.cognito")
    def test_non_admin_preserves_player_role(self, mock_cognito, mock_users):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY
        existing = {
            "userId": "user-123",
            "role": "player",
            "status": "active",
            "totalPoints": 0,
            "questsCompleted": 0,
            "createdAt": "2025-01-01T00:00:00+00:00",
        }
        mock_users.get_item.return_value = {"Item": existing}

        from sync_user import handler
        result = handler(make_event(), None)

        assert result["role"] == "player"


class TestSyncUserErrors:
    @patch("sync_user.cognito")
    def test_missing_user_id_raises(self, mock_cognito):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY

        from sync_user import handler
        with pytest.raises(Exception):
            handler({"identity": {"username": "testuser", "sub": ""}}, None)

    @patch("sync_user.cognito")
    def test_missing_email_raises(self, mock_cognito):
        mock_cognito.admin_get_user.return_value = {"UserAttributes": []}
        mock_cognito.admin_list_groups_for_user.return_value = MOCK_COGNITO_GROUPS_EMPTY

        from sync_user import handler
        with pytest.raises(Exception, match="Missing user_id.*or email"):
            handler(make_event(), None)

    @patch("sync_user.cognito")
    def test_cognito_error_propagates(self, mock_cognito):
        mock_cognito.admin_get_user.side_effect = Exception("Cognito service unavailable")

        from sync_user import handler
        with pytest.raises(Exception, match="Cognito service unavailable"):
            handler(make_event(), None)

    @patch("sync_user.cognito")
    def test_cognito_groups_error_propagates(self, mock_cognito):
        mock_cognito.admin_get_user.return_value = MOCK_COGNITO_USER
        mock_cognito.admin_list_groups_for_user.side_effect = Exception("Groups lookup failed")

        from sync_user import handler
        with pytest.raises(Exception, match="Groups lookup failed"):
            handler(make_event(), None)
