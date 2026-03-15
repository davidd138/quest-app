"""Comprehensive tests for get_quest_ratings resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


class TestGetQuestRatingsComprehensive:
    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_single_rating(self, mock_scores, mock_auth):
        """A quest with one rating should return correct stats."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#user-1", "rating": Decimal("5")},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["averageRating"] == 5.0
        assert result["totalRatings"] == 1
        assert result["distribution"] == [0, 0, 0, 0, 1]

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_multiple_ratings_average(self, mock_scores, mock_auth):
        """Average should be calculated correctly from multiple ratings."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("3")},
                {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("4")},
                {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u4", "rating": Decimal("3")},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["averageRating"] == 3.75  # (3+4+5+3)/4
        assert result["totalRatings"] == 4

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_distribution_accuracy(self, mock_scores, mock_auth):
        """Distribution should count each star level correctly."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("1")},
                {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("1")},
                {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("2")},
                {"id": f"rating#{VALID_UUID}#u4", "rating": Decimal("3")},
                {"id": f"rating#{VALID_UUID}#u5", "rating": Decimal("3")},
                {"id": f"rating#{VALID_UUID}#u6", "rating": Decimal("3")},
                {"id": f"rating#{VALID_UUID}#u7", "rating": Decimal("4")},
                {"id": f"rating#{VALID_UUID}#u8", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u9", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u10", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u11", "rating": Decimal("5")},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        # [1-star, 2-star, 3-star, 4-star, 5-star]
        assert result["distribution"] == [2, 1, 3, 1, 4]
        assert result["totalRatings"] == 11

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_empty_ratings(self, mock_scores, mock_auth):
        """A quest with no ratings should return zeros."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {"Items": []}

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["averageRating"] == 0.0
        assert result["totalRatings"] == 0
        assert result["distribution"] == [0, 0, 0, 0, 0]

    @patch("get_quest_ratings.check_user_access")
    def test_invalid_quest_id(self, mock_auth):
        """Non-UUID questId should raise validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest_ratings import handler

        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"questId": "bad-id"}), None)

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_large_number_of_ratings(self, mock_scores, mock_auth):
        """Should handle a large number of ratings correctly."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        # Generate 100 ratings: 20 each of 1-5
        items = []
        for star in range(1, 6):
            for i in range(20):
                items.append({
                    "id": f"rating#{VALID_UUID}#user-{star}-{i}",
                    "rating": Decimal(str(star)),
                })

        mock_scores.scan.return_value = {"Items": items}

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalRatings"] == 100
        assert result["averageRating"] == 3.0  # (1*20 + 2*20 + 3*20 + 4*20 + 5*20) / 100 = 300/100
        assert result["distribution"] == [20, 20, 20, 20, 20]

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_all_5_star_ratings(self, mock_scores, mock_auth):
        """All 5-star ratings should yield avg of 5.0."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("5")},
                {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("5")},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["averageRating"] == 5.0
        assert result["distribution"] == [0, 0, 0, 0, 3]

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_all_1_star_ratings(self, mock_scores, mock_auth):
        """All 1-star ratings should yield avg of 1.0."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("1")},
                {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("1")},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["averageRating"] == 1.0
        assert result["distribution"] == [2, 0, 0, 0, 0]

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_pagination_multiple_scan_pages(self, mock_scores, mock_auth):
        """Should handle paginated scan results."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        mock_scores.scan.side_effect = [
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("3")},
                    {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("4")},
                ],
                "LastEvaluatedKey": {"id": "some-key"},
            },
            {
                "Items": [
                    {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("5")},
                    {"id": f"rating#{VALID_UUID}#u4", "rating": Decimal("2")},
                ],
            },
        ]

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalRatings"] == 4
        assert result["averageRating"] == 3.5  # (3+4+5+2)/4

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_items_without_rating_field_ignored(self, mock_scores, mock_auth):
        """Items without a rating field should be skipped."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("4")},
                {"id": f"rating#{VALID_UUID}#u2"},  # No rating field
                {"id": f"rating#{VALID_UUID}#u3", "rating": None},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["totalRatings"] == 1
        assert result["averageRating"] == 4.0

    def test_user_access_denied(self):
        """Non-active users should be rejected."""
        from get_quest_ratings import handler

        with patch("get_quest_ratings.check_user_access") as mock_auth:
            mock_auth.side_effect = PermissionError("Account is suspended")
            with pytest.raises(PermissionError, match="suspended"):
                handler(make_event(arguments={"questId": VALID_UUID}), None)

    @patch("get_quest_ratings.check_user_access")
    @patch("get_quest_ratings.scores_table")
    def test_average_rounding(self, mock_scores, mock_auth):
        """Average should be rounded to 2 decimal places."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {"id": f"rating#{VALID_UUID}#u1", "rating": Decimal("1")},
                {"id": f"rating#{VALID_UUID}#u2", "rating": Decimal("2")},
                {"id": f"rating#{VALID_UUID}#u3", "rating": Decimal("3")},
            ]
        }

        from get_quest_ratings import handler

        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["averageRating"] == 2.0  # (1+2+3)/3 = 2.0

    @patch("get_quest_ratings.check_user_access")
    def test_empty_quest_id(self, mock_auth):
        """Empty questId should raise validation error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest_ratings import handler

        with pytest.raises(Exception, match="must be a non-empty string"):
            handler(make_event(arguments={"questId": ""}), None)
