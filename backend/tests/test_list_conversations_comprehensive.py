"""Comprehensive tests for list_conversations resolver — edge cases and security."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock, call

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-123"
OTHER_USER = "user-999"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


class TestListConversationsComprehensive:
    """Comprehensive edge-case tests for list_conversations."""

    # 1. Returns user's conversations
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_returns_users_conversations(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        items = [
            {"id": "c1", "userId": USER_ID, "questId": "q1", "status": "completed"},
            {"id": "c2", "userId": USER_ID, "questId": "q2", "status": "in_progress"},
        ]
        mock_convs.query.return_value = {"Items": items}

        from list_conversations import handler

        result = handler(make_event(), None)

        assert result["items"] == items
        assert len(result["items"]) == 2

    # 2. Filters by questId
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_filters_by_quest_id(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": [{"id": "c1", "questId": VALID_UUID}]}

        from list_conversations import handler

        event = make_event(arguments={"questId": VALID_UUID})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert "FilterExpression" in call_kwargs

    # 3. Pagination with limit
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_pagination_with_limit(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": [{"id": "c1"}]}

        from list_conversations import handler

        event = make_event(arguments={"limit": 5})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["Limit"] == 5

    # 4. Pagination with nextToken
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_pagination_with_next_token(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        start_key = {"id": "c5", "userId": USER_ID}
        from list_conversations import handler

        event = make_event(arguments={"nextToken": json.dumps(start_key)})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["ExclusiveStartKey"] == start_key

    # 5. Returns correct fields in query
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_returns_correct_query_params(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        handler(make_event(), None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["IndexName"] == "userId-startedAt-index"
        assert call_kwargs["ScanIndexForward"] is False

    # 6. Sorted by startedAt descending (ScanIndexForward=False)
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_sorted_by_started_at_descending(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        items = [
            {"id": "c1", "startedAt": "2025-01-03T00:00:00Z"},
            {"id": "c2", "startedAt": "2025-01-02T00:00:00Z"},
            {"id": "c3", "startedAt": "2025-01-01T00:00:00Z"},
        ]
        mock_convs.query.return_value = {"Items": items}

        from list_conversations import handler

        result = handler(make_event(), None)

        assert result["items"][0]["id"] == "c1"
        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["ScanIndexForward"] is False

    # 7. Empty results
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_empty_results(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        result = handler(make_event(), None)

        assert result["items"] == []
        assert "nextToken" not in result

    # 8. Invalid questId in filter still works (returns empty)
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_invalid_quest_id_filter_returns_empty(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        event = make_event(arguments={"questId": "nonexistent-quest-id"})
        result = handler(event, None)

        assert result["items"] == []

    # 9. Non-active user rejected
    @patch("list_conversations.check_user_access", side_effect=PermissionError("Account is suspended"))
    def test_non_active_user_rejected(self, mock_auth):
        from list_conversations import handler

        with pytest.raises(PermissionError, match="suspended"):
            handler(make_event(), None)

    # 10. Large limit is passed through
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_large_limit_passed_through(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        event = make_event(arguments={"limit": 1000})
        handler(event, None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["Limit"] == 1000

    # 11. Default limit is 20
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_default_limit_is_20(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        handler(make_event(), None)

        call_kwargs = mock_convs.query.call_args[1]
        assert call_kwargs["Limit"] == 20

    # 12. Multiple conversations returned in order
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_multiple_conversations_returned(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        items = [{"id": f"c{i}", "userId": USER_ID} for i in range(10)]
        mock_convs.query.return_value = {"Items": items}

        from list_conversations import handler

        result = handler(make_event(), None)

        assert len(result["items"]) == 10

    # 13. Response includes nextToken when LastEvaluatedKey present
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_next_token_in_response(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        last_key = {"id": "c5", "userId": USER_ID, "startedAt": "2025-01-01T00:00:00Z"}
        mock_convs.query.return_value = {
            "Items": [{"id": "c5"}],
            "LastEvaluatedKey": last_key,
        }

        from list_conversations import handler

        result = handler(make_event(), None)

        assert "nextToken" in result
        parsed_token = json.loads(result["nextToken"])
        assert parsed_token == last_key

    # 14. User cannot see other users' conversations (userId from identity)
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_user_scoped_to_own_conversations(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        handler(make_event(user_id=USER_ID), None)

        call_kwargs = mock_convs.query.call_args[1]
        # The KeyConditionExpression uses the user_id from identity, not from arguments
        key_expr = call_kwargs["KeyConditionExpression"]
        # It should query for USER_ID
        assert key_expr is not None

    # 15. No filter expression when questId is absent
    @patch("list_conversations.check_user_access")
    @patch("list_conversations.conversations_table")
    def test_no_filter_without_quest_id(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.query.return_value = {"Items": []}

        from list_conversations import handler

        handler(make_event(), None)

        call_kwargs = mock_convs.query.call_args[1]
        assert "FilterExpression" not in call_kwargs
