"""Comprehensive tests for the create_quest resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"


def make_admin_event(user_id="admin-1", arguments=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": ["admins"]},
        },
        "arguments": arguments or {},
    }


def make_user_event(user_id="user-1", arguments=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": []},
        },
        "arguments": arguments or {},
    }


def valid_input(**overrides):
    """Build a valid CreateQuestInput with optional overrides."""
    base = {
        "title": "Test Quest",
        "description": "A great adventure awaits",
        "category": "adventure",
        "difficulty": "easy",
        "estimatedDuration": 1800,
        "stages": [
            {
                "title": "Stage 1",
                "points": 100,
                "order": 1,
                "character": {"name": "Pedro", "role": "Merchant"},
                "challenge": {"type": "conversation", "description": "Talk to Pedro"},
            }
        ],
    }
    base.update(overrides)
    return base


class TestCreateQuestAllFields:
    """Tests that create_quest sets all required fields correctly."""

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_creates_with_all_required_fields(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={"input": valid_input()})
        result = handler(event, None)

        assert result["title"] == "Test Quest"
        assert result["description"] == "A great adventure awaits"
        assert result["category"] == "adventure"
        assert result["difficulty"] == "easy"
        assert result["estimatedDuration"] == 1800
        mock_quests.put_item.assert_called_once()

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_generates_quest_id(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={"input": valid_input()})
        result = handler(event, None)

        assert result["id"] is not None
        assert len(result["id"]) == 36  # UUID format

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_generates_stage_ids(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        stages = [
            {"title": "S1", "points": 50, "order": 1},
            {"title": "S2", "points": 75, "order": 2},
        ]
        event = make_admin_event(arguments={"input": valid_input(stages=stages)})
        result = handler(event, None)

        for stage in result["stages"]:
            assert "id" in stage
            assert len(stage["id"]) == 36

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_calculates_total_points_from_stages(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        stages = [
            {"title": "S1", "points": 100, "order": 1},
            {"title": "S2", "points": 200, "order": 2},
            {"title": "S3", "points": 150, "order": 3},
        ]
        event = make_admin_event(arguments={"input": valid_input(stages=stages)})
        result = handler(event, None)

        assert result["totalPoints"] == 450

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_sets_is_published_false_by_default(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={"input": valid_input()})
        result = handler(event, None)

        assert result["isPublished"] is False

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_sets_created_by_from_user(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(user_id="admin-42", arguments={"input": valid_input()})
        result = handler(event, None)

        assert result["createdBy"] == "admin-42"

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_sets_timestamps(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={"input": valid_input()})
        result = handler(event, None)

        assert "createdAt" in result
        assert "updatedAt" in result
        # Both should be valid ISO timestamps
        datetime.fromisoformat(result["createdAt"])
        datetime.fromisoformat(result["updatedAt"])
        # Should be approximately equal (same handler call)
        assert result["createdAt"] == result["updatedAt"]


class TestCreateQuestAccessControl:
    """Tests that non-admin users are rejected."""

    @patch("create_quest.check_admin_access")
    def test_non_admin_rejected(self, mock_admin):
        mock_admin.side_effect = Exception("Admin access required")

        from create_quest import handler
        event = make_user_event(arguments={"input": valid_input()})
        with pytest.raises(Exception, match="Admin access required"):
            handler(event, None)


class TestCreateQuestValidation:
    """Tests for input validation in create_quest."""

    @patch("create_quest.check_admin_access")
    def test_missing_title(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        inp = valid_input()
        del inp["title"]
        event = make_admin_event(arguments={"input": inp})
        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_missing_description(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        inp = valid_input()
        del inp["description"]
        event = make_admin_event(arguments={"input": inp})
        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_missing_category(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        inp = valid_input()
        del inp["category"]
        event = make_admin_event(arguments={"input": inp})
        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_missing_stages(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        inp = valid_input()
        del inp["stages"]
        event = make_admin_event(arguments={"input": inp})
        with pytest.raises(Exception, match="At least one stage"):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_empty_stages_list(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={"input": valid_input(stages=[])})
        with pytest.raises(Exception, match="At least one stage"):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_invalid_category_enum(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(
            arguments={"input": valid_input(category="invalid_category")}
        )
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_invalid_difficulty_enum(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(
            arguments={"input": valid_input(difficulty="impossible")}
        )
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_stage_preserves_character_data(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        stages = [
            {
                "title": "Talk to the merchant",
                "points": 100,
                "order": 1,
                "character": {"name": "Marco", "role": "Merchant"},
            }
        ]
        event = make_admin_event(arguments={"input": valid_input(stages=stages)})
        result = handler(event, None)

        assert result["stages"][0]["character"]["name"] == "Marco"

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_stage_preserves_challenge_data(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        stages = [
            {
                "title": "Solve the riddle",
                "points": 200,
                "order": 1,
                "challenge": {"type": "riddle", "description": "What has keys but no locks?"},
            }
        ]
        event = make_admin_event(arguments={"input": valid_input(stages=stages)})
        result = handler(event, None)

        assert result["stages"][0]["challenge"]["type"] == "riddle"

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_all_valid_categories_accepted(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        valid_categories = [
            "adventure", "mystery", "cultural", "educational",
            "culinary", "nature", "urban", "team_building",
        ]
        for cat in valid_categories:
            event = make_admin_event(arguments={"input": valid_input(category=cat)})
            result = handler(event, None)
            assert result["category"] == cat

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_all_valid_difficulties_accepted(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        valid_difficulties = ["easy", "medium", "hard", "legendary"]
        for diff in valid_difficulties:
            event = make_admin_event(arguments={"input": valid_input(difficulty=diff)})
            result = handler(event, None)
            assert result["difficulty"] == diff
