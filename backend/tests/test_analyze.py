"""Tests for analyze_conversation resolver: prompt building and response parsing."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-123"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def make_bedrock_response(analysis):
    """Build a mock Bedrock converse response."""
    return {
        "output": {
            "message": {
                "content": [{"text": json.dumps(analysis)}]
            }
        }
    }


GOOD_ANALYSIS = {
    "passed": True,
    "score": 85,
    "feedback": "The user demonstrated excellent knowledge of Mediterranean spices.",
    "strengths": ["Strong culinary knowledge", "Engaging conversation style"],
    "improvements": ["Could explore more regional variations", "Ask more follow-up questions"],
}


# ── _build_prompt ──────────────────────────────────────────────────────

class TestBuildPrompt:
    def test_build_prompt_with_all_context(self):
        from analyze_conversation import _build_prompt

        transcript = [
            {"role": "user", "text": "Hello Pedro!"},
            {"role": "assistant", "text": "Welcome, seeker!"},
        ]
        quest = {"title": "The Lost Recipe", "description": "A culinary quest"}
        stage = {"title": "Spice Merchant", "description": "Visit the market"}
        challenge = {
            "type": "knowledge",
            "description": "Answer questions about spices",
            "successCriteria": "Identify 3 spice facts",
        }
        conv = {"characterName": "Pedro"}

        prompt = _build_prompt(transcript, quest, stage, challenge, conv)

        assert "The Lost Recipe" in prompt
        assert "Spice Merchant" in prompt
        assert "knowledge" in prompt
        assert "Identify 3 spice facts" in prompt
        assert "Pedro" in prompt
        assert "Hello Pedro!" in prompt
        assert "Welcome, seeker!" in prompt
        assert "USER:" in prompt
        assert "CHARACTER:" in prompt

    def test_build_prompt_empty_transcript(self):
        from analyze_conversation import _build_prompt

        prompt = _build_prompt([], None, None, None, {"characterName": "Test"})

        assert "Empty transcript" in prompt

    def test_build_prompt_no_quest(self):
        from analyze_conversation import _build_prompt

        transcript = [{"role": "user", "text": "Hi"}]
        prompt = _build_prompt(transcript, None, None, None, {"characterName": "Test"})

        assert "Test" in prompt
        assert "Hi" in prompt
        # Should not crash without quest/stage/challenge
        assert "Quest:" not in prompt

    def test_build_prompt_includes_json_format(self):
        from analyze_conversation import _build_prompt

        prompt = _build_prompt([], None, None, None, {"characterName": "X"})

        assert '"passed"' in prompt
        assert '"score"' in prompt
        assert '"feedback"' in prompt
        assert '"strengths"' in prompt
        assert '"improvements"' in prompt

    def test_build_prompt_includes_rules(self):
        from analyze_conversation import _build_prompt

        prompt = _build_prompt([], None, None, None, {"characterName": "X"})

        assert "0-100" in prompt
        assert "success criteria" in prompt.lower()


# ── handler (full flow) ───────────────────────────────────────────────

class TestAnalyzeConversation:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_analyze_success(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "questId": VALID_UUID_2,
            "stageId": "stage-1",
            "characterName": "Pedro",
            "transcript": json.dumps([{"role": "user", "text": "Hello"}]),
        }
        mock_convs.get_item.return_value = {"Item": conv}
        mock_quests.get_item.return_value = {"Item": {
            "id": VALID_UUID_2,
            "title": "Quest",
            "stages": [{"id": "stage-1", "title": "S1", "challenge": {"type": "knowledge"}}],
        }}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": VALID_UUID})
        result = handler(event, None)

        assert result["passed"] is True
        assert result["score"] == 85
        assert len(result["strengths"]) == 2
        assert len(result["improvements"]) == 2
        mock_convs.update_item.assert_called_once()
        mock_scores.put_item.assert_called_once()

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_analyze_strips_markdown_fences(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "questId": "",
            "stageId": "",
            "characterName": "Test",
            "transcript": "[]",
        }
        mock_convs.get_item.return_value = {"Item": conv}
        mock_quests.get_item.return_value = {}

        # Response with markdown code fences
        fenced = f"```json\n{json.dumps(GOOD_ANALYSIS)}\n```"
        mock_bedrock.converse.return_value = {
            "output": {"message": {"content": [{"text": fenced}]}}
        }

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": VALID_UUID})
        result = handler(event, None)

        assert result["passed"] is True
        assert result["score"] == 85

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    def test_analyze_conversation_not_found(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {}

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": VALID_UUID})
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    def test_analyze_wrong_user(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {"id": VALID_UUID, "userId": "other-user"}
        mock_convs.get_item.return_value = {"Item": conv}

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": VALID_UUID})
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)

    @patch("analyze_conversation.MODEL_ID", "us.anthropic.claude-sonnet-4-20250514")
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_analyze_fallback_model(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        """When primary model fails with AccessDenied, fallback model is used."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "questId": "",
            "stageId": "",
            "characterName": "Test",
            "transcript": "[]",
        }
        mock_convs.get_item.return_value = {"Item": conv}
        mock_quests.get_item.return_value = {}

        # First call fails, second succeeds
        mock_bedrock.converse.side_effect = [
            Exception("AccessDeniedException: not authorized"),
            make_bedrock_response(GOOD_ANALYSIS),
        ]

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": VALID_UUID})
        result = handler(event, None)

        assert result["passed"] is True
        assert mock_bedrock.converse.call_count == 2

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_analyze_both_models_fail_raises(self, mock_bedrock, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = {
            "id": VALID_UUID,
            "userId": USER_ID,
            "questId": "",
            "stageId": "",
            "characterName": "Test",
            "transcript": "[]",
        }
        mock_convs.get_item.return_value = {"Item": conv}
        mock_quests.get_item.return_value = {}

        mock_bedrock.converse.side_effect = Exception("AccessDeniedException: denied")

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": VALID_UUID})
        with pytest.raises(Exception):
            handler(event, None)

    @patch("analyze_conversation.check_user_access")
    def test_analyze_invalid_conversation_id(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from analyze_conversation import handler
        event = make_event(arguments={"conversationId": "bad-id"})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)
