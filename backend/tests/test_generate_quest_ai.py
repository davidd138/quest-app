"""Tests for generate_quest_ai resolver."""
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

MOCK_BEDROCK_RESPONSE = {
    "title": "Secrets of the Gothic Quarter",
    "description": "Uncover ancient secrets hidden in Barcelona's Gothic Quarter.",
    "category": "mystery",
    "estimatedDuration": 45,
    "location": {
        "latitude": 41.3851,
        "longitude": 2.1734,
        "name": "Barcelona",
    },
    "radius": 2.0,
    "tags": ["mystery", "gothic", "barcelona"],
    "stages": [
        {
            "title": "The Cathedral Clue",
            "description": "Find the hidden message at the Cathedral.",
            "location": {
                "latitude": 41.3839,
                "longitude": 2.1764,
                "name": "Barcelona Cathedral",
                "address": "Pla de la Seu",
            },
            "character": {
                "name": "Father Miguel",
                "role": "Cathedral Historian",
                "personality": "wise, patient, mysterious",
                "backstory": "A scholar who has spent decades studying the cathedral's secrets.",
                "voiceStyle": "scholarly",
                "greetingMessage": "Welcome, seeker of truth.",
            },
            "challenge": {
                "type": "riddle",
                "description": "Solve the riddle inscribed on the ancient stone.",
                "successCriteria": "Correctly identify the hidden symbol.",
                "failureHints": ["Look at the gargoyles", "Count the arches"],
            },
            "points": 100,
            "hints": ["Head to the main entrance", "Look up at the facade"],
        },
        {
            "title": "The Merchant's Secret",
            "description": "A merchant in the old market holds the next clue.",
            "location": {
                "latitude": 41.3818,
                "longitude": 2.1723,
                "name": "Placa del Rei",
                "address": "Placa del Rei",
            },
            "character": {
                "name": "Rosa",
                "role": "Antique Merchant",
                "personality": "sharp, witty, cautious",
                "backstory": "Her family has traded in the quarter for centuries.",
                "voiceStyle": "playful",
                "greetingMessage": "Ah, another curious visitor!",
            },
            "challenge": {
                "type": "negotiation",
                "description": "Convince Rosa to share the family secret.",
                "successCriteria": "Build enough trust to learn the location.",
                "failureHints": ["Ask about her family history", "Mention the cathedral"],
            },
            "points": 125,
            "hints": ["Walk south from the cathedral", "Look for the old shop sign"],
        },
        {
            "title": "The Underground Chamber",
            "description": "Descend into the Roman ruins beneath the city.",
            "location": {
                "latitude": 41.3822,
                "longitude": 2.1770,
                "name": "MUHBA",
                "address": "Placa del Rei, s/n",
            },
            "character": {
                "name": "Dr. Elena Vidal",
                "role": "Archaeologist",
                "personality": "passionate, detail-oriented, brave",
                "backstory": "She has been excavating the Roman ruins for a decade.",
                "voiceStyle": "energetic",
                "greetingMessage": "You made it! The final piece awaits below.",
            },
            "challenge": {
                "type": "knowledge",
                "description": "Identify the Roman artifact that completes the puzzle.",
                "successCriteria": "Correctly identify the artifact and its historical significance.",
                "failureHints": ["Think about Roman daily life", "Look at the mosaic patterns"],
            },
            "points": 150,
            "hints": ["Enter through the museum", "Go to the lower level"],
        },
    ],
}


class TestGenerateQuestAI:
    """Tests for the generate_quest_ai Lambda resolver."""

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_valid_generation(self, mock_bedrock, mock_auth):
        """Test successful quest generation with mocked Bedrock."""
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = {
            "output": {
                "message": {
                    "content": [{"text": json.dumps(MOCK_BEDROCK_RESPONSE)}]
                }
            }
        }

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        assert result["title"] == "Secrets of the Gothic Quarter"
        assert result["difficulty"] == "medium"
        assert result["isPublished"] is False
        assert len(result["stages"]) == 3
        assert result["totalPoints"] == 375  # 100 + 125 + 150
        assert result["createdBy"] == "admin-1"
        assert "id" in result
        assert "createdAt" in result

        # Verify each stage has a generated UUID id
        for stage in result["stages"]:
            assert "id" in stage
            assert len(stage["id"]) == 36  # UUID format

        mock_bedrock.converse.assert_called_once()

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_generation_with_markdown_fences(self, mock_bedrock, mock_auth):
        """Test that markdown code fences are stripped from response."""
        mock_auth.return_value = True
        wrapped = f"```json\n{json.dumps(MOCK_BEDROCK_RESPONSE)}\n```"
        mock_bedrock.converse.return_value = {
            "output": {
                "message": {
                    "content": [{"text": wrapped}]
                }
            }
        }

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)
        assert result["title"] == "Secrets of the Gothic Quarter"

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_missing_city(self, mock_bedrock, mock_auth):
        """Test that missing city raises a validation error."""
        mock_auth.return_value = True

        invalid_input = {
            "input": {
                "city": "",
                "theme": "Mystery",
                "difficulty": "easy",
                "stageCount": 2,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="city"):
            handler(make_admin_event(arguments=invalid_input), None)

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_invalid_difficulty(self, mock_bedrock, mock_auth):
        """Test that invalid difficulty raises a validation error."""
        mock_auth.return_value = True

        invalid_input = {
            "input": {
                "city": "Madrid",
                "theme": "Royal Palace",
                "difficulty": "impossible",
                "stageCount": 3,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="difficulty"):
            handler(make_admin_event(arguments=invalid_input), None)

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_invalid_stage_count(self, mock_bedrock, mock_auth):
        """Test that stage count of 0 raises a validation error."""
        mock_auth.return_value = True

        invalid_input = {
            "input": {
                "city": "Madrid",
                "theme": "History",
                "difficulty": "easy",
                "stageCount": 0,
            }
        }

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="stageCount"):
            handler(make_admin_event(arguments=invalid_input), None)

    @patch("generate_quest_ai.check_admin_access", side_effect=PermissionError("Admin access required"))
    def test_non_admin_rejected(self, mock_auth):
        """Test that non-admin users are rejected."""
        from generate_quest_ai import handler

        with pytest.raises(PermissionError, match="Admin access required"):
            handler(make_user_event(arguments=VALID_INPUT), None)

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_bedrock_fallback(self, mock_bedrock, mock_auth):
        """Test fallback to Nova when Claude is unavailable."""
        mock_auth.return_value = True

        # First call raises AccessDeniedException, second succeeds
        mock_bedrock.converse.side_effect = [
            Exception("AccessDeniedException: Model not available"),
            {
                "output": {
                    "message": {
                        "content": [{"text": json.dumps(MOCK_BEDROCK_RESPONSE)}]
                    }
                }
            },
        ]

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        assert result["title"] == "Secrets of the Gothic Quarter"
        assert mock_bedrock.converse.call_count == 2

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_both_models_fail(self, mock_bedrock, mock_auth):
        """Test error when both primary and fallback models fail."""
        mock_auth.return_value = True

        # Both calls fail with access denied
        mock_bedrock.converse.side_effect = [
            Exception("AccessDeniedException: Model not available"),
            Exception("AccessDeniedException: Fallback also not available"),
        ]

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="AccessDeniedException"):
            handler(make_admin_event(arguments=VALID_INPUT), None)

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_non_access_error_not_retried(self, mock_bedrock, mock_auth):
        """Test that non-access errors are raised immediately without fallback."""
        mock_auth.return_value = True

        mock_bedrock.converse.side_effect = Exception("InternalServerError: Something broke")

        from generate_quest_ai import handler

        with pytest.raises(Exception, match="InternalServerError"):
            handler(make_admin_event(arguments=VALID_INPUT), None)

        # Should only have tried once since error is not access-related
        assert mock_bedrock.converse.call_count == 1

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_spanish_language(self, mock_bedrock, mock_auth):
        """Test that language parameter is passed to prompt."""
        mock_auth.return_value = True
        mock_bedrock.converse.return_value = {
            "output": {
                "message": {
                    "content": [{"text": json.dumps(MOCK_BEDROCK_RESPONSE)}]
                }
            }
        }

        spanish_input = {
            "input": {
                "city": "Madrid",
                "theme": "Tapas tour",
                "difficulty": "easy",
                "stageCount": 2,
                "language": "es",
            }
        }

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=spanish_input), None)

        # Verify the prompt included Spanish instruction
        call_args = mock_bedrock.converse.call_args
        prompt_text = call_args[1]["messages"][0]["content"][0]["text"]
        assert "Spanish" in prompt_text

    @patch("generate_quest_ai.check_admin_access")
    @patch("generate_quest_ai.bedrock")
    def test_default_values_for_missing_stage_fields(self, mock_bedrock, mock_auth):
        """Test that stages with missing fields get sensible defaults."""
        mock_auth.return_value = True

        minimal_response = {
            "title": "Minimal Quest",
            "description": "A quest with minimal stage data.",
            "stages": [
                {
                    "title": "Stage 1",
                }
            ],
        }

        mock_bedrock.converse.return_value = {
            "output": {
                "message": {
                    "content": [{"text": json.dumps(minimal_response)}]
                }
            }
        }

        from generate_quest_ai import handler

        result = handler(make_admin_event(arguments=VALID_INPUT), None)

        stage = result["stages"][0]
        assert stage["title"] == "Stage 1"
        assert "location" in stage
        assert "character" in stage
        assert "challenge" in stage
        assert stage["points"] == 100  # default
