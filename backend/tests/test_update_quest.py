"""Tests for update_quest resolver: field updates, point recalculation, admin access, not found."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

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


SAMPLE_QUEST = {
    "id": VALID_UUID,
    "title": "The Lost Temple",
    "description": "An ancient temple awaits.",
    "category": "adventure",
    "difficulty": "hard",
    "estimatedDuration": 60,
    "totalPoints": 300,
    "isPublished": True,
    "stages": [
        {"id": "s1", "order": 0, "title": "Entrance", "points": 100},
        {"id": "s2", "order": 1, "title": "Inner Chamber", "points": 200},
    ],
    "createdAt": "2025-06-01T12:00:00+00:00",
}


class TestUpdateQuestTitle:
    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_updates_title(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.update_item.return_value = {}

        from update_quest import handler
        result = handler(
            make_admin_event(
                arguments={"input": {"id": VALID_UUID, "title": "New Title"}}
            ),
            None,
        )

        assert result["title"] == "New Title"

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_calls_update_item_with_title(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.update_item.return_value = {}

        from update_quest import handler
        handler(
            make_admin_event(
                arguments={"input": {"id": VALID_UUID, "title": "New Title"}}
            ),
            None,
        )

        call_kwargs = mock_table.update_item.call_args[1]
        assert ":title" in call_kwargs["ExpressionAttributeValues"]
        assert call_kwargs["ExpressionAttributeValues"][":title"] == "New Title"


class TestUpdateQuestMultipleFields:
    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_updates_multiple_fields(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.update_item.return_value = {}

        from update_quest import handler
        result = handler(
            make_admin_event(
                arguments={
                    "input": {
                        "id": VALID_UUID,
                        "title": "Updated Quest",
                        "description": "Updated description",
                        "difficulty": "easy",
                    }
                }
            ),
            None,
        )

        assert result["title"] == "Updated Quest"
        assert result["description"] == "Updated description"
        assert result["difficulty"] == "easy"

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_no_update_when_no_fields(self, mock_table, mock_admin):
        """When no updatable fields are provided, return the quest as-is."""
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}

        from update_quest import handler
        result = handler(
            make_admin_event(arguments={"input": {"id": VALID_UUID}}),
            None,
        )

        # Should return quest without calling update_item
        mock_table.update_item.assert_not_called()
        assert result["title"] == SAMPLE_QUEST["title"]

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_sets_updated_at_timestamp(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.update_item.return_value = {}

        from update_quest import handler
        result = handler(
            make_admin_event(
                arguments={"input": {"id": VALID_UUID, "title": "New"}}
            ),
            None,
        )

        assert "updatedAt" in result


class TestUpdateQuestRecalculatesPoints:
    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_recalculates_total_points_on_stage_change(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.update_item.return_value = {}

        new_stages = [
            {"id": "s1", "order": 0, "title": "Stage 1", "points": 150},
            {"id": "s2", "order": 1, "title": "Stage 2", "points": 250},
            {"id": "s3", "order": 2, "title": "Stage 3", "points": 100},
        ]

        from update_quest import handler
        handler(
            make_admin_event(
                arguments={"input": {"id": VALID_UUID, "stages": new_stages}}
            ),
            None,
        )

        call_kwargs = mock_table.update_item.call_args[1]
        assert ":totalPoints" in call_kwargs["ExpressionAttributeValues"]
        assert call_kwargs["ExpressionAttributeValues"][":totalPoints"] == 500

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_generates_ids_for_stages_without_id(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}
        mock_table.update_item.return_value = {}

        new_stages = [
            {"order": 0, "title": "New Stage", "points": 100},
        ]

        from update_quest import handler
        handler(
            make_admin_event(
                arguments={"input": {"id": VALID_UUID, "stages": new_stages}}
            ),
            None,
        )

        call_kwargs = mock_table.update_item.call_args[1]
        stages_val = call_kwargs["ExpressionAttributeValues"][":stages"]
        assert stages_val[0].get("id") is not None
        assert len(stages_val[0]["id"]) == 36  # UUID format


class TestUpdateQuestNonAdminRejected:
    @patch("update_quest.check_admin_access")
    def test_non_admin_raises_permission_error(self, mock_admin):
        mock_admin.side_effect = PermissionError("Admin access required")

        from update_quest import handler
        with pytest.raises(PermissionError, match="Admin access required"):
            handler(
                make_user_event(
                    arguments={"input": {"id": VALID_UUID, "title": "Hacked"}}
                ),
                None,
            )


class TestUpdateQuestNotFound:
    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_quest_not_found_raises(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": None}

        from update_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(
                make_admin_event(
                    arguments={"input": {"id": VALID_UUID, "title": "Update"}}
                ),
                None,
            )

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_quest_not_found_no_item(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {}

        from update_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(
                make_admin_event(
                    arguments={"input": {"id": VALID_UUID, "title": "Update"}}
                ),
                None,
            )


class TestUpdateQuestValidation:
    @patch("update_quest.check_admin_access")
    def test_invalid_uuid_raises(self, mock_admin):
        mock_admin.return_value = True

        from update_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(
                make_admin_event(
                    arguments={"input": {"id": "not-a-uuid", "title": "X"}}
                ),
                None,
            )

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_invalid_category_raises(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}

        from update_quest import handler
        with pytest.raises(Exception, match="category must be one of"):
            handler(
                make_admin_event(
                    arguments={"input": {"id": VALID_UUID, "category": "invalid"}}
                ),
                None,
            )

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_invalid_difficulty_raises(self, mock_table, mock_admin):
        mock_admin.return_value = True
        mock_table.get_item.return_value = {"Item": SAMPLE_QUEST.copy()}

        from update_quest import handler
        with pytest.raises(Exception, match="difficulty must be one of"):
            handler(
                make_admin_event(
                    arguments={"input": {"id": VALID_UUID, "difficulty": "impossible"}}
                ),
                None,
            )
