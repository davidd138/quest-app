"""Tests for content moderation resolvers."""
import sys
import os
import uuid
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None, groups=None):
    """Build a mock AppSync event."""
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


def make_admin_event(user_id="admin-1", arguments=None):
    """Build a mock AppSync event with admin group."""
    return make_event(user_id=user_id, arguments=arguments, groups=["admins"])


# ---- report_content tests ----


class TestReportContent:
    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_valid_report(self, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_users.get_item.return_value = {}  # No duplicate

        from report_content import handler

        event = make_event(arguments={
            "input": {
                "contentType": "quest",
                "contentId": "quest-123",
                "reason": "inappropriate",
                "details": "This quest has offensive content",
            }
        })
        result = handler(event, None)

        assert result["reporterId"] == "user-1"
        assert result["contentType"] == "quest"
        assert result["contentId"] == "quest-123"
        assert result["reason"] == "inappropriate"
        assert result["details"] == "This quest has offensive content"
        assert result["status"] == "pending"
        assert "id" in result
        assert "createdAt" in result
        assert mock_users.put_item.call_count == 2  # report + duplicate check key

    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_duplicate_prevention(self, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {"userId": "report#user-1#quest#quest-123", "status": "pending"}
        }

        from report_content import handler

        event = make_event(arguments={
            "input": {
                "contentType": "quest",
                "contentId": "quest-123",
                "reason": "spam",
            }
        })

        with pytest.raises(Exception, match="already reported"):
            handler(event, None)

    @patch("report_content.check_user_access")
    def test_invalid_content_type(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from report_content import handler

        event = make_event(arguments={
            "input": {
                "contentType": "invalid_type",
                "contentId": "id-123",
                "reason": "spam",
            }
        })

        with pytest.raises(Exception, match="contentType"):
            handler(event, None)

    @patch("report_content.check_user_access")
    def test_invalid_reason(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from report_content import handler

        event = make_event(arguments={
            "input": {
                "contentType": "quest",
                "contentId": "id-123",
                "reason": "not_a_valid_reason",
            }
        })

        with pytest.raises(Exception, match="reason"):
            handler(event, None)

    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_report_without_details(self, mock_users, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_users.get_item.return_value = {}

        from report_content import handler

        event = make_event(arguments={
            "input": {
                "contentType": "review",
                "contentId": "review-456",
                "reason": "offensive",
            }
        })
        result = handler(event, None)

        assert result["contentType"] == "review"
        assert result["details"] is None


# ---- approve_quest tests ----


class TestApproveQuest:
    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    @patch("approve_quest.users_table")
    def test_approve_success(self, mock_users, mock_quests, mock_auth):
        mock_auth.return_value = True
        mock_quests.get_item.return_value = {
            "Item": {
                "id": "quest-1",
                "title": "Test Quest",
                "isPublished": False,
                "isCommunityQuest": True,
                "createdBy": "user-1",
                "stages": [],
                "createdAt": "2026-01-01T00:00:00+00:00",
                "updatedAt": "2026-01-01T00:00:00+00:00",
            }
        }

        from approve_quest import handler

        event = make_admin_event(arguments={
            "questId": "quest-1",
            "approved": True,
        })
        result = handler(event, None)

        assert result["isPublished"] is True
        assert "approvedAt" in result
        mock_quests.update_item.assert_called_once()
        # Notification sent to creator
        mock_users.put_item.assert_called_once()

    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    @patch("approve_quest.users_table")
    def test_reject_with_reason(self, mock_users, mock_quests, mock_auth):
        mock_auth.return_value = True
        mock_quests.get_item.return_value = {
            "Item": {
                "id": "quest-2",
                "title": "Bad Quest",
                "isPublished": False,
                "isCommunityQuest": True,
                "createdBy": "user-2",
                "stages": [],
                "createdAt": "2026-01-01T00:00:00+00:00",
                "updatedAt": "2026-01-01T00:00:00+00:00",
            }
        }

        from approve_quest import handler

        event = make_admin_event(arguments={
            "questId": "quest-2",
            "approved": False,
            "rejectionReason": "Content does not meet quality standards",
        })
        result = handler(event, None)

        assert "rejectedAt" in result
        assert result["rejectionReason"] == "Content does not meet quality standards"
        mock_quests.update_item.assert_called_once()

    @patch("approve_quest.check_admin_access")
    @patch("approve_quest.quests_table")
    def test_quest_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = True
        mock_quests.get_item.return_value = {}

        from approve_quest import handler

        event = make_admin_event(arguments={
            "questId": "nonexistent",
            "approved": True,
        })

        with pytest.raises(Exception, match="Quest not found"):
            handler(event, None)

    @patch("approve_quest.check_admin_access")
    def test_non_admin_rejected(self, mock_auth):
        mock_auth.side_effect = PermissionError("Admin access required")

        from approve_quest import handler

        event = make_event(arguments={
            "questId": "quest-1",
            "approved": True,
        })

        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)


# ---- list_pending_quests tests ----


class TestListPendingQuests:
    @patch("list_pending_quests.check_admin_access")
    @patch("list_pending_quests.quests_table")
    def test_returns_only_pending_community_quests(self, mock_quests, mock_auth):
        mock_auth.return_value = True
        mock_quests.scan.return_value = {
            "Items": [
                {
                    "id": "q1",
                    "title": "Pending Community",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdAt": "2026-01-02T00:00:00+00:00",
                },
                {
                    "id": "q2",
                    "title": "Another Pending",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdAt": "2026-01-01T00:00:00+00:00",
                },
            ]
        }

        from list_pending_quests import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result["items"]) == 2
        # Sorted by date descending
        assert result["items"][0]["id"] == "q1"
        assert result["items"][1]["id"] == "q2"

    @patch("list_pending_quests.check_admin_access")
    def test_non_admin_rejected(self, mock_auth):
        mock_auth.side_effect = PermissionError("Admin access required")

        from list_pending_quests import handler

        event = make_event(arguments={})

        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)


# ---- list_content_reports tests ----


class TestListContentReports:
    @patch("list_content_reports.check_admin_access")
    @patch("list_content_reports.users_table")
    def test_filters_by_status(self, mock_users, mock_auth):
        mock_auth.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {
                    "userId": "report#abc-123",
                    "reporterId": "user-1",
                    "contentType": "quest",
                    "contentId": "q1",
                    "reason": "spam",
                    "status": "pending",
                    "createdAt": "2026-01-01T00:00:00+00:00",
                },
                {
                    "userId": "report#def-456",
                    "reporterId": "user-2",
                    "contentType": "review",
                    "contentId": "r1",
                    "reason": "offensive",
                    "status": "resolved",
                    "createdAt": "2026-01-02T00:00:00+00:00",
                },
                {
                    "userId": "regular-user-id",
                    "email": "test@test.com",
                    "status": "active",
                },
                {
                    "userId": "report#user-1#quest#q1",
                    "reportId": "abc-123",
                    "status": "pending",
                },
            ]
        }

        from list_content_reports import handler

        # Filter for pending only
        event = make_admin_event(arguments={"status": "pending"})
        result = handler(event, None)

        assert len(result) == 1
        assert result[0]["id"] == "abc-123"
        assert result[0]["status"] == "pending"

    @patch("list_content_reports.check_admin_access")
    @patch("list_content_reports.users_table")
    def test_returns_all_reports_without_filter(self, mock_users, mock_auth):
        mock_auth.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {
                    "userId": "report#abc-123",
                    "reporterId": "user-1",
                    "contentType": "quest",
                    "contentId": "q1",
                    "reason": "spam",
                    "status": "pending",
                    "createdAt": "2026-01-02T00:00:00+00:00",
                },
                {
                    "userId": "report#def-456",
                    "reporterId": "user-2",
                    "contentType": "review",
                    "contentId": "r1",
                    "reason": "offensive",
                    "status": "resolved",
                    "createdAt": "2026-01-01T00:00:00+00:00",
                },
            ]
        }

        from list_content_reports import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result) == 2
        # Sorted by date descending
        assert result[0]["id"] == "abc-123"
