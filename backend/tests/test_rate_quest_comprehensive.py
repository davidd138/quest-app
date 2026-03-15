"""Comprehensive tests for rate_quest resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


class TestRateQuestComprehensive:
    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_creates_new_rating(self, mock_scores, mock_quests, mock_auth):
        """Should create a new rating successfully."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "title": "Quest"}}

        from rate_quest import handler

        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 4}), None)

        assert result["rating"] == 4
        assert result["questId"] == VALID_UUID
        assert result["userId"] == "user-1"
        mock_scores.put_item.assert_called_once()

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_updates_existing_rating(self, mock_scores, mock_quests, mock_auth):
        """Rating again should overwrite the previous rating."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "title": "Quest"}}

        from rate_quest import handler

        handler(make_event(arguments={"questId": VALID_UUID, "rating": 3}), None)
        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 5}), None)

        assert result["rating"] == 5
        assert mock_scores.put_item.call_count == 2

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_rating_1_accepted(self, mock_scores, mock_quests, mock_auth):
        """Rating of 1 (minimum) should be accepted."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 1}), None)

        assert result["rating"] == 1

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_rating_5_accepted(self, mock_scores, mock_quests, mock_auth):
        """Rating of 5 (maximum) should be accepted."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 5}), None)

        assert result["rating"] == 5

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_below_1_rejected(self, mock_quests, mock_auth):
        """Rating below 1 should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(make_event(arguments={"questId": VALID_UUID, "rating": 0}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_above_5_rejected(self, mock_quests, mock_auth):
        """Rating above 5 should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(make_event(arguments={"questId": VALID_UUID, "rating": 6}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_float_rating_rejected(self, mock_quests, mock_auth):
        """Float rating should be rejected (must be integer)."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(make_event(arguments={"questId": VALID_UUID, "rating": 3.5}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_quest_not_found(self, mock_quests, mock_auth):
        """Rating a non-existent quest should raise ValueError."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {}

        from rate_quest import handler

        with pytest.raises(ValueError, match="Quest not found"):
            handler(make_event(arguments={"questId": VALID_UUID, "rating": 3}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_review_text_saved(self, mock_scores, mock_quests, mock_auth):
        """Review text should be saved with the rating."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        result = handler(
            make_event(arguments={"questId": VALID_UUID, "rating": 5, "review": "Great quest!"}),
            None,
        )

        assert result["review"] == "Great quest!"
        # Verify the item saved to DynamoDB contains the review
        put_call = mock_scores.put_item.call_args
        saved_item = put_call[1]["Item"] if "Item" in (put_call[1] or {}) else put_call[0][0] if put_call[0] else put_call[1].get("Item")
        assert saved_item["review"] == "Great quest!"

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_review_max_length_enforced(self, mock_quests, mock_auth):
        """Review exceeding max length should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        long_review = "A" * 501  # max_length=500
        with pytest.raises(Exception, match="at most 500 characters"):
            handler(
                make_event(arguments={"questId": VALID_UUID, "rating": 4, "review": long_review}),
                None,
            )

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_review_optional(self, mock_scores, mock_quests, mock_auth):
        """Rating without review should succeed and return review as None."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 3}), None)

        assert result["review"] is None

    @patch("rate_quest.check_user_access")
    def test_invalid_quest_id_format(self, mock_auth):
        """Non-UUID questId should raise validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from rate_quest import handler

        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"questId": "bad", "rating": 3}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_negative_rating_rejected(self, mock_quests, mock_auth):
        """Negative rating should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(make_event(arguments={"questId": VALID_UUID, "rating": -1}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_string_rating_rejected(self, mock_quests, mock_auth):
        """String rating should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(make_event(arguments={"questId": VALID_UUID, "rating": "five"}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_rating_id_format(self, mock_scores, mock_quests, mock_auth):
        """Rating ID should follow the pattern rating#{questId}#{userId}."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 4}), None)

        assert result["id"] == f"rating#{VALID_UUID}#user-1"

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_created_at_included(self, mock_scores, mock_quests, mock_auth):
        """Result should include a createdAt timestamp."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        result = handler(make_event(arguments={"questId": VALID_UUID, "rating": 4}), None)

        assert "createdAt" in result
        assert len(result["createdAt"]) > 0

    def test_user_access_denied(self):
        """Non-active users should be rejected."""
        from rate_quest import handler

        with patch("rate_quest.check_user_access") as mock_auth:
            mock_auth.side_effect = PermissionError("Account is pending approval")
            with pytest.raises(PermissionError, match="pending"):
                handler(make_event(arguments={"questId": VALID_UUID, "rating": 4}), None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_review_at_max_length_accepted(self, mock_scores, mock_quests, mock_auth):
        """Review exactly at max length (500) should be accepted."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler

        review = "A" * 500
        result = handler(
            make_event(arguments={"questId": VALID_UUID, "rating": 4, "review": review}),
            None,
        )

        assert len(result["review"]) == 500
