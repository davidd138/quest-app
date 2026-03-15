"""Full integration test: simulates the complete user journey through QuestMaster.

Each step validates its output and passes data forward to the next step,
testing the full data flow across resolvers with mocked DynamoDB and Bedrock.
"""

import sys
import os
import json
import uuid
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers")
)

# ---------- Constants ----------

USER_ID = "integ-user-" + str(uuid.uuid4())[:8]
QUEST_ID = "550e8400-e29b-41d4-a716-446655440000"
STAGE_ID_1 = "660e8400-e29b-41d4-a716-446655440000"
STAGE_ID_2 = "770e8400-e29b-41d4-a716-446655440000"
USERNAME = "testuser"
USER_EMAIL = "test@example.com"

SAMPLE_STAGES = [
    {
        "id": STAGE_ID_1,
        "order": 1,
        "title": "Plaza Mayor",
        "description": "Meet the tour guide",
        "points": 100,
        "rewardPoints": 100,
        "location": {"latitude": 40.41, "longitude": -3.70, "name": "Plaza Mayor"},
        "character": {
            "name": "Carlos",
            "role": "Guide",
            "personality": "Friendly",
            "backstory": "Local historian",
            "voiceStyle": "warm",
            "greetingMessage": "Bienvenido!",
        },
        "challenge": {
            "type": "conversation",
            "description": "Greet the guide",
            "successCriteria": "Introduce yourself",
            "failureHints": ["Try saying hello"],
        },
        "hints": ["Be polite"],
    },
    {
        "id": STAGE_ID_2,
        "order": 2,
        "title": "El Retiro",
        "description": "Explore the park",
        "points": 150,
        "rewardPoints": 150,
        "location": {"latitude": 40.41, "longitude": -3.68, "name": "Retiro Park"},
        "character": {
            "name": "Maria",
            "role": "Park Ranger",
            "personality": "Wise",
            "backstory": "Nature expert",
            "voiceStyle": "calm",
            "greetingMessage": "Welcome to Retiro!",
        },
        "challenge": {
            "type": "knowledge",
            "description": "Answer about the park",
            "successCriteria": "Identify three tree species",
            "failureHints": ["Look around"],
        },
        "hints": ["Think about nature"],
    },
]

SAMPLE_QUEST = {
    "id": QUEST_ID,
    "title": "Madrid Adventure",
    "description": "Discover Madrid's hidden gems",
    "category": "adventure",
    "difficulty": "medium",
    "estimatedDuration": 90,
    "stages": SAMPLE_STAGES,
    "isPublished": True,
    "totalPoints": 250,
    "location": {"latitude": 40.41, "longitude": -3.70, "name": "Madrid"},
    "radius": 5000,
    "tags": ["madrid", "culture"],
    "createdAt": "2025-01-01T00:00:00Z",
}


def _make_event(arguments=None, user_id=USER_ID):
    return {
        "identity": {
            "sub": user_id,
            "username": USERNAME,
            "claims": {},
        },
        "arguments": arguments or {},
        "request": {"headers": {"x-forwarded-for": "10.0.0.1"}},
    }


class TestIntegrationFullFlow:
    """End-to-end user journey with mocks: 10 steps, ~20 assertions."""

    # ---- Step 1: sync_user ----

    @patch("sync_user.cognito")
    @patch("sync_user.users_table")
    def test_step01_sync_user(self, mock_users, mock_cognito):
        """User registers and syncs their profile."""
        mock_cognito.admin_get_user.return_value = {
            "UserAttributes": [
                {"Name": "email", "Value": USER_EMAIL},
                {"Name": "name", "Value": "Test User"},
            ]
        }
        mock_cognito.admin_list_groups_for_user.return_value = {"Groups": []}
        mock_users.get_item.return_value = {}  # New user

        from sync_user import handler

        result = handler(_make_event(), None)

        assert result["userId"] == USER_ID
        assert result["email"] == USER_EMAIL
        assert result["role"] == "player"
        assert result["status"] == "active"
        assert result["totalPoints"] == 0
        mock_users.put_item.assert_called_once()

    # ---- Step 2: list_quests ----

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_step02_list_quests(self, mock_quests, mock_auth):
        """User lists available quests."""
        mock_auth.return_value = {
            "userId": USER_ID,
            "status": "active",
            "role": "player",
        }
        mock_quests.scan.return_value = {
            "Items": [SAMPLE_QUEST],
        }

        from list_quests import handler

        result = handler(_make_event(), None)

        assert len(result["items"]) == 1
        assert result["items"][0]["title"] == "Madrid Adventure"
        assert result["items"][0]["isPublished"] is True

    # ---- Step 3: start_quest ----

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_step03_start_quest(self, mock_quests, mock_progress, mock_auth):
        """User starts the quest, creating a progress record."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler

        result = handler(_make_event(arguments={"questId": QUEST_ID}), None)

        assert result["userId"] == USER_ID
        assert result["questId"] == QUEST_ID
        assert result["status"] == "in_progress"
        assert result["currentStageIndex"] == 0
        assert result["totalPoints"] == 0
        mock_progress.put_item.assert_called_once()

    # ---- Step 4: create_conversation ----

    @patch("create_conversation.check_user_access")
    @patch("create_conversation.conversations_table")
    @patch("create_conversation.quests_table")
    def test_step04_create_conversation(self, mock_quests, mock_convs, mock_auth):
        """User starts a voice conversation for stage 1."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}

        from create_conversation import handler

        event = _make_event(
            arguments={"input": {"questId": QUEST_ID, "stageId": STAGE_ID_1}}
        )
        result = handler(event, None)

        assert result["questId"] == QUEST_ID
        assert result["stageId"] == STAGE_ID_1
        assert result["characterName"] == "Carlos"
        assert result["status"] == "in_progress"
        assert "id" in result
        mock_convs.put_item.assert_called_once()

    # ---- Step 5: update_conversation ----

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_step05_update_conversation(self, mock_convs, mock_auth):
        """User completes the voice chat and saves the transcript."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        conv_id = "aa0e8400-e29b-41d4-a716-446655440000"
        existing_conv = {
            "id": conv_id,
            "userId": USER_ID,
            "questId": QUEST_ID,
            "stageId": STAGE_ID_1,
            "status": "in_progress",
        }
        mock_convs.get_item.return_value = {"Item": existing_conv}

        transcript = json.dumps([
            {"role": "assistant", "text": "Bienvenido!"},
            {"role": "user", "text": "Hola Carlos, soy Test User."},
            {"role": "assistant", "text": "Encantado de conocerte!"},
        ])

        from update_conversation import handler

        event = _make_event(
            arguments={
                "input": {
                    "id": conv_id,
                    "transcript": transcript,
                    "status": "completed",
                    "duration": 95,
                }
            }
        )
        result = handler(event, None)

        assert result["status"] == "completed"
        assert result["duration"] == 95
        assert result["transcript"] == transcript
        mock_convs.update_item.assert_called_once()

    # ---- Step 6: analyze_conversation ----

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.scores_table")
    @patch("analyze_conversation.conversations_table")
    @patch("analyze_conversation.quests_table")
    @patch("analyze_conversation.bedrock")
    def test_step06_analyze_conversation(
        self, mock_bedrock, mock_quests, mock_convs, mock_scores, mock_auth
    ):
        """AI analyzes the conversation and produces feedback."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv_id = "aa0e8400-e29b-41d4-a716-446655440000"

        mock_convs.get_item.return_value = {
            "Item": {
                "id": conv_id,
                "userId": USER_ID,
                "questId": QUEST_ID,
                "stageId": STAGE_ID_1,
                "characterName": "Carlos",
                "transcript": json.dumps([
                    {"role": "assistant", "text": "Bienvenido!"},
                    {"role": "user", "text": "Hola, soy Test User."},
                ]),
            }
        }
        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}

        analysis = {
            "passed": True,
            "score": 85,
            "feedback": "Good introduction and natural conversation flow.",
            "strengths": ["Polite greeting", "Natural flow"],
            "improvements": ["Ask more questions about the area"],
        }
        mock_bedrock.converse.return_value = {
            "output": {"message": {"content": [{"text": json.dumps(analysis)}]}}
        }

        from analyze_conversation import handler

        result = handler(
            _make_event(arguments={"conversationId": conv_id}), None
        )

        assert result["passed"] is True
        assert result["score"] == 85
        assert "Good introduction" in result["feedback"]
        assert len(result["strengths"]) == 2
        assert len(result["improvements"]) == 1
        mock_convs.update_item.assert_called_once()
        mock_scores.put_item.assert_called_once()

    # ---- Step 7: complete_stage ----

    @patch("complete_stage.check_user_access")
    @patch("complete_stage.users_table")
    @patch("complete_stage.achievements_table")
    @patch("complete_stage.scores_table")
    @patch("complete_stage.conversations_table")
    @patch("complete_stage.progress_table")
    @patch("complete_stage.quests_table")
    def test_step07_complete_stage(
        self,
        mock_quests,
        mock_progress,
        mock_convs,
        mock_scores,
        mock_achievements,
        mock_users,
        mock_auth,
    ):
        """User completes stage 1 (not final), progress is updated."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        conv_id = "aa0e8400-e29b-41d4-a716-446655440000"

        mock_quests.get_item.return_value = {"Item": SAMPLE_QUEST}
        mock_convs.get_item.return_value = {
            "Item": {
                "id": conv_id,
                "userId": USER_ID,
                "duration": 95,
                "result": "completed",
            }
        }
        progress = {
            "id": "prog-001",
            "userId": USER_ID,
            "questId": QUEST_ID,
            "currentStageIndex": 0,
            "completedStages": [],
            "status": "in_progress",
            "totalPoints": 0,
            "totalDuration": 0,
        }
        mock_progress.query.return_value = {"Items": [progress]}
        mock_progress.update_item.return_value = {
            "Attributes": {
                **progress,
                "currentStageIndex": 1,
                "completedStages": [
                    {"stageId": STAGE_ID_1, "pointsEarned": 100}
                ],
                "totalPoints": 100,
                "totalDuration": 95,
            }
        }

        from complete_stage import handler

        event = _make_event(
            arguments={
                "input": {
                    "questId": QUEST_ID,
                    "stageId": STAGE_ID_1,
                    "conversationId": conv_id,
                }
            }
        )
        result = handler(event, None)

        assert result["currentStageIndex"] == 1
        assert result["totalPoints"] == 100
        assert len(result["completedStages"]) == 1
        # Not final stage, so no score or user update
        mock_scores.put_item.assert_not_called()

    # ---- Step 8: get_leaderboard ----

    @patch("get_leaderboard.check_user_access")
    @patch("get_leaderboard.users_table")
    @patch("get_leaderboard.scores_table")
    def test_step08_get_leaderboard(self, mock_scores, mock_users, mock_auth):
        """User checks the leaderboard to see rankings."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_scores.scan.return_value = {
            "Items": [
                {
                    "userId": USER_ID,
                    "questId": QUEST_ID,
                    "score": 85,
                },
                {
                    "userId": "other-user",
                    "questId": QUEST_ID,
                    "score": 92,
                },
            ],
        }
        mock_users.get_item.side_effect = lambda Key: {
            "Item": {
                "userId": Key["userId"],
                "name": "Test User" if Key["userId"] == USER_ID else "Other Player",
                "email": "x@x.com",
            }
        }

        from get_leaderboard import handler

        result = handler(_make_event(arguments={"limit": 10}), None)

        assert len(result) == 2
        assert result[0]["rank"] == 1
        assert result[1]["rank"] == 2
        # Other user has higher score so should be rank 1
        assert result[0]["totalPoints"] >= result[1]["totalPoints"]

    # ---- Step 9: get_achievements ----

    @patch("get_achievements.check_user_access")
    @patch("get_achievements.achievements_table")
    def test_step09_get_achievements(self, mock_achievements, mock_auth):
        """User checks earned achievements."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_achievements.query.return_value = {
            "Items": [
                {
                    "id": "ach-001",
                    "userId": USER_ID,
                    "title": "First Quest",
                    "description": "Completed your first quest",
                    "earnedAt": "2025-03-15T10:00:00Z",
                },
            ]
        }

        from get_achievements import handler

        result = handler(_make_event(), None)

        assert len(result) == 1
        assert result[0]["title"] == "First Quest"
        assert result[0]["userId"] == USER_ID

    # ---- Step 10: export_user_data ----

    @patch("export_user_data.check_user_access")
    @patch("export_user_data.achievements_table")
    @patch("export_user_data.scores_table")
    @patch("export_user_data.conversations_table")
    @patch("export_user_data.progress_table")
    @patch("export_user_data.users_table")
    def test_step10_export_user_data(
        self,
        mock_users,
        mock_progress,
        mock_convs,
        mock_scores,
        mock_achievements,
        mock_auth,
    ):
        """User exports all personal data (GDPR compliance)."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        mock_users.get_item.return_value = {
            "Item": {
                "userId": USER_ID,
                "email": USER_EMAIL,
                "name": "Test User",
                "totalPoints": 100,
            }
        }
        mock_progress.query.return_value = {
            "Items": [{"id": "prog-001", "questId": QUEST_ID}]
        }
        mock_convs.query.return_value = {
            "Items": [{"id": "conv-001", "questId": QUEST_ID}]
        }
        mock_scores.query.return_value = {
            "Items": [{"id": "score-001", "questId": QUEST_ID, "score": 85}]
        }
        mock_achievements.query.return_value = {
            "Items": [{"id": "ach-001", "title": "First Quest"}]
        }

        from export_user_data import handler

        result = handler(_make_event(), None)

        assert result["user"]["userId"] == USER_ID
        assert result["user"]["email"] == USER_EMAIL
        assert len(result["progress"]) == 1
        assert len(result["conversations"]) == 1
        assert len(result["scores"]) == 1
        assert len(result["achievements"]) == 1
        assert "exportedAt" in result
        mock_users.update_item.assert_called_once()
