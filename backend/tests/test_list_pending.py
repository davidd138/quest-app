"""Tests for list_pending_quests and list_content_reports resolvers."""
import sys
import os
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
                    "title": "Pending Community Quest A",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdBy": "user-10",
                    "createdAt": "2026-02-15T10:00:00+00:00",
                },
                {
                    "id": "q2",
                    "title": "Pending Community Quest B",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdBy": "user-20",
                    "createdAt": "2026-02-14T08:00:00+00:00",
                },
            ]
        }

        from list_pending_quests import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result["items"]) == 2
        # Sorted by date descending (newest first)
        assert result["items"][0]["id"] == "q1"
        assert result["items"][1]["id"] == "q2"

    @patch("list_pending_quests.check_admin_access")
    def test_non_admin_rejected(self, mock_auth):
        mock_auth.side_effect = PermissionError("Admin access required")

        from list_pending_quests import handler

        event = make_event(arguments={})

        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)

    @patch("list_pending_quests.check_admin_access")
    @patch("list_pending_quests.quests_table")
    def test_empty_result_handling(self, mock_quests, mock_auth):
        mock_auth.return_value = True
        mock_quests.scan.return_value = {"Items": []}

        from list_pending_quests import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result["items"]) == 0

    @patch("list_pending_quests.check_admin_access")
    @patch("list_pending_quests.quests_table")
    def test_pagination_with_next_token(self, mock_quests, mock_auth):
        """Verify that if the scan returns a LastEvaluatedKey, it is passed through as nextToken."""
        mock_auth.return_value = True
        mock_quests.scan.return_value = {
            "Items": [
                {
                    "id": "q10",
                    "title": "First Page Quest",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdBy": "user-1",
                    "createdAt": "2026-03-01T00:00:00+00:00",
                },
            ],
            "LastEvaluatedKey": {"id": {"S": "q10"}},
        }

        from list_pending_quests import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result["items"]) == 1
        assert result["items"][0]["id"] == "q10"

    @patch("list_pending_quests.check_admin_access")
    @patch("list_pending_quests.quests_table")
    def test_multiple_pending_quests_sorted_by_date(self, mock_quests, mock_auth):
        mock_auth.return_value = True
        mock_quests.scan.return_value = {
            "Items": [
                {
                    "id": "q-old",
                    "title": "Old Quest",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdAt": "2026-01-01T00:00:00+00:00",
                },
                {
                    "id": "q-mid",
                    "title": "Mid Quest",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdAt": "2026-02-01T00:00:00+00:00",
                },
                {
                    "id": "q-new",
                    "title": "New Quest",
                    "isPublished": False,
                    "isCommunityQuest": True,
                    "createdAt": "2026-03-01T00:00:00+00:00",
                },
            ]
        }

        from list_pending_quests import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result["items"]) == 3
        assert result["items"][0]["id"] == "q-new"
        assert result["items"][1]["id"] == "q-mid"
        assert result["items"][2]["id"] == "q-old"


# ---- list_content_reports tests ----


class TestListContentReports:
    @patch("list_content_reports.check_admin_access")
    @patch("list_content_reports.users_table")
    def test_returns_only_pending_reports(self, mock_users, mock_auth):
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
                    "createdAt": "2026-01-15T10:00:00+00:00",
                },
                {
                    "userId": "report#def-456",
                    "reporterId": "user-2",
                    "contentType": "review",
                    "contentId": "r1",
                    "reason": "offensive",
                    "status": "resolved",
                    "createdAt": "2026-01-16T12:00:00+00:00",
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

        event = make_admin_event(arguments={"status": "pending"})
        result = handler(event, None)

        assert len(result) == 1
        assert result[0]["id"] == "abc-123"
        assert result[0]["status"] == "pending"

    @patch("list_content_reports.check_admin_access")
    def test_non_admin_rejected(self, mock_auth):
        mock_auth.side_effect = PermissionError("Admin access required")

        from list_content_reports import handler

        event = make_event(arguments={})

        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)

    @patch("list_content_reports.check_admin_access")
    @patch("list_content_reports.users_table")
    def test_empty_result_handling(self, mock_users, mock_auth):
        mock_auth.return_value = True
        mock_users.scan.return_value = {"Items": []}

        from list_content_reports import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result) == 0

    @patch("list_content_reports.check_admin_access")
    @patch("list_content_reports.users_table")
    def test_returns_all_reports_without_filter(self, mock_users, mock_auth):
        mock_auth.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {
                    "userId": "report#aaa-111",
                    "reporterId": "user-5",
                    "contentType": "quest",
                    "contentId": "q5",
                    "reason": "spam",
                    "status": "pending",
                    "createdAt": "2026-02-20T10:00:00+00:00",
                },
                {
                    "userId": "report#bbb-222",
                    "reporterId": "user-6",
                    "contentType": "review",
                    "contentId": "r6",
                    "reason": "offensive",
                    "status": "resolved",
                    "createdAt": "2026-02-18T08:00:00+00:00",
                },
            ]
        }

        from list_content_reports import handler

        event = make_admin_event(arguments={})
        result = handler(event, None)

        assert len(result) == 2
        # Sorted by date descending
        assert result[0]["id"] == "aaa-111"
        assert result[1]["id"] == "bbb-222"

    @patch("list_content_reports.check_admin_access")
    @patch("list_content_reports.users_table")
    def test_pagination_with_multiple_reports(self, mock_users, mock_auth):
        """Reports are sorted by createdAt descending regardless of scan order."""
        mock_auth.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {
                    "userId": "report#ccc-333",
                    "reporterId": "user-7",
                    "contentType": "quest",
                    "contentId": "q7",
                    "reason": "inappropriate",
                    "status": "pending",
                    "createdAt": "2026-03-01T00:00:00+00:00",
                },
                {
                    "userId": "report#ddd-444",
                    "reporterId": "user-8",
                    "contentType": "review",
                    "contentId": "r8",
                    "reason": "spam",
                    "status": "pending",
                    "createdAt": "2026-03-10T00:00:00+00:00",
                },
                {
                    "userId": "report#eee-555",
                    "reporterId": "user-9",
                    "contentType": "quest",
                    "contentId": "q9",
                    "reason": "offensive",
                    "status": "pending",
                    "createdAt": "2026-03-05T00:00:00+00:00",
                },
            ]
        }

        from list_content_reports import handler

        event = make_admin_event(arguments={"status": "pending"})
        result = handler(event, None)

        assert len(result) == 3
        # Newest first
        assert result[0]["id"] == "ddd-444"
        assert result[1]["id"] == "eee-555"
        assert result[2]["id"] == "ccc-333"
