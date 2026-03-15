"""Comprehensive tests for list_all_users resolver."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="admin-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or ["admins"]},
        },
        "arguments": arguments or {},
    }


class TestListAllUsersComprehensive:
    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_returns_all_users(self, mock_users, mock_admin):
        """Should return all users from the table."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "a@test.com", "status": "active", "totalPoints": 100, "questsCompleted": 5, "groups": []},
                {"userId": "u2", "email": "b@test.com", "status": "active", "totalPoints": 200, "questsCompleted": 10, "groups": []},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        assert len(result["items"]) == 2
        assert result["items"][0]["userId"] == "u1"
        assert result["items"][1]["userId"] == "u2"

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_pagination_with_limit(self, mock_users, mock_admin):
        """Should respect the limit parameter."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "a@test.com", "status": "active"},
            ],
            "LastEvaluatedKey": {"userId": "u1"},
        }

        from list_all_users import handler

        result = handler(make_event(arguments={"limit": 1}), None)

        assert len(result["items"]) == 1
        assert "nextToken" in result
        # Verify limit was passed to scan
        call_kwargs = mock_users.scan.call_args
        assert call_kwargs[1].get("Limit") == 1 or call_kwargs[0] == () and call_kwargs[1].get("Limit") == 1

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_pagination_with_next_token(self, mock_users, mock_admin):
        """Should use nextToken for pagination."""
        mock_admin.return_value = True
        next_token = json.dumps({"userId": "u1"})
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u2", "email": "b@test.com", "status": "active"},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(arguments={"nextToken": next_token}), None)

        assert len(result["items"]) == 1
        assert result["items"][0]["userId"] == "u2"
        # Verify ExclusiveStartKey was passed
        call_kwargs = mock_users.scan.call_args
        assert "ExclusiveStartKey" in (call_kwargs[1] if call_kwargs[1] else {})

    @patch("list_all_users.check_admin_access")
    def test_non_admin_rejected(self, mock_admin):
        """Non-admin users should be rejected."""
        mock_admin.side_effect = PermissionError("Admin access required")

        from list_all_users import handler

        event = make_event(user_id="regular-user", groups=[])
        with pytest.raises(PermissionError, match="Admin access required"):
            handler(event, None)

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_empty_users_table(self, mock_users, mock_admin):
        """Empty users table should return an empty list."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {"Items": []}

        from list_all_users import handler

        result = handler(make_event(), None)

        assert result["items"] == []
        assert "nextToken" not in result

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_returns_correct_user_fields(self, mock_users, mock_admin):
        """Should return users with all expected fields and defaults."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {
                    "userId": "u1",
                    "email": "user@test.com",
                    "name": "Test User",
                    "role": "user",
                    "status": "active",
                    "totalPoints": 500,
                    "questsCompleted": 10,
                    "groups": ["users"],
                    "createdAt": "2025-01-01T00:00:00Z",
                },
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        user = result["items"][0]
        assert user["userId"] == "u1"
        assert user["email"] == "user@test.com"
        assert user["name"] == "Test User"
        assert user["status"] == "active"
        assert user["totalPoints"] == 500
        assert user["questsCompleted"] == 10
        assert user["groups"] == ["users"]

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_pending_users_sorted_first(self, mock_users, mock_admin):
        """Pending users should appear before active and other statuses."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "c@test.com", "status": "active"},
                {"userId": "u2", "email": "a@test.com", "status": "pending"},
                {"userId": "u3", "email": "b@test.com", "status": "suspended"},
                {"userId": "u4", "email": "d@test.com", "status": "pending"},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        statuses = [u["status"] for u in result["items"]]
        # Pending should be first
        assert statuses[0] == "pending"
        assert statuses[1] == "pending"
        assert statuses[2] == "active"
        assert statuses[3] == "suspended"

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_defaults_applied_for_missing_fields(self, mock_users, mock_admin):
        """Missing fields should get default values."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "user@test.com"},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        user = result["items"][0]
        assert user["status"] == "pending"
        assert user["totalPoints"] == 0
        assert user["questsCompleted"] == 0
        assert user["groups"] == []

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_no_next_token_when_no_more_pages(self, mock_users, mock_admin):
        """Result should not contain nextToken when there are no more pages."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "a@test.com", "status": "active"},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        assert "nextToken" not in result

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_next_token_present_when_more_pages(self, mock_users, mock_admin):
        """Result should contain nextToken when there are more pages."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "a@test.com", "status": "active"},
            ],
            "LastEvaluatedKey": {"userId": "u1"},
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        assert "nextToken" in result
        parsed = json.loads(result["nextToken"])
        assert parsed == {"userId": "u1"}

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_sorting_secondary_by_email(self, mock_users, mock_admin):
        """Within same status, users should be sorted by email."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "z@test.com", "status": "active"},
                {"userId": "u2", "email": "a@test.com", "status": "active"},
                {"userId": "u3", "email": "m@test.com", "status": "active"},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        emails = [u["email"] for u in result["items"]]
        assert emails == ["a@test.com", "m@test.com", "z@test.com"]

    @patch("list_all_users.check_admin_access")
    @patch("list_all_users.users_table")
    def test_expired_users_sorted_last(self, mock_users, mock_admin):
        """Expired users should appear after suspended users."""
        mock_admin.return_value = True
        mock_users.scan.return_value = {
            "Items": [
                {"userId": "u1", "email": "a@test.com", "status": "expired"},
                {"userId": "u2", "email": "a@test.com", "status": "active"},
                {"userId": "u3", "email": "a@test.com", "status": "suspended"},
                {"userId": "u4", "email": "a@test.com", "status": "pending"},
            ]
        }

        from list_all_users import handler

        result = handler(make_event(), None)

        statuses = [u["status"] for u in result["items"]]
        assert statuses == ["pending", "active", "suspended", "expired"]
