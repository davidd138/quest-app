"""Tests for auth_helpers.py: check_user_access and check_admin_access."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


# ── check_user_access ──────────────────────────────────────────────────

class TestCheckUserAccess:
    @patch("auth_helpers.users_table")
    def test_active_user_returns_user(self, mock_table):
        user = {"userId": "user-1", "status": "active", "email": "test@test.com"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_user_access
        result = check_user_access("user-1")

        assert result == user
        mock_table.get_item.assert_called_once_with(Key={"userId": "user-1"})

    @patch("auth_helpers.users_table")
    def test_pending_user_raises(self, mock_table):
        user = {"userId": "user-1", "status": "pending"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="pending approval"):
            check_user_access("user-1")

    @patch("auth_helpers.users_table")
    def test_suspended_user_raises(self, mock_table):
        user = {"userId": "user-1", "status": "suspended"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="suspended"):
            check_user_access("user-1")

    @patch("auth_helpers.users_table")
    def test_expired_user_raises(self, mock_table):
        user = {"userId": "user-1", "status": "expired"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="expired"):
            check_user_access("user-1")

    @patch("auth_helpers.users_table")
    def test_user_not_found_raises(self, mock_table):
        mock_table.get_item.return_value = {}

        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="User not found"):
            check_user_access("nonexistent")

    @patch("auth_helpers.users_table")
    def test_no_status_defaults_to_pending(self, mock_table):
        user = {"userId": "user-1"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="pending approval"):
            check_user_access("user-1")

    @patch("auth_helpers.users_table")
    def test_unknown_status_raises(self, mock_table):
        user = {"userId": "user-1", "status": "banned"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="Unknown account status"):
            check_user_access("user-1")


# ── check_admin_access ─────────────────────────────────────────────────

class TestCheckAdminAccess:
    @patch("auth_helpers.users_table")
    def test_admin_via_cognito_group(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": ["admins"]}}}

        from auth_helpers import check_admin_access
        result = check_admin_access(event, "user-1")
        assert result is True
        # Should not need to check DynamoDB
        mock_table.get_item.assert_not_called()

    @patch("auth_helpers.users_table")
    def test_admin_via_cognito_group_string(self, mock_table):
        # Groups can come as a string instead of list
        event = {"identity": {"claims": {"cognito:groups": "admins"}}}

        from auth_helpers import check_admin_access
        result = check_admin_access(event, "user-1")
        assert result is True

    @patch("auth_helpers.users_table")
    def test_admin_via_db_role(self, mock_table):
        event = {"identity": {"claims": {}}}
        user = {"userId": "user-1", "role": "admin"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_admin_access
        result = check_admin_access(event, "user-1")
        assert result is True

    @patch("auth_helpers.users_table")
    def test_non_admin_raises(self, mock_table):
        event = {"identity": {"claims": {}}}
        user = {"userId": "user-1", "role": "user"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "user-1")

    @patch("auth_helpers.users_table")
    def test_user_not_found_raises(self, mock_table):
        event = {"identity": {"claims": {}}}
        mock_table.get_item.return_value = {}

        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "nonexistent")

    @patch("auth_helpers.users_table")
    def test_missing_identity_raises(self, mock_table):
        event = {}
        mock_table.get_item.return_value = {"Item": {"userId": "u", "role": "user"}}

        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            # _get_groups_from_event returns [] when identity is missing
            check_admin_access(event, "user-1")

    @patch("auth_helpers.users_table")
    def test_other_group_not_admin(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": ["editors"]}}}
        user = {"userId": "user-1", "role": "user"}
        mock_table.get_item.return_value = {"Item": user}

        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "user-1")
