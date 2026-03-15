"""Comprehensive tests for generate_quest_ai resolver — edge cases and security."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))


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


VALID_INPUT = {
    "input": {
        "city": "Barcelona",
        "theme": "Gothic Quarter Mystery",
        "difficulty": "medium",
        "stageCount": 3,
        "language": "en",
    }
}


def _make_bedrock_response(overrides=None):
    """Build a mock Bedrock JSON response with optional overrides."""
    base = {
        "title": "Test Quest",
        "description": "A test quest description.",
        "category": "adventure",
        "estimatedDuration": 45,
        "location": {"latitude": 41.38, "longitude": 2.17, "name": "Barcelona"},
        "radius": 3.0,
        "tags": ["test", "barcelona"],
        "stages": [
            {
                "title": f"Stage {i}",
                "description": f"Stage {i} description",
                "location": {"latitude": 41.38 + i * 0.001, "longitude": 2.17 + i * 0.001, "name": f"Place {i}"},
                "character": {
                    "name": f"Char {i}",
                    "role": "guide",
                    "personality": "friendly",
                    "backstory": "A guide.",
                    "voiceStyle": "warm",
                    "greetingMessage": "Hello!",
                },
                "challenge": {
                    "type": "conversation",
                    "description": "Talk.",
                    "successCriteria": "Engage.",
                    "failureHints": ["Try again."],
                },
                "points": 100 + i * 25,
                "hints": ["Go north"],
            }
            for i in range(3)
        ],
    }
    if overrides:
        base.update(overrides)
    return base


def _mock_converse_success(response_data):
    return {
        "output": {
            "message": {
                "content": [{"text": json.dumps(response_data)}]
            }
        }
    }


class TestGenerateQuestAIComprehensive:
    """Comprehensive edge-case and security tests for generate_quest_ai."""

    # 1. Valid generation with all inputs
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_valid_generation_all_inputs(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        resp = _make_bedrock_response()
        mock_bedrock.converse.return_value = _mock_converse_success(resp)

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        assert result["title"] == "Test Quest"
        assert result["difficulty"] == "medium"
        assert result["isPublished"] is False
        assert len(result["stages"]) == 3
        assert result["createdBy"] == "admin-1"
        assert "id" in result
        assert "createdAt" in result
        assert "updatedAt" in result

    # 2. City with special characters
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_city_with_special_characters(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        resp = _make_bedrock_response()
        mock_bedrock.converse.return_value = _mock_converse_success(resp)

        special_input = {
            "input": {
                "city": "São Paulo - O'Brien's District",
                "theme": "Cultural tour",
                "difficulty": "easy",
                "stageCount": 2,
                "language": "en",
            }
        }

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=special_input), None)
        assert result["title"] == "Test Quest"
        # Verify prompt contains the special city name
        call_args = mock_bedrock.converse.call_args
        prompt_text = call_args[1]["messages"][0]["content"][0]["text"]
        assert "São Paulo" in prompt_text

    # 3. Empty city rejected
    @patch("generate_quest_ai.check_admin_access")
    def test_empty_city_rejected(self, mock_auth):
        mock_auth.return_value = True

        empty_city_input = {
            "input": {
                "city": "",
                "theme": "History",
                "difficulty": "easy",
                "stageCount": 2,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="city"):
            handler(make_admin_event(arguments=empty_city_input), None)

    # 4. Missing theme
    @patch("generate_quest_ai.check_admin_access")
    def test_missing_theme_rejected(self, mock_auth):
        mock_auth.return_value = True

        no_theme_input = {
            "input": {
                "city": "Madrid",
                "theme": "",
                "difficulty": "easy",
                "stageCount": 2,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="theme"):
            handler(make_admin_event(arguments=no_theme_input), None)

    # 5. Stage count minimum (must be at least 1)
    @patch("generate_quest_ai.check_admin_access")
    def test_stage_count_minimum_rejected(self, mock_auth):
        mock_auth.return_value = True

        input_data = {
            "input": {
                "city": "Madrid",
                "theme": "History",
                "difficulty": "easy",
                "stageCount": 0,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="stageCount"):
            handler(make_admin_event(arguments=input_data), None)

    # 6. Stage count maximum (max_value=20)
    @patch("generate_quest_ai.check_admin_access")
    def test_stage_count_exceeds_maximum(self, mock_auth):
        mock_auth.return_value = True

        input_data = {
            "input": {
                "city": "Madrid",
                "theme": "History",
                "difficulty": "easy",
                "stageCount": 25,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="stageCount"):
            handler(make_admin_event(arguments=input_data), None)

    # 7. Language parameter es
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_language_es(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = _mock_converse_success(_make_bedrock_response())

        es_input = {
            "input": {
                "city": "Madrid",
                "theme": "Tapas",
                "difficulty": "easy",
                "stageCount": 2,
                "language": "es",
            }
        }

        from generate_quest_ai import handler

        handler(make_admin_event(arguments=es_input), None)

        prompt_text = mock_bedrock.converse.call_args[1]["messages"][0]["content"][0]["text"]
        assert "Spanish" in prompt_text

    # 8. Default language falls back to en
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_default_language_en(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = _mock_converse_success(_make_bedrock_response())

        no_lang_input = {
            "input": {
                "city": "Madrid",
                "theme": "History",
                "difficulty": "easy",
                "stageCount": 2,
            }
        }

        from generate_quest_ai import handler

        handler(make_admin_event(arguments=no_lang_input), None)

        prompt_text = mock_bedrock.converse.call_args[1]["messages"][0]["content"][0]["text"]
        assert "English" in prompt_text

    # 9. Invalid language falls back to en
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_invalid_language_falls_back_to_en(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = _mock_converse_success(_make_bedrock_response())

        fr_input = {
            "input": {
                "city": "Paris",
                "theme": "Art",
                "difficulty": "easy",
                "stageCount": 2,
                "language": "fr",
            }
        }

        from generate_quest_ai import handler

        handler(make_admin_event(arguments=fr_input), None)

        prompt_text = mock_bedrock.converse.call_args[1]["messages"][0]["content"][0]["text"]
        assert "English" in prompt_text

    # 10. Non-admin rejected
    @patch("generate_quest_ai.check_admin_access", side_effect=PermissionError("Admin access required"))
    def test_non_admin_user_rejected(self, mock_auth):
        from generate_quest_ai import handler

        with pytest.raises(PermissionError, match="Admin access required"):
            handler(make_user_event(arguments=VALID_INPUT), None)

    # 11. Bedrock returns invalid JSON
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_bedrock_invalid_json_raises(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = {
            "output": {
                "message": {
                    "content": [{"text": "not valid json {{{"}]
                }
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(json.JSONDecodeError):
            handler(make_admin_event(arguments=VALID_INPUT), None)

    # 12. Bedrock timeout raises
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_bedrock_timeout_raises(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        mock_bedrock.converse.side_effect = Exception("ReadTimeoutError: Read timed out")

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="ReadTimeoutError"):
            handler(make_admin_event(arguments=VALID_INPUT), None)

    # 13. Generated stages have unique IDs
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_generated_stages_have_unique_ids(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = _mock_converse_success(_make_bedrock_response())

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        stage_ids = [s["id"] for s in result["stages"]]
        assert len(stage_ids) == len(set(stage_ids)), "Stage IDs must be unique"
        for sid in stage_ids:
            assert len(sid) == 36  # UUID format

    # 14. Generated quest has correct category from response
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_quest_has_correct_category(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True
        resp = _make_bedrock_response({"category": "cultural"})
        mock_bedrock.converse.return_value = _mock_converse_success(resp)

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        assert result["category"] == "cultural"

    # 15. Retry logic: ResourceNotFoundException triggers fallback
    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_resource_not_found_triggers_fallback(self, mock_bedrock, mock_auth):
        mock_auth.return_value = True

        mock_bedrock.converse.side_effect = [
            Exception("ResourceNotFoundException: Model not found"),
            _mock_converse_success(_make_bedrock_response()),
        ]

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        assert result["title"] == "Test Quest"
        assert mock_bedrock.converse.call_count == 2
