"""Comprehensive tests for approve_quest resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="admin-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or ["admins"]},
        },
        "arguments": arguments or {},
    }


class TestApproveQuestComprehensive:
    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    @patch("approve_quest.users_table")
    def test_approve_sets_is_published_true(self, mock_users, mock_quests, mock_admin):
        """Approving a quest should set isPublished to True."""
        mock_admin.return_value = True
        mock_quests.get_item.return_value = {
            "Item": {
                "id": VALID_UUID,
                "title": "Community Quest",
                "isPublished": False,
                "createdBy": "creator-1",
            }
        }

        from approve_quest import handler
        event = make_event(arguments={
            "questId": VALID_UUID,
            "approved": True,
        })
        result = handler(event, None)

        assert result["isPublished"] is True
        assert "approvedAt" in result
        assert result["approvedBy"] == "admin-1"
        mock_quests.update_item.assert_called_once()

    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    @patch("approve_quest.users_table")
    def test_reject_sets_rejected_at_and_reason(self, mock_users, mock_quests, mock_admin):
        """Rejecting a quest should set rejectedAt and rejectionReason."""
        mock_admin.return_value = True
        mock_quests.get_item.return_value = {
            "Item": {
                "id": VALID_UUID,
                "title": "Bad Quest",
                "isPublished": False,
                "createdBy": "creator-1",
            }
        }

        from approve_quest import handler
        event = make_event(arguments={
            "questId": VALID_UUID,
            "approved": False,
            "rejectionReason": "Inappropriate content",
        })
        result = handler(event, None)

        assert "rejectedAt" in result
        assert result["rejectedBy"] == "admin-1"
        assert result["rejectionReason"] == "Inappropriate content"

    @patch("approve_quest.check_admin_access")
    def test_non_admin_rejected(self, mock_admin):
        """Non-admin users should be rejected."""
        mock_admin.side_effect = PermissionError("Admin access required")

        from approve_quest import handler
        event = make_event(
            user_id="regular-user",
            arguments={"questId": VALID_UUID, "approved": True},
            groups=[],
        )
        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)

    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    def test_quest_not_found(self, mock_quests, mock_admin):
        """Should raise when quest does not exist."""
        mock_admin.return_value = True
        mock_quests.get_item.return_value = {}

        from approve_quest import handler
        event = make_event(arguments={
            "questId": VALID_UUID,
            "approved": True,
        })
        with pytest.raises(Exception, match="Quest not found"):
            handler(event, None)

    @patch("approve_quest.check_admin_access")
    def test_invalid_quest_id_empty(self, mock_admin):
        """Empty questId should raise an error."""
        mock_admin.return_value = True

        from approve_quest import handler
        event = make_event(arguments={
            "questId": "",
            "approved": True,
        })
        with pytest.raises(Exception, match="questId is required"):
            handler(event, None)

    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    @patch("approve_quest.users_table")
    def test_already_published_quest_can_be_approved_again(self, mock_users, mock_quests, mock_admin):
        """An already-published quest should still accept approval (idempotent)."""
        mock_admin.return_value = True
        mock_quests.get_item.return_value = {
            "Item": {
                "id": VALID_UUID,
                "title": "Published Quest",
                "isPublished": True,
                "approvedAt": "2025-01-01T00:00:00Z",
                "createdBy": "creator-1",
            }
        }

        from approve_quest import handler
        event = make_event(arguments={
            "questId": VALID_UUID,
            "approved": True,
        })
        result = handler(event, None)

        assert result["isPublished"] is True
        mock_quests.update_item.assert_called_once()
