"""End-to-end tests: full quest flow with mocked DynamoDB and Bedrock.

Marked with @pytest.mark.e2e so they are skipped by default.
Run with: pytest -m e2e
"""
import sys
import os
import json
import uuid
import pytest
from unittest.mock import patch, MagicMock, call
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

QUEST_ID = "550e8400-e29b-41d4-a716-446655440000"
STAGE_ID_1 = "660e8400-e29b-41d4-a716-446655440000"
STAGE_ID_2 = "770e8400-e29b-41d4-a716-446655440000"
USER_ID = "e2e-user-001"
ADMIN_ID = "e2e-admin-001"


def make_user_event(arguments=None):
    return {
        "identity": {"sub": USER_ID, "claims": {}},
        "arguments": arguments or {},
    }


def make_admin_event(arguments=None):
    return {
        "identity": {
            "sub": ADMIN_ID,
            "claims": {"cognito:groups": ["admins"]},
        },
        "arguments": arguments or {},
    }


SAMPLE_QUEST_INPUT = {
    "title": "E2E Test Quest",
    "description": "An end-to-end test quest with two stages.",
    "category": "adventure",
    "difficulty": "easy",
    "estimatedDuration": 1800,
    "stages": [
        {
            "id": STAGE_ID_1,
            "order": 1,
            "title": "Stage One",
            "description": "The first stage",
            "points": 100,
            "location": {"latitude": 40.7, "longitude": -73.9, "name": "NYC"},
            "character": {
                "name": "TestChar",
                "role": "Guide",
                "personality": "Friendly",
                "backstory": "A test character",
                "voiceStyle": "calm",
                "greetingMessage": "Hello!",
            },
            "challenge": {
                "type": "conversation",
                "description": "Have a chat",
                "successCriteria": "Say hello",
                "failureHints": ["Try greeting them"],
                "maxAttempts": 3,
            },
            "hints": ["Say hi"],
        },
        {
            "id": STAGE_ID_2,
            "order": 2,
            "title": "Stage Two",
            "description": "The second stage",
            "points": 150,
            "location": {"latitude": 40.71, "longitude": -73.91, "name": "Brooklyn"},
            "character": {
                "name": "TestChar2",
                "role": "Mentor",
                "personality": "Wise",
                "backstory": "Another test character",
                "voiceStyle": "calm",
                "greetingMessage": "Greetings!",
            },
            "challenge": {
                "type": "knowledge",
                "description": "Answer a question",
                "successCriteria": "Correct answer",
                "failureHints": ["Think harder"],
                "maxAttempts": 3,
            },
            "hints": ["Study up"],
        },
    ],
    "location": {"latitude": 40.7, "longitude": -73.9, "name": "NYC"},
    "radius": 1000,
    "tags": ["test"],
    "isPublished": True,
}


@pytest.mark.e2e
class TestFullQuestFlow:
    """Test the full flow: create quest -> start -> create conversation ->
    update conversation -> analyze -> complete stage."""

    @patch("create_quest.check_admin_access")
    @patch("create_quest.quests_table")
    def test_step1_create_quest(self, mock_quests, mock_admin):
        """Admin creates a quest."""
        mock_admin.return_value = True

        from create_quest import handler
        event = make_admin_event(arguments={"input": SAMPLE_QUEST_INPUT})
        result = handler(event, None)

        assert result["title"] == "E2E Test Quest"
        assert result["category"] == "adventure"
        assert len(result["stages"]) == 2
        assert result["totalPoints"] == 250
        assert result["isPublished"] is True
        mock_quests.put_item.assert_called_once()

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_step2_start_quest(self, mock_quests, mock_progress, mock_auth):
        """User starts the quest."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {
            "Item": {
                "id": QUEST_ID,
                "isPublished": True,
                "stages": SAMPLE_QUEST_INPUT["stages"],
            }
        }
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_user_event(arguments={"questId": QUEST_ID}), None)

        assert result["userId"] == USER_ID
        assert result["questId"] == QUEST_ID
        assert result["status"] == "in_progress"
        assert result["currentStageIndex"] == 0
        mock_progress.put_item.assert_called_once()

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_step3_create_conversation(self, mock_quests, mock_convs, mock_auth):
        """User creates a conversation for stage 1."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {
            "Item": {
                "id": QUEST_ID,
                "stages": SAMPLE_QUEST_INPUT["stages"],
            }
        }

        from create_conversation import handler
        event = make_user_event(arguments={
            "input": {"questId": QUEST_ID, "stageId": STAGE_ID_1}
        })
        result = handler(event, None)

        assert result["questId"] == QUEST_ID
        assert result["stageId"] == STAGE_ID_1
        assert result["characterName"] == "TestChar"
        assert result["status"] == "in_progress"
        mock_convs.put_item.assert_called_once()

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_step4_update_conversation(self, mock_convs, mock_auth):
        """User updates the conversation with transcript and completes it."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv_id = "aa0e8400-e29b-41d4-a716-446655440000"
        conv = {
            "id": conv_id,
            "userId": USER_ID,
            "questId": QUEST_ID,
            "stageId": STAGE_ID_1,
            "status": "in_progress",
        }
        mock_convs.get_item.return_value = {"Item": conv}

        transcript = json.dumps([
            {"role": "assistant", "text": "Hello!"},
            {"role": "user", "text": "Hi TestChar, I am excited to start!"},
            {"role": "assistant", "text": "Wonderful, let us begin."},
        ])

        from update_conversation import handler
        event = make_user_event(arguments={
            "input": {
                "id": conv_id,
                "transcript": transcript,
                "status": "completed",
                "duration": 120,
            }
        })
        result = handler(event, None)

        assert result["transcript"] == transcript
        assert result["status"] == "completed"
        assert result["duration"] == 120
        mock_convs.update_item.assert_called_once()

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_step5_analyze_conversation(self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth):
        """Analyze the completed conversation."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv_id = "aa0e8400-e29b-41d4-a716-446655440000"
        conv = {
            "id": conv_id,
            "userId": USER_ID,
            "questId": QUEST_ID,
            "stageId": STAGE_ID_1,
            "characterName": "TestChar",
            "transcript": json.dumps([
                {"role": "assistant", "text": "Hello!"},
                {"role": "user", "text": "Hi, I greet you warmly!"},
            ]),
        }
        mock_convs.get_item.return_value = {"Item": conv}
        mock_quests.get_item.return_value = {
            "Item": {
                "id": QUEST_ID,
                "title": "E2E Test Quest",
                "description": "Test",
                "stages": SAMPLE_QUEST_INPUT["stages"],
            }
        }

        analysis = {
            "passed": True,
            "score": 90,
            "feedback": "Excellent greeting and engagement.",
            "strengths": ["Warm greeting", "Enthusiasm"],
            "improvements": ["Could ask more questions"],
        }
        mock_bedrock.converse.return_value = {
            "output": {"message": {"content": [{"text": json.dumps(analysis)}]}}
        }

        from analyze_conversation import handler
        event = make_user_event(arguments={"conversationId": conv_id})
        result = handler(event, None)

        assert result["passed"] is True
        assert result["score"] == 90
        assert "Excellent" in result["feedback"]
        mock_convs.update_item.assert_called_once()
        mock_scores.put_item.assert_called_once()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_step6_complete_stage(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Complete stage 1 of the quest."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv_id = "aa0e8400-e29b-41d4-a716-446655440000"

        mock_quests.get_item.return_value = {
            "Item": {
                "id": QUEST_ID,
                "title": "E2E Test Quest",
                "stages": [
                    {"id": STAGE_ID_1, "title": "Stage One", "rewardPoints": 100},
                    {"id": STAGE_ID_2, "title": "Stage Two", "rewardPoints": 150},
                ],
            }
        }
        mock_convs.get_item.return_value = {
            "Item": {
                "id": conv_id,
                "userId": USER_ID,
                "duration": 120,
                "result": "completed",
            }
        }

        progress = {
            "id": "progress-001",
            "userId": USER_ID,
            "questId": QUEST_ID,
            "currentStageIndex": 0,
            "completedStages": [],
            "status": "in_progress",
            "totalPoints": 0,
            "totalDuration": 0,
        }
        mock_progress.query.return_value = {"Items": [progress]}

        updated_progress = {
            **progress,
            "currentStageIndex": 1,
            "completedStages": [{"stageId": STAGE_ID_1, "pointsEarned": 100}],
            "totalPoints": 100,
            "totalDuration": 120,
        }
        mock_progress.update_item.return_value = {"Attributes": updated_progress}

        from complete_stage import handler
        event = make_user_event(arguments={
            "input": {
                "questId": QUEST_ID,
                "stageId": STAGE_ID_1,
                "conversationId": conv_id,
            }
        })
        result = handler(event, None)

        assert result["totalPoints"] == 100
        assert result["currentStageIndex"] == 1
        assert len(result["completedStages"]) == 1
        # Quest not fully complete (2 stages), so no score created
        mock_scores.put_item.assert_not_called()

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_step7_complete_final_stage(
        self, mock_quests, mock_progress, mock_convs, mock_scores,
        mock_achievements, mock_users, mock_auth
    ):
        """Complete the final stage, triggering score creation and achievement check."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv_id_2 = "bb0e8400-e29b-41d4-a716-446655440000"

        mock_quests.get_item.return_value = {
            "Item": {
                "id": QUEST_ID,
                "title": "E2E Test Quest",
                "stages": [
                    {"id": STAGE_ID_1, "title": "Stage One", "rewardPoints": 100},
                    {"id": STAGE_ID_2, "title": "Stage Two", "rewardPoints": 150},
                ],
            }
        }
        mock_convs.get_item.return_value = {
            "Item": {
                "id": conv_id_2,
                "userId": USER_ID,
                "duration": 180,
                "result": "completed",
            }
        }

        # Progress already has stage 1 completed
        progress = {
            "id": "progress-001",
            "userId": USER_ID,
            "questId": QUEST_ID,
            "currentStageIndex": 1,
            "completedStages": [
                {"stageId": STAGE_ID_1, "pointsEarned": 100},
            ],
            "status": "in_progress",
            "totalPoints": 100,
            "totalDuration": 120,
        }
        mock_progress.query.return_value = {"Items": [progress]}

        updated_progress = {
            **progress,
            "currentStageIndex": 2,
            "completedStages": [
                {"stageId": STAGE_ID_1, "pointsEarned": 100},
                {"stageId": STAGE_ID_2, "pointsEarned": 150},
            ],
            "status": "completed",
            "totalPoints": 250,
            "totalDuration": 300,
        }
        mock_progress.update_item.return_value = {"Attributes": updated_progress}

        # User has completed 1 quest total (triggers "First Quest" achievement)
        mock_users.get_item.return_value = {
            "Item": {"userId": USER_ID, "questsCompleted": 1}
        }

        from complete_stage import handler
        event = make_user_event(arguments={
            "input": {
                "questId": QUEST_ID,
                "stageId": STAGE_ID_2,
                "conversationId": conv_id_2,
            }
        })
        result = handler(event, None)

        assert result["status"] == "completed"
        assert result["totalPoints"] == 250

        # Score should be created
        mock_scores.put_item.assert_called_once()
        score_item = mock_scores.put_item.call_args[1]["Item"]
        assert score_item["userId"] == USER_ID
        assert score_item["questId"] == QUEST_ID
        assert score_item["totalPoints"] == 250

        # User stats should be updated
        mock_users.update_item.assert_called_once()

        # Achievement should be created (questsCompleted=1 matches milestone)
        mock_achievements.put_item.assert_called_once()
        achievement = mock_achievements.put_item.call_args[1]["Item"]
        assert achievement["title"] == "First Quest"
        assert achievement["userId"] == USER_ID
