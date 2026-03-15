"""Tests for rating resolvers: rate_quest and get_quest_ratings."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", arguments=None, groups=None):
    """Build a mock AppSync event."""
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


# ── rate_quest ────────────────────────────────────────────────────────

class TestRateQuest:
    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_create_new_rating(self, mock_scores, mock_quests, mock_auth):
        """Creating a rating for the first time should succeed."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "title": "Quest"}}

        from rate_quest import handler
        event = make_event(arguments={"questId": VALID_UUID, "rating": 4})
        result = handler(event, None)

        assert result["rating"] == 4
        assert result["questId"] == VALID_UUID
        assert result["userId"] == "user-1"
        assert result["id"] == f"rating#{VALID_UUID}#user-1"
        mock_scores.put_item.assert_called_once()

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_update_existing_rating(self, mock_scores, mock_quests, mock_auth):
        """Rating again by the same user should overwrite (put_item upserts)."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "title": "Quest"}}

        from rate_quest import handler

        # First rating
        event = make_event(arguments={"questId": VALID_UUID, "rating": 3})
        handler(event, None)

        # Updated rating
        event = make_event(arguments={"questId": VALID_UUID, "rating": 5})
        result = handler(event, None)

        assert result["rating"] == 5
        assert mock_scores.put_item.call_count == 2

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    @patch("rate_quest.scores_table")
    def test_create_rating_with_review(self, mock_scores, mock_quests, mock_auth):
        """A rating with a review should include the review in the result."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "title": "Quest"}}

        from rate_quest import handler
        event = make_event(arguments={"questId": VALID_UUID, "rating": 5, "review": "Amazing quest!"})
        result = handler(event, None)

        assert result["review"] == "Amazing quest!"
        assert result["rating"] == 5

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_invalid_rating_value_too_low(self, mock_quests, mock_auth):
        """Rating below 1 should raise a ValidationError."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler
        event = make_event(arguments={"questId": VALID_UUID, "rating": 0})
        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(event, None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_invalid_rating_value_too_high(self, mock_quests, mock_auth):
        """Rating above 5 should raise a ValidationError."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler
        event = make_event(arguments={"questId": VALID_UUID, "rating": 6})
        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(event, None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_invalid_rating_value_non_integer(self, mock_quests, mock_auth):
        """Non-integer rating should raise a ValidationError."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID}}

        from rate_quest import handler
        event = make_event(arguments={"questId": VALID_UUID, "rating": "four"})
        with pytest.raises(Exception, match="rating must be an integer between 1 and 5"):
            handler(event, None)

    @patch("rate_quest.check_user_access")
    @patch("rate_quest.quests_table")
    def test_quest_not_found(self, mock_quests, mock_auth):
        """Rating a non-existent quest should raise ValueError."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {}

        from rate_quest import handler
        event = make_event(arguments={"questId": VALID_UUID, "rating": 3})
        with pytest.raises(ValueError, match="Quest not found"):
            handler(event, None)

    @patch("rate_quest.check_user_access")
    def test_invalid_quest_id(self, mock_auth):
        """Non-UUID questId should raise a validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from rate_quest import handler
        event = make_event(arguments={"questId": "bad-id", "rating": 3})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)


# ── get_quest_ratings ─────────────────────────────────────────────────

class TestGetQuestRatings:
    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_empty_ratings(self, mock_scores, mock_auth):
        """A quest with no ratings should return zeros."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {"Items": []}

        from get_quest_ratings import handler
        event = make_event(arguments={"questId": VALID_UUID})
        result = handler(event, None)

        assert result["averageRating"] == 0.0
        assert result["totalRatings"] == 0
        assert result["distribution"] == [0, 0, 0, 0, 0]

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_single_rating(self, mock_scores, mock_auth):
        """A single rating should be reflected correctly."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#user-1", "rating": Decimal("4")},
            ]
        }

        from get_quest_ratings import handler
        event = make_event(arguments={"questId": VALID_UUID})
        result = handler(event, None)

        assert result["averageRating"] == 4.0
        assert result["totalRatings"] == 1
        assert result["distribution"] == [0, 0, 0, 1, 0]

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_multiple_ratings_calculation(self, mock_scores, mock_auth):
        """Multiple ratings should produce correct average and total."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#user-1", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#user-2", "rating": Decimal("3")},
                {"id": f"rating#{VALID_UUID}#user-3", "rating": Decimal("4")},
                {"id": f"rating#{VALID_UUID}#user-4", "rating": Decimal("4")},
            ]
        }

        from get_quest_ratings import handler
        event = make_event(arguments={"questId": VALID_UUID})
        result = handler(event, None)

        assert result["totalRatings"] == 4
        assert result["averageRating"] == 4.0  # (5+3+4+4)/4 = 4.0

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_distribution_accuracy(self, mock_scores, mock_auth):
        """Distribution array should correctly count each star level."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("1")},
                {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("2")},
                {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("2")},
                {"id": f"rating#{VALID_UUID}#u4", "rating": Decimal("3")},
                {"id": f"rating#{VALID_UUID}#u5", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u6", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u7", "rating": Decimal("5")},
            ]
        }

        from get_quest_ratings import handler
        event = make_event(arguments={"questId": VALID_UUID})
        result = handler(event, None)

        # [1-star, 2-star, 3-star, 4-star, 5-star]
        assert result["distribution"] == [1, 2, 1, 0, 3]
        assert result["totalRatings"] == 7
        expected_avg = round((1 + 2 + 2 + 3 + 5 + 5 + 5) / 7, 2)
        assert result["averageRating"] == expected_avg

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_pagination_handling(self, mock_scores, mock_auth):
        """Should handle paginated scan results correctly."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        # Simulate two pages of results
        mock_scores.scan.side_effect = [
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("4")},
                    {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("3")},
                ],
                "LastEvaluatedKey": {"id": "some-key"},
            },
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("5")},
                ],
            },
        ]

        from get_quest_ratings import handler
        event = make_event(arguments={"questId": VALID_UUID})
        result = handler(event, None)

        assert result["totalRatings"] == 3
        assert result["averageRating"] == 4.0

    @patch("get_quest_ratings.check_user_access")
    def test_invalid_quest_id(self, mock_auth):
        """Non-UUID questId should raise a validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest_ratings import handler
        event = make_event(arguments={"questId": "not-a-uuid"})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)
