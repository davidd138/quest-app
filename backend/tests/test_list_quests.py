"""Comprehensive tests for list_quests resolver: filters, pagination, role-based access."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock, call

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


def make_admin_event(user_id="admin-1", arguments=None):
    return make_event(user_id=user_id, arguments=arguments, groups=["admins"])


class TestListQuestsCategoryFilter:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_single_category_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        items = [{"id": "q1", "category": "adventure"}]
        mock_quests.scan.return_value = {"Items": items}

        from list_quests import handler
        event = make_event(arguments={"category": "adventure"})
        result = handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":cat"] == "adventure"
        assert result["items"] == items

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_cultural_category_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"category": "cultural"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":cat"] == "cultural"

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_no_category_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        handler(make_event(), None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert ":cat" not in call_kwargs.get("ExpressionAttributeValues", {})


class TestListQuestsDifficultyFilter:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_easy_difficulty_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"difficulty": "easy"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":diff"] == "easy"

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_hard_difficulty_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"difficulty": "hard"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":diff"] == "hard"

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_legendary_difficulty_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"difficulty": "legendary"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":diff"] == "legendary"


class TestListQuestsCombinedFilters:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_category_and_difficulty_combined(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"category": "mystery", "difficulty": "hard"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        expr = call_kwargs["FilterExpression"]
        values = call_kwargs["ExpressionAttributeValues"]

        assert ":cat" in values
        assert ":diff" in values
        assert values[":cat"] == "mystery"
        assert values[":diff"] == "hard"
        assert "#cat = :cat" in expr
        assert "#diff = :diff" in expr
        # Non-admin should also have published filter
        assert ":pub" in values

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_all_filters_with_limit(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"category": "nature", "difficulty": "easy", "limit": 5})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["Limit"] == 5
        assert call_kwargs["ExpressionAttributeValues"][":cat"] == "nature"
        assert call_kwargs["ExpressionAttributeValues"][":diff"] == "easy"


class TestListQuestsRoleAccess:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_non_admin_only_sees_published(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        handler(make_event(), None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert "#pub = :pub" in call_kwargs["FilterExpression"]
        assert call_kwargs["ExpressionAttributeValues"][":pub"] is True

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_admin_sees_all(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "admin-1", "role": "admin", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        handler(make_event(user_id="admin-1"), None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert "FilterExpression" not in call_kwargs or ":pub" not in call_kwargs.get("ExpressionAttributeValues", {})

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_admin_with_filters_no_published_constraint(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "admin-1", "role": "admin", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(user_id="admin-1", arguments={"category": "adventure"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert ":pub" not in call_kwargs.get("ExpressionAttributeValues", {})
        assert ":cat" in call_kwargs["ExpressionAttributeValues"]


class TestListQuestsPagination:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_returns_next_token_from_last_evaluated_key(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {
            "Items": [{"id": "q1"}],
            "LastEvaluatedKey": {"id": "q1"},
        }

        from list_quests import handler
        result = handler(make_event(), None)

        assert result["nextToken"] == "q1"

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_passes_next_token_as_exclusive_start_key(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"nextToken": "abc-123"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExclusiveStartKey"] == {"id": "abc-123"}

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_null_next_token_when_no_more_pages(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": [{"id": "q1"}]}

        from list_quests import handler
        result = handler(make_event(), None)

        assert result["nextToken"] is None

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_custom_limit(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"limit": 25})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["Limit"] == 25

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_default_limit_is_50(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        handler(make_event(), None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["Limit"] == 50


class TestListQuestsEmptyResults:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_empty_items_list(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        result = handler(make_event(), None)

        assert result["items"] == []
        assert result["nextToken"] is None

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_empty_with_filters(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"category": "culinary", "difficulty": "legendary"})
        result = handler(event, None)

        assert result["items"] == []
        assert result["nextToken"] is None
