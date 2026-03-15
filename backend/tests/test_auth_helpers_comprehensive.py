"""Exhaustive tests for auth_helpers.py: check_user_access, check_admin_access, _get_groups_from_event."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


# ── check_user_access (comprehensive) ────────────────────────────────

class TestCheckUserAccessComprehensive:
    @patch("auth_helpers.users_table")
    def test_active_user(self, mock_table):
        user = {"userId": "u1", "status": "active", "email": "a@b.com"}
        mock_table.get_item.return_value = {"Item": user}
        from auth_helpers import check_user_access
        result = check_user_access("u1")
        assert result == user

    @patch("auth_helpers.users_table")
    def test_pending_user(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "status": "pending"}}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="pending approval"):
            check_user_access("u1")

    @patch("auth_helpers.users_table")
    def test_suspended_user(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "status": "suspended"}}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="suspended"):
            check_user_access("u1")

    @patch("auth_helpers.users_table")
    def test_expired_user(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "status": "expired"}}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="expired"):
            check_user_access("u1")

    @patch("auth_helpers.users_table")
    def test_not_found(self, mock_table):
        mock_table.get_item.return_value = {}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="User not found"):
            check_user_access("nonexistent")

    @patch("auth_helpers.users_table")
    def test_no_status_field_defaults_pending(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "u1"}}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="pending approval"):
            check_user_access("u1")

    @patch("auth_helpers.users_table")
    def test_unknown_status(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "status": "banned"}}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="Unknown account status"):
            check_user_access("u1")

    @patch("auth_helpers.users_table")
    def test_empty_user_id(self, mock_table):
        mock_table.get_item.return_value = {}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="User not found"):
            check_user_access("")

    @patch("auth_helpers.users_table")
    def test_none_user_id(self, mock_table):
        # DynamoDB may raise or return empty for None key — we expect not found
        mock_table.get_item.return_value = {}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="User not found"):
            check_user_access(None)

    @patch("auth_helpers.users_table")
    def test_active_user_returns_full_record(self, mock_table):
        user = {"userId": "u1", "status": "active", "email": "x@y.com", "role": "player"}
        mock_table.get_item.return_value = {"Item": user}
        from auth_helpers import check_user_access
        result = check_user_access("u1")
        assert result["email"] == "x@y.com"
        assert result["role"] == "player"

    @patch("auth_helpers.users_table")
    def test_get_item_called_with_correct_key(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "uid-123", "status": "active"}}
        from auth_helpers import check_user_access
        check_user_access("uid-123")
        mock_table.get_item.assert_called_once_with(Key={"userId": "uid-123"})

    @patch("auth_helpers.users_table")
    def test_status_deactivated_is_unknown(self, mock_table):
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "status": "deactivated"}}
        from auth_helpers import check_user_access
        with pytest.raises(PermissionError, match="Unknown account status: deactivated"):
            check_user_access("u1")


# ── check_admin_access (comprehensive) ───────────────────────────────

class TestCheckAdminAccessComprehensive:
    @patch("auth_helpers.users_table")
    def test_cognito_group_list(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": ["admins"]}}}
        from auth_helpers import check_admin_access
        assert check_admin_access(event, "u1") is True
        mock_table.get_item.assert_not_called()

    @patch("auth_helpers.users_table")
    def test_cognito_group_string(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": "admins"}}}
        from auth_helpers import check_admin_access
        assert check_admin_access(event, "u1") is True

    @patch("auth_helpers.users_table")
    def test_db_role_admin(self, mock_table):
        event = {"identity": {"claims": {}}}
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "role": "admin"}}
        from auth_helpers import check_admin_access
        assert check_admin_access(event, "u1") is True

    @patch("auth_helpers.users_table")
    def test_non_admin_raises(self, mock_table):
        event = {"identity": {"claims": {}}}
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "role": "player"}}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "u1")

    @patch("auth_helpers.users_table")
    def test_missing_identity(self, mock_table):
        event = {}
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "role": "player"}}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "u1")

    @patch("auth_helpers.users_table")
    def test_empty_groups_list(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": []}}}
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "role": "player"}}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "u1")

    @patch("auth_helpers.users_table")
    def test_other_group(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": ["editors"]}}}
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "role": "user"}}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "u1")

    @patch("auth_helpers.users_table")
    def test_multiple_groups_includes_admins(self, mock_table):
        event = {"identity": {"claims": {"cognito:groups": ["editors", "admins", "testers"]}}}
        from auth_helpers import check_admin_access
        assert check_admin_access(event, "u1") is True

    @patch("auth_helpers.users_table")
    def test_user_not_found_in_db(self, mock_table):
        event = {"identity": {"claims": {}}}
        mock_table.get_item.return_value = {}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "nonexistent")

    @patch("auth_helpers.users_table")
    def test_no_role_field_in_db(self, mock_table):
        event = {"identity": {"claims": {}}}
        mock_table.get_item.return_value = {"Item": {"userId": "u1"}}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "u1")

    @patch("auth_helpers.users_table")
    def test_role_moderator_not_admin(self, mock_table):
        event = {"identity": {"claims": {}}}
        mock_table.get_item.return_value = {"Item": {"userId": "u1", "role": "moderator"}}
        from auth_helpers import check_admin_access
        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "u1")


# ── _get_groups_from_event (comprehensive) ───────────────────────────

class TestGetGroupsFromEvent:
    def test_list_groups(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": {"claims": {"cognito:groups": ["admins", "editors"]}}}
        result = _get_groups_from_event(event)
        assert result == ["admins", "editors"]

    def test_string_group(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": {"claims": {"cognito:groups": "admins"}}}
        result = _get_groups_from_event(event)
        assert result == ["admins"]

    def test_empty_list(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": {"claims": {"cognito:groups": []}}}
        result = _get_groups_from_event(event)
        assert result == []

    def test_missing_claims(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": {}}
        result = _get_groups_from_event(event)
        assert result == []

    def test_missing_identity(self):
        from auth_helpers import _get_groups_from_event
        event = {}
        result = _get_groups_from_event(event)
        assert result == []

    def test_none_event(self):
        from auth_helpers import _get_groups_from_event
        result = _get_groups_from_event(None)
        assert result == []

    def test_no_groups_key(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": {"claims": {"other": "value"}}}
        result = _get_groups_from_event(event)
        assert result == []

    def test_identity_is_none(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": None}
        result = _get_groups_from_event(event)
        assert result == []

    def test_claims_is_none_raises(self):
        from auth_helpers import _get_groups_from_event
        # claims=None causes AttributeError on .get(), not caught by except block
        event = {"identity": {"claims": None}}
        with pytest.raises(AttributeError):
            _get_groups_from_event(event)

    def test_single_element_list(self):
        from auth_helpers import _get_groups_from_event
        event = {"identity": {"claims": {"cognito:groups": ["viewers"]}}}
        result = _get_groups_from_event(event)
        assert result == ["viewers"]
