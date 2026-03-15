"""Tests for update_user_status resolver: status updates, admin access, validation."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"


def make_admin_event(user_id="admin-1", arguments=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": ["admins"]},
        },
        "arguments": arguments or {},
    }


def make_user_event(user_id="user-1", arguments=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": []},
        },
        "arguments": arguments or {},
    }


SAMPLE_USER = {
    "userId": VALID_UUID,
    "email": "test@example.com",
    "name": "Test User",
    "status": "active",
    "role": "user",
}


class TestUpdateUserStatusSuccessfully:
    @patch("update_user_status.check_admin_access")
    @patch("update_user_status.users_table")
    def test_updates_status_to_suspended(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_USER.copy()}
        mock_table.update_item.return_value = {}

        from update_user_status import handler
        result = handler(
            make_admin_event(arguments={"userId": VALID_UUID, "status": "suspended"}),
            None,
        )

        assert result["status"] == "suspended"

    @patch("update_user_status.check_admin_access")
    @patch("update_user_status.users_table")
    def test_updates_status_to_active(self, mock_table, mock_admin):
        mock_admin.return_value = True
        user = {**SAMPLE_USER, "status": "suspended"}
        mock_table.get_item.return_value = {"Item": user}
        mock_table.update_item.return_value = {}

        from update_user_status import handler
        result = handler(
            make_admin_event(arguments={"userId": VALID_UUID, "status": "active"}),
            None,
        )

        assert result["status"] == "active"

    @patch("update_user_status.check_admin_access")
    @patch("update_user_status.users_table")
    def test_calls_update_item_with_correct_params(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_USER.copy()}
        mock_table.update_item.return_value = {}

        from update_user_status import handler
        handler(
            make_admin_event(arguments={"userId": VALID_UUID, "status": "suspended"}),
            None,
        )

        mock_table.update_item.assert_called_once()
        call_kwargs = mock_table.update_item.call_args[1]
        assert call_kwargs["Key"] == {"userId": VALID_UUID}
        assert ":s" in call_kwargs["ExpressionAttributeValues"]
        assert call_kwargs["ExpressionAttributeValues"][":s"] == "suspended"

    @patch("update_user_status.check_admin_access")
    @patch("update_user_status.users_table")
    def test_returns_user_with_groups_default(self, mock_table, mock_admin):
        mock_admin.return_value = True
        user = SAMPLE_USER.copy()
        # No groups key
        mock_table.get_item.return_value = {"Item": user}
        mock_table.update_item.return_value = {}

        from update_user_status import handler
        result = handler(
            make_admin_event(arguments={"userId": VALID_UUID, "status": "active"}),
            None,
        )

        assert result["groups"] == []


class TestUpdateUserStatusNonAdminRejected:
    @patch("update_user_status.check_admin_access")
    def test_non_admin_raises_permission_error(self, mock_admin):
        mock_admin.side_effect = PermissionError("Admin access required")

        from update_user_status import handler
        with pytest.raises(PermissionError, match="Admin access required"):
            handler(
                make_user_event(arguments={"userId": VALID_UUID, "status": "suspended"}),
                None,
            )


class TestUpdateUserStatusInvalidStatusRejected:
    @patch("update_user_status.check_admin_access")
    def test_invalid_status_raises(self, mock_admin):
        mock_admin.return_value = True

        from update_user_status import handler
        with pytest.raises(Exception, match="status must be one of"):
            handler(
                make_admin_event(arguments={"userId": VALID_UUID, "status": "banned"}),
                None,
            )

    @patch("update_user_status.check_admin_access")
    def test_empty_status_raises(self, mock_admin):
        mock_admin.return_value = True

        from update_user_status import handler
        with pytest.raises(Exception):
            handler(
                make_admin_event(arguments={"userId": VALID_UUID, "status": ""}),
                None,
            )


class TestUpdateUserStatusUserNotFound:
    @patch("update_user_status.check_admin_access")
    @patch("update_user_status.users_table")
    def test_user_not_found_raises(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": None}

        from update_user_status import handler
        with pytest.raises(Exception, match="User not found"):
            handler(
                make_admin_event(arguments={"userId": VALID_UUID, "status": "active"}),
                None,
            )

    @patch("update_user_status.check_admin_access")
    @patch("update_user_status.users_table")
    def test_user_not_found_when_no_item_key(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {}

        from update_user_status import handler
        with pytest.raises(Exception, match="User not found"):
            handler(
                make_admin_event(arguments={"userId": VALID_UUID, "status": "active"}),
                None,
            )
