"""Tests for create_community_quest resolver."""
import sys
import os
import uuid
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None, groups=None):
    """Build a mock AppSync event."""
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


def make_valid_stage(order=1, title="Stage", description="Stage desc"):
    """Build a valid stage input dict."""
    return {
        "title": title,
        "description": description,
        "order": order,
        "points": 100,
        "location": {
            "latitude": 40.4168,
            "longitude": -3.7038,
            "name": "Madrid",
        },
        "character": {
            "name": "Guide",
            "role": "NPC",
            "personality": "Friendly",
            "backstory": "A guide",
            "voiceStyle": "warm",
            "greetingMessage": "Hello!",
        },
        "challenge": {
            "type": "conversation",
            "description": "Talk to the guide",
            "successCriteria": "Complete conversation",
            "failureHints": ["Try again"],
        },
        "hints": ["Look around"],
    }


def make_valid_input(num_stages=2):
    """Build a valid community quest input."""
    return {
        "input": {
            "title": "Community Quest",
            "description": "A user-created quest",
            "category": "adventure",
            "difficulty": "medium",
            "estimatedDuration": 3600,
            "stages": [make_valid_stage(order=i + 1, title=f"Stage {i + 1}") for i in range(num_stages)],
            "location": {"latitude": 40.4168, "longitude": -3.7038, "name": "Madrid"},
            "radius": 5000,
            "tags": ["community", "adventure"],
        }
    }


class TestCreateCommunityQuest:
    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_success_creates_with_is_published_false(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        event = make_event(arguments=make_valid_input())
        result = handler(event, None)

        assert result["title"] == "Community Quest"
        assert result["isPublished"] is False
        assert result["isCommunityQuest"] is True
        assert result["createdBy"] == "user-1"
        assert result["category"] == "adventure"
        assert result["difficulty"] == "medium"
        assert result["totalPoints"] == 200  # 2 stages x 100 points
        mock_quests.put_item.assert_called_once()

    @patch("create_community_quest.check_user_access")
    def test_validates_minimum_2_stages(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        # Only 1 stage
        input_data = make_valid_input(num_stages=1)
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="at least 2 stages"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_no_stages(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"] = []
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="At least one stage"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_required_fields_title(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["title"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_required_fields_description(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["description"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_required_fields_category(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["category"] = "invalid_category"
        event = make_event(arguments=input_data)

        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_required_fields(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        # Remove title from first stage
        input_data["input"]["stages"][0]["title"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="title is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_character_required(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["character"] = {"role": "NPC"}
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="character name is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_quest_location_required(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["location"] = {"latitude": 40.4}
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="location name is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_quest_radius(self, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["radius"] = 0
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="radius must be positive"):
            handler(event, None)

    def test_non_active_user_rejected(self):
        """check_user_access raises an exception for non-active users."""
        from create_community_quest import handler

        with patch("create_community_quest.check_user_access") as mock_auth:
            mock_auth.side_effect = Exception("User access denied")

            event = make_event(user_id="inactive-user", arguments=make_valid_input())
            with pytest.raises(Exception, match="User access denied"):
                handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_generated_uuids_for_quest_and_stages(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": "user-1", "role": "user", "status": "active"}

        from create_community_quest import handler

        event = make_event(arguments=make_valid_input(num_stages=3))
        result = handler(event, None)

        # Quest ID should be a valid UUID
        quest_id = result["id"]
        uuid.UUID(quest_id)  # Raises ValueError if not valid

        # Each stage should have a UUID
        assert len(result["stages"]) == 3
        for stage in result["stages"]:
            assert "id" in stage
            uuid.UUID(stage["id"])  # Validates UUID format

        # All IDs should be unique
        all_ids = [result["id"]] + [s["id"] for s in result["stages"]]
        assert len(all_ids) == len(set(all_ids))
