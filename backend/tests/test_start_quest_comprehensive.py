"""Comprehensive tests for start_quest resolver — covers existing progress, field defaults, validation."""
import sys
import os
import json
import uuid
import pytest
from unittest.mock import patch, MagicMock, ANY
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
VALID_UUID_3 = "770e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-test-123"


def make_event(user_id=USER_ID, quest_id=VALID_UUID):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": {"questId": quest_id},
    }


def make_published_quest(quest_id=VALID_UUID, published=True, stages=None):
    item = {"id": quest_id, "isPublished": published, "title": "Test Quest"}
    if stages is not None:
        item["stages"] = stages
    return item


def make_progress(user_id=USER_ID, quest_id=VALID_UUID, status="in_progress", stage_index=0):
    return {
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "questId": quest_id,
        "currentStageIndex": stage_index,
        "completedStages": [],
        "status": status,
        "startedAt": "2025-01-01T00:00:00+00:00",
        "totalPoints": 0,
        "totalDuration": 0,
    }


# ── Returns existing progress ────────────────────────────────────────

class TestExistingProgress:
    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_returns_existing_in_progress(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        existing = make_progress()
        mock_progress.query.return_value = {"Items": [existing]}

        from start_quest import handler
        result = handler(make_event(), None)

        assert result == existing
        mock_progress.put_item.assert_not_called()

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_returns_existing_with_partial_completion(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        existing = make_progress(stage_index=3)
        existing["completedStages"] = [{"stageId": "s1"}, {"stageId": "s2"}, {"stageId": "s3"}]
        existing["totalPoints"] = 300
        mock_progress.query.return_value = {"Items": [existing]}

        from start_quest import handler
        result = handler(make_event(), None)

        assert result["currentStageIndex"] == 3
        assert result["totalPoints"] == 300
        assert len(result["completedStages"]) == 3
        mock_progress.put_item.assert_not_called()

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_returns_first_if_multiple_progress_records(self, mock_quests, mock_progress, mock_auth):
        """Edge case: multiple progress records exist — returns the first."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        p1 = make_progress()
        p1["id"] = "first"
        p2 = make_progress()
        p2["id"] = "second"
        mock_progress.query.return_value = {"Items": [p1, p2]}

        from start_quest import handler
        result = handler(make_event(), None)

        assert result["id"] == "first"
        mock_progress.put_item.assert_not_called()


# ── Creates new progress ──────────────────────────────────────────────

class TestNewProgress:
    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_creates_progress_with_correct_fields(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)

        assert result["userId"] == USER_ID
        assert result["questId"] == VALID_UUID
        assert result["status"] == "in_progress"
        assert result["currentStageIndex"] == 0
        assert result["completedStages"] == []
        assert result["totalPoints"] == 0
        assert result["totalDuration"] == 0
        assert "startedAt" in result
        assert "id" in result
        mock_progress.put_item.assert_called_once()

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_initial_stage_index_is_zero(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)
        assert result["currentStageIndex"] == 0

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_initial_completed_stages_is_empty(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)
        assert result["completedStages"] == []

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_initial_total_points_is_zero(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)
        assert result["totalPoints"] == 0

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_initial_total_duration_is_zero(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)
        assert result["totalDuration"] == 0

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_started_at_is_set_to_current_time(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        before = datetime.now(timezone.utc).isoformat()
        result = handler(make_event(), None)
        after = datetime.now(timezone.utc).isoformat()

        assert result["startedAt"] >= before
        assert result["startedAt"] <= after

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_id_is_valid_uuid(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)
        # Should not raise
        uuid.UUID(result["id"])

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_put_item_called_with_correct_item(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result = handler(make_event(), None)

        call_kwargs = mock_progress.put_item.call_args
        item = call_kwargs[1]["Item"] if "Item" in (call_kwargs[1] if call_kwargs[1] else {}) else call_kwargs[0][0] if call_kwargs[0] else call_kwargs[1].get("Item") or call_kwargs.kwargs.get("Item")
        assert item["userId"] == USER_ID
        assert item["questId"] == VALID_UUID

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_each_call_generates_unique_id(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        result1 = handler(make_event(), None)
        result2 = handler(make_event(), None)
        assert result1["id"] != result2["id"]


# ── Quest must be published ───────────────────────────────────────────

class TestQuestPublished:
    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_unpublished_quest_rejected(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest(published=False)}

        from start_quest import handler
        with pytest.raises(Exception, match="Quest is not available"):
            handler(make_event(), None)

    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_missing_is_published_field_rejected(self, mock_quests, mock_auth):
        """If isPublished is not present, it should be treated as not published."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        quest = {"id": VALID_UUID, "title": "No publish field"}
        mock_quests.get_item.return_value = {"Item": quest}

        from start_quest import handler
        with pytest.raises(Exception, match="Quest is not available"):
            handler(make_event(), None)

    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_is_published_none_rejected(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": {"id": VALID_UUID, "isPublished": None}}

        from start_quest import handler
        with pytest.raises(Exception, match="Quest is not available"):
            handler(make_event(), None)


# ── Quest must exist ──────────────────────────────────────────────────

class TestQuestExists:
    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_quest_not_found_raises(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {}

        from start_quest import handler
        with pytest.raises(Exception, match="Quest not found"):
            handler(make_event(), None)

    @patch("start_quest.check_user_access")
    @patch("start_quest.quests_table")
    def test_quest_not_found_empty_item(self, mock_quests, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": None}

        from start_quest import handler
        with pytest.raises(Exception):
            handler(make_event(), None)


# ── Invalid questId ───────────────────────────────────────────────────

class TestInvalidQuestId:
    @patch("start_quest.check_user_access")
    def test_non_uuid_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(quest_id="not-a-uuid"), None)

    @patch("start_quest.check_user_access")
    def test_empty_string_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        with pytest.raises(Exception, match="must be a non-empty string"):
            handler(make_event(quest_id=""), None)

    @patch("start_quest.check_user_access")
    def test_none_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        event = {"identity": {"sub": USER_ID, "claims": {}}, "arguments": {"questId": None}}
        with pytest.raises(Exception):
            handler(event, None)

    @patch("start_quest.check_user_access")
    def test_numeric_quest_id_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(quest_id="999"), None)

    @patch("start_quest.check_user_access")
    def test_sql_injection_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(quest_id="'; DROP TABLE quests;--"), None)

    @patch("start_quest.check_user_access")
    def test_xss_payload_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(quest_id="<script>alert(1)</script>"), None)

    @patch("start_quest.check_user_access")
    def test_partial_uuid_rejected(self, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        from start_quest import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(quest_id="550e8400-e29b-41d4"), None)


# ── DynamoDB query parameters ─────────────────────────────────────────

class TestQueryParameters:
    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_queries_correct_index(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        handler(make_event(), None)

        call_kwargs = mock_progress.query.call_args
        assert call_kwargs[1]["IndexName"] == "userId-questId-index"

    @patch("start_quest.check_user_access")
    @patch("start_quest.progress_table")
    @patch("start_quest.quests_table")
    def test_gets_quest_by_id(self, mock_quests, mock_progress, mock_auth):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_quests.get_item.return_value = {"Item": make_published_quest()}
        mock_progress.query.return_value = {"Items": []}

        from start_quest import handler
        handler(make_event(), None)

        mock_quests.get_item.assert_called_once_with(Key={"id": VALID_UUID})
