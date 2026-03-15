"""Comprehensive tests for create_community_quest resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


def make_event(user_id="user-1", arguments=None, groups=None):
    return {
        "identity": {
            "sub": user_id,
            "claims": {"cognito:groups": groups or []},
        },
        "arguments": arguments or {},
    }


def make_valid_stage(order=1, title="Stage", description="Stage desc"):
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


class TestCommunityQuestComprehensive:
    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_sets_is_community_quest_true(self, mock_quests, mock_auth):
        """Created quest should have isCommunityQuest=true."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        result = handler(make_event(arguments=make_valid_input()), None)

        assert result["isCommunityQuest"] is True

    @patch("create_community_quest.check_user_access")
    def test_minimum_2_stages_enforced(self, mock_auth):
        """Should reject quests with fewer than 2 stages."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input(num_stages=1)
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="at least 2 stages"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_validates_all_stage_fields(self, mock_quests, mock_auth):
        """Each stage must have required fields: title, description, location, character, challenge."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        # Missing stage description
        input_data = make_valid_input()
        input_data["input"]["stages"][0]["description"] = ""
        event = make_event(arguments=input_data)
        with pytest.raises(Exception, match="description is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_category_enum_validation(self, mock_auth):
        """Invalid category should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["category"] = "invalid_category"
        event = make_event(arguments=input_data)

        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_difficulty_enum_validation(self, mock_auth):
        """Invalid difficulty should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["difficulty"] = "impossible"
        event = make_event(arguments=input_data)

        with pytest.raises(Exception):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_max_stages_limit_20(self, mock_quests, mock_auth):
        """Should accept up to 20 stages without error."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input(num_stages=20)
        event = make_event(arguments=input_data)
        result = handler(event, None)

        assert len(result["stages"]) == 20

    @patch("create_community_quest.check_user_access")
    def test_title_length_validation(self, mock_auth):
        """Title exceeding max length should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["title"] = "A" * 201  # max_length=200
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="at most 200 characters"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_description_length_validation(self, mock_auth):
        """Description exceeding max length should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["description"] = "A" * 2001  # max_length=2000
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="at most 2000 characters"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_is_published_false_by_default(self, mock_quests, mock_auth):
        """Community quests should not be published by default."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        result = handler(make_event(arguments=make_valid_input()), None)

        assert result["isPublished"] is False

    @patch("create_community_quest.check_user_access")
    def test_validates_challenge_type(self, mock_auth):
        """Invalid challenge type should be rejected."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["challenge"]["type"] = "flying"
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="invalid challenge type"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_character_personality_required(self, mock_auth):
        """Stage character must have personality."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["character"]["personality"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="character personality is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_character_voice_style_required(self, mock_auth):
        """Stage character must have voiceStyle."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["character"]["voiceStyle"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="character voiceStyle is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_character_greeting_required(self, mock_auth):
        """Stage character must have greetingMessage."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["character"]["greetingMessage"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="character greetingMessage is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_challenge_description_required(self, mock_auth):
        """Stage challenge must have a description."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["challenge"]["description"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="challenge description is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_challenge_success_criteria_required(self, mock_auth):
        """Stage challenge must have successCriteria."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["challenge"]["successCriteria"] = ""
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="challenge successCriteria is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    def test_validates_stage_points_positive(self, mock_auth):
        """Stage points must be positive."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["stages"][0]["points"] = 0
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="points must be positive"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_total_points_summed_correctly(self, mock_quests, mock_auth):
        """Total points should be the sum of all stage points."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input(num_stages=3)
        input_data["input"]["stages"][0]["points"] = 50
        input_data["input"]["stages"][1]["points"] = 75
        input_data["input"]["stages"][2]["points"] = 100
        event = make_event(arguments=input_data)
        result = handler(event, None)

        assert result["totalPoints"] == 225

    @patch("create_community_quest.check_user_access")
    def test_validates_tags_must_be_list(self, mock_auth):
        """Tags must be a list."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["tags"] = "not-a-list"
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="Tags must be a list"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_created_by_set_to_user_id(self, mock_quests, mock_auth):
        """createdBy should be set to the calling user's ID."""
        mock_auth.return_value = {"userId": "creator-42", "status": "active"}

        from create_community_quest import handler

        result = handler(make_event(user_id="creator-42", arguments=make_valid_input()), None)

        assert result["createdBy"] == "creator-42"

    @patch("create_community_quest.check_user_access")
    def test_validates_location_name_required(self, mock_auth):
        """Quest-level location name is required."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        input_data = make_valid_input()
        input_data["input"]["location"] = {"latitude": 40.0}
        event = make_event(arguments=input_data)

        with pytest.raises(Exception, match="location name is required"):
            handler(event, None)

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_valid_categories_accepted(self, mock_quests, mock_auth):
        """All valid category values should be accepted."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        valid_cats = ["adventure", "mystery", "cultural", "educational", "culinary", "nature", "urban", "team_building"]
        for cat in valid_cats:
            input_data = make_valid_input()
            input_data["input"]["category"] = cat
            event = make_event(arguments=input_data)
            result = handler(event, None)
            assert result["category"] == cat

    @patch("create_community_quest.check_user_access")
    @patch("create_community_quest.quests_table")
    def test_valid_difficulties_accepted(self, mock_quests, mock_auth):
        """All valid difficulty values should be accepted."""
        mock_auth.return_value = {"userId": "user-1", "status": "active"}

        from create_community_quest import handler

        valid_diffs = ["easy", "medium", "hard", "legendary"]
        for diff in valid_diffs:
            input_data = make_valid_input()
            input_data["input"]["difficulty"] = diff
            event = make_event(arguments=input_data)
            result = handler(event, None)
            assert result["difficulty"] == diff
