"""Comprehensive tests for report_content resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock, ANY
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


class TestReportContentComprehensive:
    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_creates_report_with_all_fields(self, mock_table, mock_auth):
        """Should create a report with all required fields populated."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.get_item.return_value = {}  # No duplicate

        from report_content import handler
        event = make_event(arguments={
            "input": {
                "contentType": "quest",
                "contentId": "quest-123",
                "reason": "inappropriate",
                "details": "This quest contains offensive language",
            }
        })
        result = handler(event, None)

        assert result["reporterId"] == "user-1"
        assert result["contentType"] == "quest"
        assert result["contentId"] == "quest-123"
        assert result["reason"] == "inappropriate"
        assert result["details"] == "This quest contains offensive language"
        assert result["status"] == "pending"
        assert "createdAt" in result
        assert "id" in result
        assert mock_table.put_item.call_count == 2  # report + duplicate key

    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_duplicate_prevention(self, mock_table, mock_auth):
        """Should prevent duplicate reports from the same user for the same content."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.get_item.return_value = {
            "Item": {
                "userId": "report#user-1#quest#quest-123",
                "status": "pending",
            }
        }

        from report_content import handler
        event = make_event(arguments={
            "input": {
                "contentType": "quest",
                "contentId": "quest-123",
                "reason": "inappropriate",
            }
        })
        with pytest.raises(Exception, match="already reported"):
            handler(event, None)

    @patch("report_content.check_user_access")
    def test_invalid_content_type(self, mock_auth):
        """Should reject invalid contentType."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from report_content import handler
        event = make_event(arguments={
            "input": {
                "contentType": "invalid_type",
                "contentId": "some-id",
                "reason": "spam",
            }
        })
        with pytest.raises(Exception, match="contentType must be one of"):
            handler(event, None)

    @patch("report_content.check_user_access")
    def test_invalid_reason(self, mock_auth):
        """Should reject invalid reason."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from report_content import handler
        event = make_event(arguments={
            "input": {
                "contentType": "quest",
                "contentId": "some-id",
                "reason": "invalid_reason",
            }
        })
        with pytest.raises(Exception, match="reason must be one of"):
            handler(event, None)

    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_user_access_check_called(self, mock_table, mock_auth):
        """check_user_access should be called with the caller's userId."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.get_item.return_value = {}

        from report_content import handler
        event = make_event(user_id="user-42", arguments={
            "input": {
                "contentType": "quest",
                "contentId": "quest-1",
                "reason": "spam",
            }
        })
        handler(event, None)

        mock_auth.assert_called_once_with("user-42")

    @patch("report_content.check_user_access")
    @patch("report_content.users_table")
    def test_report_timestamp_present(self, mock_table, mock_auth):
        """Report should include a createdAt timestamp."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_table.get_item.return_value = {}

        from report_content import handler
        event = make_event(arguments={
            "input": {
                "contentType": "review",
                "contentId": "review-1",
                "reason": "offensive",
            }
        })
        result = handler(event, None)

        assert "createdAt" in result
        assert "T" in result["createdAt"]  # ISO format check
