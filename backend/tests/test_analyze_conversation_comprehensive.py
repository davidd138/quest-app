"""Comprehensive tests for analyze_conversation resolver."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock
from decimal import Decimal

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-analyze-comp-123"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def make_bedrock_response(analysis):
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
    "feedback": "Excellent performance in the spice challenge.",
    "strengths": ["Strong knowledge", "Great engagement"],
    "improvements": ["Could explore more", "Ask follow-ups"],
}

FAILED_ANALYSIS = {
    "passed": False,
    "score": 30,
    "feedback": "The user did not meet the success criteria.",
    "strengths": ["Attempted the challenge"],
    "improvements": ["Study the topic more", "Be more specific", "Practice conversation flow"],
}


def _make_conv(transcript="[]", quest_id="", stage_id="", user_id=USER_ID):
    return {
        "id": VALID_UUID,
        "userId": user_id,
        "questId": quest_id,
        "stageId": stage_id,
        "characterName": "Pedro",
        "transcript": transcript,
    }


def _make_quest(stages=None):
    return {
        "id": VALID_UUID_2,
        "title": "The Lost Recipe",
        "description": "A culinary quest",
        "stages": stages or [],
    }


# ── Prompt includes correct challenge info ────────────────────────────


class TestPromptIncludesChallengeInfo:
    def test_prompt_contains_challenge_type(self):
        from analyze_conversation import _build_prompt

        challenge = {"type": "negotiation", "description": "Haggle the price", "successCriteria": "Get 50% off"}
        prompt = _build_prompt(
            [{"role": "user", "text": "Hi"}],
            {"title": "Market Quest", "description": "Buy spices"},
            {"title": "Haggle Stage", "description": "Negotiate"},
            challenge,
            {"characterName": "Merchant"},
        )
        assert "negotiation" in prompt
        assert "Haggle the price" in prompt
        assert "Get 50% off" in prompt

    def test_prompt_contains_quest_title_and_description(self):
        from analyze_conversation import _build_prompt

        quest = {"title": "Ancient Mysteries", "description": "Explore old ruins"}
        prompt = _build_prompt([], quest, None, None, {"characterName": "Guide"})
        assert "Ancient Mysteries" in prompt
        assert "Explore old ruins" in prompt

    def test_prompt_contains_stage_info(self):
        from analyze_conversation import _build_prompt

        stage = {"title": "First Gate", "description": "Solve the riddle"}
        prompt = _build_prompt([], None, stage, None, {"characterName": "Sphinx"})
        assert "First Gate" in prompt
        assert "Solve the riddle" in prompt

    def test_prompt_contains_character_name(self):
        from analyze_conversation import _build_prompt

        prompt = _build_prompt([], None, None, None, {"characterName": "Don Quixote"})
        assert "Don Quixote" in prompt


# ── Prompt includes transcript ────────────────────────────────────────


class TestPromptIncludesTranscript:
    def test_transcript_messages_numbered(self):
        from analyze_conversation import _build_prompt

        transcript = [
            {"role": "user", "text": "Hello there"},
            {"role": "assistant", "text": "Greetings traveler"},
            {"role": "user", "text": "I seek knowledge"},
        ]
        prompt = _build_prompt(transcript, None, None, None, {"characterName": "Sage"})
        assert "[1] USER: Hello there" in prompt
        assert "[2] CHARACTER: Greetings traveler" in prompt
        assert "[3] USER: I seek knowledge" in prompt

    def test_empty_transcript_shows_placeholder(self):
        from analyze_conversation import _build_prompt

        prompt = _build_prompt([], None, None, None, {"characterName": "X"})
        assert "Empty transcript" in prompt

    def test_transcript_with_missing_text_field(self):
        from analyze_conversation import _build_prompt

        transcript = [{"role": "user"}]
        prompt = _build_prompt(transcript, None, None, None, {"characterName": "X"})
        assert "[no text]" in prompt


# ── Bedrock response parsed correctly ─────────────────────────────────


class TestBedrockResponseParsing:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_passed_true_result(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)

        assert result["passed"] is True
        assert result["score"] == 85
        assert "Excellent" in result["feedback"]
        assert len(result["strengths"]) == 2
        assert len(result["improvements"]) == 2

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_passed_false_result(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}
        mock_bedrock.converse.return_value = make_bedrock_response(FAILED_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)

        assert result["passed"] is False
        assert result["score"] == 30
        assert len(result["improvements"]) == 3


# ── Markdown fence stripping ──────────────────────────────────────────


class TestMarkdownFenceStripping:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_strips_json_fences(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}

        fenced = f"```json\n{json.dumps(GOOD_ANALYSIS)}\n```"
        mock_bedrock.converse.return_value = {
            "output": {"message": {"content": [{"text": fenced}]}}
        }

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is True

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_strips_plain_fences(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}

        fenced = f"```\n{json.dumps(GOOD_ANALYSIS)}\n```"
        mock_bedrock.converse.return_value = {
            "output": {"message": {"content": [{"text": fenced}]}}
        }

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["score"] == 85


# ── Claude model fallback to Nova ─────────────────────────────────────


class TestModelFallback:
    @patch("analyze_conversation.MODEL_ID", "us.anthropic.claude-sonnet-4-20250514")
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_fallback_on_access_denied(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}

        mock_bedrock.converse.side_effect = [
            Exception("AccessDeniedException: not authorized"),
            make_bedrock_response(GOOD_ANALYSIS),
        ]

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is True
        assert mock_bedrock.converse.call_count == 2

    @patch("analyze_conversation.MODEL_ID", "us.anthropic.claude-sonnet-4-20250514")
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_fallback_on_resource_not_found(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}

        mock_bedrock.converse.side_effect = [
            Exception("ResourceNotFoundException: model not found"),
            make_bedrock_response(FAILED_ANALYSIS),
        ]

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is False
        assert mock_bedrock.converse.call_count == 2


# ── Both models fail raises error ─────────────────────────────────────


class TestBothModelsFail:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_both_fail_with_access_denied(self, mock_bedrock, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}

        mock_bedrock.converse.side_effect = Exception("AccessDeniedException: denied")

        from analyze_conversation import handler
        with pytest.raises(Exception):
            handler(make_event(arguments={"conversationId": VALID_UUID}), None)

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_non_access_error_raises_immediately(self, mock_bedrock, mock_quests, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}

        mock_bedrock.converse.side_effect = Exception("InternalServerError: something broke")

        from analyze_conversation import handler
        with pytest.raises(Exception, match="InternalServerError"):
            handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        # Should fail on first call, not retry
        assert mock_bedrock.converse.call_count == 1


# ── Conversation not found ────────────────────────────────────────────


class TestConversationNotFound:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    def test_missing_item(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {}

        from analyze_conversation import handler
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"conversationId": VALID_UUID}), None)

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    def test_none_item(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": None}

        from analyze_conversation import handler
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"conversationId": VALID_UUID}), None)


# ── Wrong user rejected ───────────────────────────────────────────────


class TestWrongUserRejected:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    def test_different_user_id(self, mock_convs, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv(user_id="other-user")}

        from analyze_conversation import handler
        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(make_event(arguments={"conversationId": VALID_UUID}), None)


# ── Score saved to table ──────────────────────────────────────────────


class TestScoreSaved:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_score_record_created(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv(quest_id=VALID_UUID_2, stage_id="s1")}
        mock_quests.get_item.return_value = {"Item": _make_quest()}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        handler(make_event(arguments={"conversationId": VALID_UUID}), None)

        mock_scores.put_item.assert_called_once()
        score_item = mock_scores.put_item.call_args[1]["Item"]
        assert score_item["userId"] == USER_ID
        assert score_item["questId"] == VALID_UUID_2
        assert score_item["stageId"] == "s1"
        assert score_item["passed"] is True
        assert score_item["score"] == 85
        assert "id" in score_item
        assert "analyzedAt" in score_item


# ── Result saved to conversation ──────────────────────────────────────


class TestResultSavedToConversation:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_conversation_updated_with_result_and_status(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv()}
        mock_quests.get_item.return_value = {}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        handler(make_event(arguments={"conversationId": VALID_UUID}), None)

        mock_convs.update_item.assert_called_once()
        update_call = mock_convs.update_item.call_args
        assert update_call[1]["Key"] == {"id": VALID_UUID}
        expr_values = update_call[1]["ExpressionAttributeValues"]
        assert expr_values[":st"] == "analyzed"
        assert expr_values[":cr"]["passed"] is True
        assert expr_values[":cr"]["score"] == 85


# ── Invalid conversation ID ───────────────────────────────────────────


class TestInvalidConversationId:
    @patch("analyze_conversation.check_user_access")
    def test_bad_uuid(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from analyze_conversation import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"conversationId": "not-a-uuid"}), None)

    @patch("analyze_conversation.check_user_access")
    def test_empty_string(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from analyze_conversation import handler
        with pytest.raises(Exception):
            handler(make_event(arguments={"conversationId": ""}), None)

    @patch("analyze_conversation.check_user_access")
    def test_missing_conversation_id(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from analyze_conversation import handler
        with pytest.raises(Exception):
            handler(make_event(arguments={}), None)


# ── Missing challenge data handled ────────────────────────────────────


class TestMissingChallengeData:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_no_quest_found(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv(quest_id=VALID_UUID_2)}
        mock_quests.get_item.return_value = {}  # Quest not found
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is True  # Should still work

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_quest_with_no_matching_stage(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv(quest_id=VALID_UUID_2, stage_id="nonexistent")}
        mock_quests.get_item.return_value = {"Item": _make_quest(stages=[{"id": "other", "title": "Other"}])}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is True

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_stage_with_no_challenge(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv(quest_id=VALID_UUID_2, stage_id="s1")}
        mock_quests.get_item.return_value = {"Item": _make_quest(stages=[{"id": "s1", "title": "Stage 1"}])}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is True


# ── Empty transcript handled ──────────────────────────────────────────


class TestEmptyTranscriptHandled:
    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_empty_array_transcript(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_convs.get_item.return_value = {"Item": _make_conv(transcript="[]")}
        mock_quests.get_item.return_value = {}
        mock_bedrock.converse.return_value = make_bedrock_response(FAILED_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is False

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_transcript_stored_as_list(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        """Transcript already parsed as list (not string) in DynamoDB."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv = _make_conv()
        conv["transcript"] = [{"role": "user", "text": "Hello"}]  # Already a list
        mock_convs.get_item.return_value = {"Item": conv}
        mock_quests.get_item.return_value = {}
        mock_bedrock.converse.return_value = make_bedrock_response(GOOD_ANALYSIS)

        from analyze_conversation import handler
        result = handler(make_event(arguments={"conversationId": VALID_UUID}), None)
        assert result["passed"] is True
