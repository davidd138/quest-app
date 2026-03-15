"""Tests for get_notification_preferences and update_notification_preferences resolvers."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


class TestUpdateNotificationPreferences:
    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_update_all_preferences(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}
        mock_table.update_item.side_effect = [
            {},  # ensure map exists
            {"Attributes": {"notificationPreferences": {
                "emailNotifications": False,
                "pushNotifications": False,
                "inAppNotifications": False,
                "marketingEmails": False,
            }}},
        ]

        from update_notification_preferences import handler
        result = handler({
            "identity": {"sub": "user-1"},
            "arguments": {"input": {
                "emailNotifications": False,
                "pushNotifications": False,
                "inAppNotifications": False,
                "marketingEmails": False,
            }},
        }, None)

        assert result["emailNotifications"] is False
        assert result["pushNotifications"] is False
        assert result["inAppNotifications"] is False
        assert result["marketingEmails"] is False

    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_update_single_preference(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}
        mock_table.update_item.side_effect = [
            {},
            {"Attributes": {"notificationPreferences": {
                "emailNotifications": False,
            }}},
        ]

        from update_notification_preferences import handler
        result = handler({
            "identity": {"sub": "user-1"},
            "arguments": {"input": {"emailNotifications": False}},
        }, None)

        assert result["emailNotifications"] is False
        # Defaults for unset preferences
        assert result["pushNotifications"] is True
        assert result["inAppNotifications"] is True
        assert result["marketingEmails"] is True

    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_empty_input_raises(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}

        from update_notification_preferences import handler
        with pytest.raises(Exception, match="At least one notification preference"):
            handler({
                "identity": {"sub": "user-1"},
                "arguments": {"input": {}},
            }, None)

    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_non_boolean_value_raises(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}

        from update_notification_preferences import handler
        with pytest.raises(Exception, match="must be a boolean"):
            handler({
                "identity": {"sub": "user-1"},
                "arguments": {"input": {"emailNotifications": "yes"}},
            }, None)

    @patch("update_notification_preferences.check_user_access")
    def test_non_active_user_rejected(self, mock_access):
        mock_access.side_effect = PermissionError("Account is suspended")

        from update_notification_preferences import handler
        with pytest.raises(PermissionError, match="suspended"):
            handler({
                "identity": {"sub": "user-1"},
                "arguments": {"input": {"emailNotifications": True}},
            }, None)

    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_unknown_keys_ignored(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}
        mock_table.update_item.side_effect = [
            {},
            {"Attributes": {"notificationPreferences": {
                "pushNotifications": True,
            }}},
        ]

        from update_notification_preferences import handler
        result = handler({
            "identity": {"sub": "user-1"},
            "arguments": {"input": {
                "pushNotifications": True,
                "unknownKey": "value",
            }},
        }, None)

        assert result["pushNotifications"] is True

    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_returns_defaults_for_missing_attributes(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}
        mock_table.update_item.side_effect = [
            {},
            {"Attributes": {}},
        ]

        from update_notification_preferences import handler
        result = handler({
            "identity": {"sub": "user-1"},
            "arguments": {"input": {"emailNotifications": True}},
        }, None)

        assert result["emailNotifications"] is True
        assert result["pushNotifications"] is True

    @patch("update_notification_preferences.users_table")
    @patch("update_notification_preferences.check_user_access")
    def test_integer_value_rejected(self, mock_access, mock_table):
        mock_access.return_value = {"userId": "user-1", "status": "active"}

        from update_notification_preferences import handler
        with pytest.raises(Exception, match="must be a boolean"):
            handler({
                "identity": {"sub": "user-1"},
                "arguments": {"input": {"pushNotifications": 1}},
            }, None)


class TestGetNotificationPreferences:
    @patch("get_notification_preferences.check_user_access")
    def test_defaults_when_none_set(self, mock_access):
        mock_access.return_value = {"userId": "user-1", "status": "active"}

        from get_notification_preferences import handler
        result = handler({"identity": {"sub": "user-1"}, "arguments": {}}, None)

        assert result["emailNotifications"] is True
        assert result["pushNotifications"] is True
        assert result["inAppNotifications"] is True
        assert result["marketingEmails"] is True

    @patch("get_notification_preferences.check_user_access")
    def test_returns_stored_preferences(self, mock_access):
        mock_access.return_value = {
            "userId": "user-1",
            "status": "active",
            "notificationPreferences": {
                "emailNotifications": False,
                "pushNotifications": True,
                "inAppNotifications": False,
                "marketingEmails": True,
            },
        }

        from get_notification_preferences import handler
        result = handler({"identity": {"sub": "user-1"}, "arguments": {}}, None)

        assert result["emailNotifications"] is False
        assert result["pushNotifications"] is True
        assert result["inAppNotifications"] is False
        assert result["marketingEmails"] is True

    @patch("get_notification_preferences.check_user_access")
    def test_partial_preferences_returns_defaults_for_missing(self, mock_access):
        mock_access.return_value = {
            "userId": "user-1",
            "status": "active",
            "notificationPreferences": {
                "emailNotifications": False,
            },
        }

        from get_notification_preferences import handler
        result = handler({"identity": {"sub": "user-1"}, "arguments": {}}, None)

        assert result["emailNotifications"] is False
        assert result["pushNotifications"] is True
        assert result["inAppNotifications"] is True
        assert result["marketingEmails"] is True

    @patch("get_notification_preferences.check_user_access")
    def test_non_active_user_rejected(self, mock_access):
        mock_access.side_effect = PermissionError("Account is suspended")

        from get_notification_preferences import handler
        with pytest.raises(PermissionError, match="suspended"):
            handler({"identity": {"sub": "user-1"}, "arguments": {}}, None)
