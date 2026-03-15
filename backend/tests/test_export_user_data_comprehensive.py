"""Comprehensive tests for export_user_data resolver."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock, call
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

USER_ID = "user-export-comp-123"
USERNAME = "exportuser@example.com"


def make_event(user_id=USER_ID, username=USERNAME):
    return {
        "identity": {"sub": user_id, "username": username, "claims": {}},
        "request": {"headers": {"x-forwarded-for": "10.0.0.1"}},
    }


# ── Exports from all 5 tables ────────────────────────────────────────


class TestExportsFromAllTables:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_all_tables_queried(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "email": "test@test.com"}}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": [{"id": "p1", "userId": USER_ID}]}
        mock_convs.query.return_value = {"Items": [{"id": "c1", "userId": USER_ID}]}
        mock_scores.query.return_value = {"Items": [{"id": "s1", "userId": USER_ID}]}
        mock_ach.query.return_value = {"Items": [{"id": "a1", "userId": USER_ID}]}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert result["user"]["userId"] == USER_ID
        assert len(result["progress"]) == 1
        assert len(result["conversations"]) == 1
        assert len(result["scores"]) == 1
        assert len(result["achievements"]) == 1
        assert "exportedAt" in result

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_multiple_items_per_table(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": [{"id": f"p{i}"} for i in range(5)]}
        mock_convs.query.return_value = {"Items": [{"id": f"c{i}"} for i in range(3)]}
        mock_scores.query.return_value = {"Items": [{"id": f"s{i}"} for i in range(7)]}
        mock_ach.query.return_value = {"Items": [{"id": f"a{i}"} for i in range(2)]}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert len(result["progress"]) == 5
        assert len(result["conversations"]) == 3
        assert len(result["scores"]) == 7
        assert len(result["achievements"]) == 2


# ── Empty tables return empty lists ───────────────────────────────────


class TestEmptyTablesReturnEmptyLists:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_all_empty(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert result["progress"] == []
        assert result["conversations"] == []
        assert result["scores"] == []
        assert result["achievements"] == []

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_some_empty_some_not(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": [{"id": "p1"}]}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": [{"id": "s1"}, {"id": "s2"}]}
        mock_ach.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert len(result["progress"]) == 1
        assert result["conversations"] == []
        assert len(result["scores"]) == 2
        assert result["achievements"] == []


# ── Decimal conversion works ──────────────────────────────────────────


class TestDecimalConversion:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_integer_decimals_converted_to_int(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID, "totalPoints": Decimal("1500")}}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": [{"id": "p1", "completedStages": Decimal("3")}]}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": [{"id": "s1", "score": Decimal("85")}]}
        mock_ach.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert result["user"]["totalPoints"] == 1500
        assert isinstance(result["user"]["totalPoints"], int)
        assert result["progress"][0]["completedStages"] == 3
        assert isinstance(result["progress"][0]["completedStages"], int)
        assert result["scores"][0]["score"] == 85

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_nested_decimals_converted(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "stats": {"points": Decimal("100"), "level": Decimal("5")},
                "badges": [{"count": Decimal("3")}],
            }
        }
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert result["user"]["stats"]["points"] == 100
        assert isinstance(result["user"]["stats"]["points"], int)
        assert result["user"]["badges"][0]["count"] == 3


# ── Updates lastDataExportAt audit field ──────────────────────────────


class TestAuditField:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_audit_field_updated(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}

        from export_user_data import handler
        handler(make_event(), None)

        mock_users.update_item.assert_called_once()
        call_kwargs = mock_users.update_item.call_args[1]
        assert call_kwargs["Key"] == {"userId": USER_ID}
        assert "lastDataExportAt" in call_kwargs["UpdateExpression"]
        assert ":ts" in call_kwargs["ExpressionAttributeValues"]


# ── User not found returns empty data ─────────────────────────────────


class TestUserNotFound:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_no_user_profile(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {}
        mock_users.update_item.return_value = {}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert result["user"] == {}
        assert "exportedAt" in result


# ── Large data sets handled ───────────────────────────────────────────


class TestLargeDataSets:
    @patch("export_user_data.check_user_access")
    @patch("export_user_data.users_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.achievements_table")
    def test_many_items_all_returned(self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_users.get_item.return_value = {"Item": {"userId": USER_ID}}
        mock_users.update_item.return_value = {}

        large_progress = [{"id": f"p{i}", "userId": USER_ID, "score": Decimal(str(i))} for i in range(100)]
        mock_prog.query.return_value = {"Items": large_progress}
        mock_convs.query.return_value = {"Items": [{"id": f"c{i}"} for i in range(50)]}
        mock_scores.query.return_value = {"Items": [{"id": f"s{i}"} for i in range(75)]}
        mock_ach.query.return_value = {"Items": [{"id": f"a{i}"} for i in range(20)]}

        from export_user_data import handler
        result = handler(make_event(), None)

        assert len(result["progress"]) == 100
        assert len(result["conversations"]) == 50
        assert len(result["scores"]) == 75
        assert len(result["achievements"]) == 20
        # Verify decimals converted in large set
        assert isinstance(result["progress"][50]["score"], int)
        assert result["progress"][50]["score"] == 50
