"""Tests for search_quests resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
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


def make_quest(id="q1", title="Mountain Adventure", description="Explore the mountains",
               category="adventure", difficulty="medium", tags=None, is_published=True):
    return {
        "id": id,
        "title": title,
        "titleLower": title.lower(),
        "description": description,
        "descriptionLower": description.lower(),
        "category": category,
        "difficulty": difficulty,
        "tags": tags or ["hiking", "nature"],
        "tagsLower": " ".join(t.lower() for t in (tags or ["hiking", "nature"])),
        "isPublished": is_published,
    }


class TestSearchQuests:
    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_title_match(self, mock_quests, mock_auth):
        """Quests matching query in title should be returned."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        quest = make_quest(title="Mountain Adventure")
        mock_quests.scan.return_value = {"Items": [quest]}

        from search_quests import handler
        event = make_event(arguments={"query": "mountain"})
        result = handler(event, None)

        assert len(result["items"]) == 1
        assert result["items"][0]["title"] == "Mountain Adventure"

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_description_match(self, mock_quests, mock_auth):
        """Quests matching query in description should be returned."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        quest = make_quest(description="Explore hidden caves in the city")
        mock_quests.scan.return_value = {"Items": [quest]}

        from search_quests import handler
        event = make_event(arguments={"query": "caves"})
        result = handler(event, None)

        assert len(result["items"]) == 1

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_tag_match(self, mock_quests, mock_auth):
        """Quests matching query in tags should be returned."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        quest = make_quest(tags=["photography", "urban"])
        mock_quests.scan.return_value = {"Items": [quest]}

        from search_quests import handler
        event = make_event(arguments={"query": "photography"})
        result = handler(event, None)

        assert len(result["items"]) == 1

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_category_filter_combined(self, mock_quests, mock_auth):
        """Category filter should be applied in addition to text search."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {"Items": [
            make_quest(id="q1", title="Mountain Hike", category="nature"),
        ]}

        from search_quests import handler
        event = make_event(arguments={"query": "mountain", "category": "nature"})
        result = handler(event, None)

        # Verify category was passed to scan
        call_kwargs = mock_quests.scan.call_args
        filter_expr = call_kwargs[1].get("FilterExpression", "") if call_kwargs[1] else ""
        assert "#cat = :cat" in filter_expr

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_difficulty_filter(self, mock_quests, mock_auth):
        """Difficulty filter should be applied in addition to text search."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {"Items": [
            make_quest(id="q1", title="Hard Mountain", difficulty="hard"),
        ]}

        from search_quests import handler
        event = make_event(arguments={"query": "mountain", "difficulty": "hard"})
        result = handler(event, None)

        call_kwargs = mock_quests.scan.call_args
        filter_expr = call_kwargs[1].get("FilterExpression", "") if call_kwargs[1] else ""
        assert "#diff = :diff" in filter_expr

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_non_admin_only_published(self, mock_quests, mock_auth):
        """Non-admin users should only see published quests."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {"Items": []}

        from search_quests import handler
        event = make_event(arguments={"query": "test"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args
        filter_expr = call_kwargs[1].get("FilterExpression", "") if call_kwargs[1] else ""
        assert "#pub = :pub" in filter_expr

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_empty_results(self, mock_quests, mock_auth):
        """Empty scan should return empty items list."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        # First scan (indexed) returns nothing, fallback scan also returns nothing
        mock_quests.scan.side_effect = [
            {"Items": []},
            {"Items": []},
        ]

        from search_quests import handler
        event = make_event(arguments={"query": "nonexistent"})
        result = handler(event, None)

        assert result["items"] == []
        assert result["nextToken"] is None

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_case_insensitive_search(self, mock_quests, mock_auth):
        """Search should be case-insensitive."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        quest = make_quest(title="Mountain Adventure")
        mock_quests.scan.return_value = {"Items": [quest]}

        from search_quests import handler
        event = make_event(arguments={"query": "MOUNTAIN"})
        result = handler(event, None)

        # Verify query was lowercased in expression values
        call_kwargs = mock_quests.scan.call_args
        expr_values = call_kwargs[1].get("ExpressionAttributeValues", {})
        assert expr_values.get(":query") == "mountain"

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_pagination(self, mock_quests, mock_auth):
        """nextToken should be set when LastEvaluatedKey is present."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {
            "Items": [make_quest(id="q1")],
            "LastEvaluatedKey": {"id": "q1"},
        }

        from search_quests import handler
        event = make_event(arguments={"query": "mountain", "limit": 1})
        result = handler(event, None)

        assert result["nextToken"] == "q1"
        assert len(result["items"]) == 1

    @patch("search_quests.check_user_access")
    def test_empty_query_raises(self, mock_auth):
        """Empty query string should raise an error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}

        from search_quests import handler
        event = make_event(arguments={"query": ""})
        with pytest.raises(Exception, match="query is required"):
            handler(event, None)

    @patch("search_quests.check_user_access")
    def test_whitespace_only_query_raises(self, mock_auth):
        """Whitespace-only query should raise an error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}

        from search_quests import handler
        event = make_event(arguments={"query": "   "})
        with pytest.raises(Exception, match="query is required"):
            handler(event, None)

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_admin_sees_unpublished(self, mock_quests, mock_auth):
        """Admin users should not have the isPublished filter."""
        mock_auth.return_value = {"userId": "admin-1", "status": "active", "role": "admin"}
        mock_quests.scan.return_value = {"Items": []}

        from search_quests import handler
        event = make_event(user_id="admin-1", arguments={"query": "test"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args
        filter_expr = call_kwargs[1].get("FilterExpression", "")
        assert "#pub" not in filter_expr

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_limit_capped_at_100(self, mock_quests, mock_auth):
        """Limit should be capped at 100 even if higher is requested."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {"Items": []}

        from search_quests import handler
        event = make_event(arguments={"query": "test", "limit": 500})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args
        assert call_kwargs[1].get("Limit", 0) <= 100

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_default_limit_50(self, mock_quests, mock_auth):
        """Default limit should be 50 when not specified."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {"Items": [make_quest()]}

        from search_quests import handler
        event = make_event(arguments={"query": "mountain"})
        handler(event, None)

        # First scan call should use default limit of 50
        first_call_kwargs = mock_quests.scan.call_args_list[0][1]
        assert first_call_kwargs.get("Limit") == 50

    @patch("search_quests.check_user_access")
    @patch("search_quests.quests_table")
    def test_both_category_and_difficulty_filters(self, mock_quests, mock_auth):
        """Both category and difficulty filters should be applied simultaneously."""
        mock_auth.return_value = {"userId": "user-1", "status": "active", "role": "user"}
        mock_quests.scan.return_value = {"Items": []}

        from search_quests import handler
        event = make_event(arguments={"query": "test", "category": "nature", "difficulty": "hard"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args
        filter_expr = call_kwargs[1].get("FilterExpression", "")
        assert "#cat = :cat" in filter_expr
        assert "#diff = :diff" in filter_expr
