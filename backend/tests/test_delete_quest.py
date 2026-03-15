"""Tests for delete_quest resolver: deletion, not found, admin access, UUID validation."""
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


SAMPLE_QUEST = {
    "id": VALID_UUID,
    "title": "The Lost Temple",
    "description": "An ancient temple awaits.",
    "isPublished": True,
}


class TestDeleteQuestSuccessfully:
    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_deletes_quest_returns_true(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.delete_item.return_value = {}

        from delete_quest import handler
        result = handler(make_admin_event(arguments={"id": VALID_UUID}), None)

        assert result is True

    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_calls_delete_item_with_correct_key(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.delete_item.return_value = {}

        from delete_quest import handler
        handler(make_admin_event(arguments={"id": VALID_UUID}), None)

        mock_table.delete_item.assert_called_once_with(Key={"id": VALID_UUID})

    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_verifies_quest_exists_before_deletion(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.delete_item.return_value = {}

        from delete_quest import handler
        handler(make_admin_event(arguments={"id": VALID_UUID}), None)

        mock_table.get_item.assert_called_once_with(Key={"id": VALID_UUID})


class TestDeleteQuestNotFound:
    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_quest_not_found_raises(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": None}

        from delete_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_admin_event(arguments={"id": VALID_UUID}), None)

    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_quest_not_found_no_item_key(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {}

        from delete_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_admin_event(arguments={"id": VALID_UUID}), None)

    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_does_not_call_delete_when_not_found(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {}

        from delete_quest import handler
        with pytest.raises(Exception):
            handler(make_admin_event(arguments={"id": VALID_UUID}), None)

        mock_table.delete_item.assert_not_called()


class TestDeleteQuestNonAdminRejected:
    @patch("delete_quest.check_admin_access")
    def test_non_admin_raises_permission_error(self, mock_admin):
        mock_admin.side_effect = PermissionError("Admin access required")

        from delete_quest import handler
        with pytest.raises(PermissionError, match="Admin access required"):
            handler(make_user_event(arguments={"id": VALID_UUID}), None)


class TestDeleteQuestInvalidUUID:
    @patch("delete_quest.check_admin_access")
    def test_invalid_uuid_raises(self, mock_admin):
        mock_admin.return_value = True

        from delete_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_admin_event(arguments={"id": "not-a-uuid"}), None)

    @patch("delete_quest.check_admin_access")
    def test_empty_uuid_raises(self, mock_admin):
        mock_admin.return_value = True

        from delete_quest import handler
        with pytest.raises(Exception):
            handler(make_admin_event(arguments={"id": ""}), None)

    @patch("delete_quest.check_admin_access")
    def test_short_uuid_raises(self, mock_admin):
        mock_admin.return_value = True

        from delete_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_admin_event(arguments={"id": "550e8400"}), None)

    @patch("delete_quest.check_admin_access")
    def test_numeric_uuid_raises(self, mock_admin):
        mock_admin.return_value = True

        from delete_quest import handler
        with pytest.raises(Exception):
            handler(make_admin_event(arguments={"id": "12345"}), None)
