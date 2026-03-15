"""Tests for get_user_profile resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="caller-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


class TestGetUserProfile:
    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_returns_public_fields(self, mock_table, mock_auth):
        """Should return name, avatar, totalPoints, questsCompleted, role, createdAt."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}
        mock_table.get_item.return_value = {
            "Item": {
                "userId": "target-user",
                "name": "Alice",
                "email": "alice@example.com",
                "avatarUrl": "https://img.example.com/alice.png",
                "totalPoints": Decimal("150"),
                "questsCompleted": Decimal("3"),
                "role": "user",
                "status": "active",
                "createdAt": "2025-01-01T00:00:00Z",
                "updatedAt": "2025-06-01T00:00:00Z",
            }
        }

        from get_user_profile import handler
        event = make_event(arguments={"userId": "target-user"})
        result = handler(event, None)

        assert result["userId"] == "target-user"
        assert result["name"] == "Alice"
        assert result["avatarUrl"] == "https://img.example.com/alice.png"
        assert result["totalPoints"] == 150
        assert result["questsCompleted"] == 3
        assert result["role"] == "user"
        assert result["createdAt"] == "2025-01-01T00:00:00Z"

    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_hides_email(self, mock_table, mock_auth):
        """Email should not be in the returned profile."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}
        mock_table.get_item.return_value = {
            "Item": {
                "userId": "target-user",
                "name": "Bob",
                "email": "bob@secret.com",
                "totalPoints": Decimal("0"),
                "questsCompleted": Decimal("0"),
                "role": "user",
                "createdAt": "2025-01-01T00:00:00Z",
            }
        }

        from get_user_profile import handler
        event = make_event(arguments={"userId": "target-user"})
        result = handler(event, None)

        assert "email" not in result

    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_user_not_found(self, mock_table, mock_auth):
        """Should raise when target userId does not exist."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}
        mock_table.get_item.return_value = {}

        from get_user_profile import handler
        event = make_event(arguments={"userId": "nonexistent-user"})
        with pytest.raises(Exception, match="User not found"):
            handler(event, None)

    @patch("get_user_profile.check_user_access")
    def test_invalid_user_id_empty(self, mock_auth):
        """Empty userId should raise an error."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}

        from get_user_profile import handler
        event = make_event(arguments={"userId": ""})
        with pytest.raises(Exception, match="userId is required"):
            handler(event, None)

    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_returns_correct_fields_for_admin_user(self, mock_table, mock_auth):
        """Admin users should still only get public profile fields."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}
        mock_table.get_item.return_value = {
            "Item": {
                "userId": "admin-user",
                "name": "Admin Jane",
                "email": "admin@example.com",
                "avatarUrl": "https://img.example.com/admin.png",
                "totalPoints": Decimal("999"),
                "questsCompleted": Decimal("50"),
                "role": "admin",
                "status": "active",
                "createdAt": "2024-06-01T00:00:00Z",
                "updatedAt": "2025-01-01T00:00:00Z",
            }
        }

        from get_user_profile import handler
        event = make_event(arguments={"userId": "admin-user"})
        result = handler(event, None)

        assert result["role"] == "admin"
        assert result["totalPoints"] == 999
        assert result["questsCompleted"] == 50
        assert result["name"] == "Admin Jane"
        assert "email" not in result
        assert "status" not in result
        assert "updatedAt" not in result

    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_missing_optional_fields_default(self, mock_table, mock_auth):
        """Missing optional fields should default gracefully."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}
        mock_table.get_item.return_value = {
            "Item": {
                "userId": "minimal-user",
                "role": "user",
                "createdAt": "2025-03-01T00:00:00Z",
            }
        }

        from get_user_profile import handler
        event = make_event(arguments={"userId": "minimal-user"})
        result = handler(event, None)

        assert result["userId"] == "minimal-user"
        assert result["name"] is None
        assert result["avatarUrl"] is None
        assert result["totalPoints"] == 0
        assert result["questsCompleted"] == 0

    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_decimal_points_converted_to_int(self, mock_table, mock_auth):
        """Decimal values from DynamoDB should be converted to int."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}
        mock_table.get_item.return_value = {
            "Item": {
                "userId": "user-decimal",
                "totalPoints": Decimal("42"),
                "questsCompleted": Decimal("7"),
                "role": "user",
                "createdAt": "2025-01-01T00:00:00Z",
            }
        }

        from get_user_profile import handler
        event = make_event(arguments={"userId": "user-decimal"})
        result = handler(event, None)

        assert isinstance(result["totalPoints"], int)
        assert isinstance(result["questsCompleted"], int)
        assert result["totalPoints"] == 42
        assert result["questsCompleted"] == 7

    @patch("get_user_profile.check_user_access")
    def test_caller_access_checked(self, mock_auth):
        """check_user_access should be called with caller's userId, not target."""
        mock_auth.side_effect = PermissionError("Account is suspended")

        from get_user_profile import handler
        event = make_event(user_id="suspended-caller", arguments={"userId": "target"})
        with pytest.raises(PermissionError, match="suspended"):
            handler(event, None)

        mock_auth.assert_called_once_with("suspended-caller")

    @patch("get_user_profile.check_user_access")
    @patch("get_user_profile.users_table")
    def test_no_userId_argument(self, mock_table, mock_auth):
        """Missing userId argument should raise an error."""
        mock_auth.return_value = {"userId": "caller-1", "status": "active"}

        from get_user_profile import handler
        event = make_event(arguments={})
        with pytest.raises(Exception, match="userId is required"):
            handler(event, None)
