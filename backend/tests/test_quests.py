"""Tests for quest resolvers: list_quests, get_quest, create_quest, update_quest, delete_quest."""
import sys
import os
import json
import uuid
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"


def make_event(user_id="user-1", arguments=None, groups=None):
    """Build a mock AppSync event."""
    event = {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }
    return event


def make_admin_event(user_id="admin-1", arguments=None):
    return make_event(user_id=user_id, arguments=arguments, groups=["admins"])


# ── list_quests ────────────────────────────────────────────────────────

class TestListQuests:
    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_basic(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        items = [{"id": "q1", "title": "Quest 1"}, {"id": "q2", "title": "Quest 2"}]
        mock_quests.scan.return_value = {"Items": items}

        from list_quests import handler
        result = handler(make_event(), None)

        assert result["items"] == items
        assert result["nextToken"] is None

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_non_admin_filters_published(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        handler(make_event(), None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert "#pub = :pub" in call_kwargs["FilterExpression"]
        assert call_kwargs["ExpressionAttributeValues"][":pub"] is True

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_admin_sees_all(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "admin-1", "role": "admin", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        handler(make_event(user_id="admin-1"), None)

        call_kwargs = mock_quests.scan.call_args[1]
        # Admin should not have isPublished filter
        assert "FilterExpression" not in call_kwargs or ":pub" not in call_kwargs.get("ExpressionAttributeValues", {})

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_with_category_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"category": "adventure"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":cat"] == "adventure"

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_with_difficulty_filter(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"difficulty": "hard"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":diff"] == "hard"

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_pagination(self, mock_quests, mock_auth):
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
    def test_list_quests_with_next_token(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"nextToken": "start-key"})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["ExclusiveStartKey"] == {"id": "start-key"}

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_list_quests_custom_limit(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}
        mock_quests.scan.return_value = {"Items": []}

        from list_quests import handler
        event = make_event(arguments={"limit": 10})
        handler(event, None)

        call_kwargs = mock_quests.scan.call_args[1]
        assert call_kwargs["Limit"] == 10


# ── get_quest ──────────────────────────────────────────────────────────

class TestGetQuest:
    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_get_quest_found(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = {"id": VALID_UUID, "title": "Test Quest"}
        mock_quests.get_item.return_value = {"Item": quest}
        mock_progress.query.return_value = {"Items": []}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["title"] == "Test Quest"
        assert "userProgress" not in result

    @patch("get_quest.check_user_access")
    @patch("get_quest.progress_table")
    @patch("get_quest.quests_table")
    def test_get_quest_with_progress(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        quest = {"id": VALID_UUID, "title": "Test Quest"}
        progress = {"id": "p1", "userId": "user-1", "questId": VALID_UUID, "status": "in_progress"}
        mock_quests.get_item.return_value = {"Item": quest}
        mock_progress.query.return_value = {"Items": [progress]}

        from get_quest import handler
        result = handler(make_event(arguments={"id": VALID_UUID}), None)

        assert result["userProgress"] == progress

    @patch("get_quest.check_user_access")
    @patch("get_quest.quests_table")
    def test_get_quest_not_found(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}
        mock_quests.get_item.return_value = {}

        from get_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_event(arguments={"id": VALID_UUID}), None)

    @patch("get_quest.check_user_access")
    def test_get_quest_invalid_uuid(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from get_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"id": "bad-id"}), None)


# ── create_quest ───────────────────────────────────────────────────────

class TestCreateQuest:
    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_create_quest_success(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={
            "input": {
                "title": "New Quest",
                "description": "A new test quest",
                "category": "adventure",
                "difficulty": "easy",
                "estimatedDuration": 1800,
                "stages": [
                    {
                        "title": "Stage 1",
                        "points": 100,
                        "order": 1,
                    }
                ],
            }
        })
        result = handler(event, None)

        assert result["title"] == "New Quest"
        assert result["category"] == "adventure"
        assert result["totalPoints"] == 100
        assert result["id"] is not None
        mock_quests.put_item.assert_called_once()

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_create_quest_generates_stage_ids(self, mock_quests, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={
            "input": {
                "title": "Quest",
                "description": "Desc",
                "category": "mystery",
                "difficulty": "hard",
                "estimatedDuration": 3600,
                "stages": [{"title": "S1", "points": 50}, {"title": "S2", "points": 75}],
            }
        })
        result = handler(event, None)

        for stage in result["stages"]:
            assert "id" in stage

    @patch("create_quest.check_admin_access")
    def test_create_quest_no_stages_raises(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={
            "input": {
                "title": "Quest",
                "description": "Desc",
                "category": "adventure",
                "difficulty": "easy",
                "estimatedDuration": 1800,
                "stages": [],
            }
        })
        with pytest.raises(Exception, match="At least one stage"):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_create_quest_invalid_category(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={
            "input": {
                "title": "Quest",
                "description": "Desc",
                "category": "invalid_cat",
                "difficulty": "easy",
                "estimatedDuration": 1800,
                "stages": [{"title": "S1", "points": 50}],
            }
        })
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("create_quest.check_admin_access")
    def test_create_quest_invalid_difficulty(self, mock_admin):
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={
            "input": {
                "title": "Quest",
                "description": "Desc",
                "category": "adventure",
                "difficulty": "impossible",
                "estimatedDuration": 1800,
                "stages": [{"title": "S1", "points": 50}],
            }
        })
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)


# ── update_quest ───────────────────────────────────────────────────────

class TestUpdateQuest:
    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_update_quest_title(self, mock_quests, mock_admin):
        mock_admin.return_value = True
        quest = {"id": VALID_UUID, "title": "Old Title", "description": "Desc"}
        mock_quests.get_item.return_value = {"Item": quest}

        from update_quest import handler
        event = make_admin_event(arguments={
            "input": {"id": VALID_UUID, "title": "New Title"}
        })
        result = handler(event, None)

        assert result["title"] == "New Title"
        mock_quests.update_item.assert_called_once()

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_update_quest_not_found(self, mock_quests, mock_admin):
        mock_admin.return_value = True
        mock_quests.get_item.return_value = {}

        from update_quest import handler
        event = make_admin_event(arguments={
            "input": {"id": VALID_UUID, "title": "New Title"}
        })
        with pytest.raises(Exception, match="Quest not found"):
            handler(event, None)

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_update_quest_no_changes_returns_existing(self, mock_quests, mock_admin):
        mock_admin.return_value = True
        quest = {"id": VALID_UUID, "title": "Title"}
        mock_quests.get_item.return_value = {"Item": quest}

        from update_quest import handler
        event = make_admin_event(arguments={"input": {"id": VALID_UUID}})
        result = handler(event, None)

        assert result == quest
        mock_quests.update_item.assert_not_called()

    @patch("update_quest.check_admin_access")
    @patch("update_quest.quests_table")
    def test_update_quest_recalculates_points_on_stages(self, mock_quests, mock_admin):
        mock_admin.return_value = True
        quest = {"id": VALID_UUID, "title": "Q", "totalPoints": 100}
        mock_quests.get_item.return_value = {"Item": quest}

        from update_quest import handler
        new_stages = [
            {"title": "S1", "points": 200},
            {"title": "S2", "points": 300},
        ]
        event = make_admin_event(arguments={
            "input": {"id": VALID_UUID, "stages": new_stages}
        })
        handler(event, None)

        call_kwargs = mock_quests.update_item.call_args[1]
        assert call_kwargs["ExpressionAttributeValues"][":totalPoints"] == 500

    @patch("update_quest.check_admin_access")
    def test_update_quest_invalid_id(self, mock_admin):
        mock_admin.return_value = True

        from update_quest import handler
        event = make_admin_event(arguments={"input": {"id": "bad"}})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)


# ── delete_quest ───────────────────────────────────────────────────────

class TestDeleteQuest:
    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_delete_quest_success(self, mock_quests, mock_admin):
        mock_admin.return_value = True
        quest = {"id": VALID_UUID, "title": "Quest"}
        mock_quests.get_item.return_value = {"Item": quest}

        from delete_quest import handler
        event = make_admin_event(arguments={"id": VALID_UUID})
        result = handler(event, None)

        assert result is True
        mock_quests.delete_item.assert_called_once_with(Key={"id": VALID_UUID})

    @patch("delete_quest.check_admin_access")
    @patch("delete_quest.quests_table")
    def test_delete_quest_not_found(self, mock_quests, mock_admin):
        mock_admin.return_value = True
        mock_quests.get_item.return_value = {}

        from delete_quest import handler
        event = make_admin_event(arguments={"id": VALID_UUID})
        with pytest.raises(Exception, match="Quest not found"):
            handler(event, None)

    @patch("delete_quest.check_admin_access")
    def test_delete_quest_invalid_id(self, mock_admin):
        mock_admin.return_value = True

        from delete_quest import handler
        event = make_admin_event(arguments={"id": "not-valid"})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)
