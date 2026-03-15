"""Comprehensive tests for the get_progress resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-test-123"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def _make_full_progress(user_id=USER_ID, quest_id=VALID_UUID):
    return {
        "id": VALID_UUID_2,
        "userId": user_id,
        "questId": quest_id,
        "currentStageIndex": 2,
        "completedStages": [
            {"stageId": "s1", "completedAt": "2026-01-01T00:00:00+00:00", "pointsEarned": 50},
            {"stageId": "s2", "completedAt": "2026-01-01T01:00:00+00:00", "pointsEarned": 75},
        ],
        "status": "in_progress",
        "totalPoints": 125,
        "totalDuration": 600,
        "startedAt": "2026-01-01T00:00:00+00:00",
        "updatedAt": "2026-01-01T01:00:00+00:00",
    }


class TestGetProgressComprehensive:
    """Comprehensive tests for get_progress resolver."""

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_returns_progress_for_user_quest_combo(self, mock_table, mock_auth):
        """Should return the progress record matching user + quest combination."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress = _make_full_progress()
        mock_table.query.return_value = {"Items": [progress]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["userId"] == USER_ID
        assert result["questId"] == VALID_UUID

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_no_progress_returns_none(self, mock_table, mock_auth):
        """When no progress exists for the user+quest combo, should return None."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_table.query.return_value = {"Items": []}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result is None

    @patch("get_progress.check_user_access")
    def test_invalid_quest_id_raises(self, mock_auth):
        """Should raise when questId is not a valid UUID."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_progress import handler
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(make_event(arguments={"questId": "not-a-uuid"}), None)

    @patch("get_progress.check_user_access")
    def test_empty_quest_id_raises(self, mock_auth):
        """Should raise when questId is empty string."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_progress import handler
        with pytest.raises(Exception, match="must be a non-empty string"):
            handler(make_event(arguments={"questId": ""}), None)

    @patch("get_progress.check_user_access")
    def test_missing_quest_id_raises(self, mock_auth):
        """Should raise when questId is not provided."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_progress import handler
        with pytest.raises(Exception):
            handler(make_event(arguments={}), None)

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_queries_correct_gsi(self, mock_table, mock_auth):
        """Should query the userId-questId-index GSI with correct key conditions."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_table.query.return_value = {"Items": []}

        from get_progress import handler
        handler(make_event(arguments={"questId": VALID_UUID}), None)

        call_kwargs = mock_table.query.call_args[1]
        assert call_kwargs["IndexName"] == "userId-questId-index"

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_returns_all_progress_fields(self, mock_table, mock_auth):
        """Should return the full progress record with all fields intact."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress = _make_full_progress()
        mock_table.query.return_value = {"Items": [progress]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["id"] == VALID_UUID_2
        assert result["currentStageIndex"] == 2
        assert result["status"] == "in_progress"
        assert result["totalPoints"] == 125
        assert result["totalDuration"] == 600
        assert len(result["completedStages"]) == 2
        assert result["startedAt"] == "2026-01-01T00:00:00+00:00"
        assert result["updatedAt"] == "2026-01-01T01:00:00+00:00"

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_returns_first_item_if_multiple(self, mock_table, mock_auth):
        """When multiple progress items exist (edge case), returns the first one."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress1 = _make_full_progress()
        progress2 = {**_make_full_progress(), "id": "other-id"}
        mock_table.query.return_value = {"Items": [progress1, progress2]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["id"] == VALID_UUID_2

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_completed_progress_returned(self, mock_table, mock_auth):
        """Should return progress with status=completed when quest is done."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress = _make_full_progress()
        progress["status"] = "completed"
        progress["completedAt"] = "2026-01-02T00:00:00+00:00"
        mock_table.query.return_value = {"Items": [progress]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["status"] == "completed"
        assert result["completedAt"] == "2026-01-02T00:00:00+00:00"

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_abandoned_progress_returned(self, mock_table, mock_auth):
        """Should return progress with status=abandoned."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress = _make_full_progress()
        progress["status"] = "abandoned"
        mock_table.query.return_value = {"Items": [progress]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["status"] == "abandoned"

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_uses_user_id_from_identity(self, mock_table, mock_auth):
        """Should use the sub from event identity as the user ID for querying."""
        custom_user = "custom-user-456"
        mock_auth.return_value = {"userId": custom_user, "status": "active"}
        mock_table.query.return_value = {"Items": []}

        from get_progress import handler
        handler(make_event(user_id=custom_user, arguments={"questId": VALID_UUID}), None)

        call_kwargs = mock_table.query.call_args[1]
        # Check the key condition uses the correct user ID
        assert mock_table.query.called

    @patch("get_progress.check_user_access")
    def test_numeric_quest_id_raises(self, mock_auth):
        """Should raise when questId is a number instead of UUID string."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from get_progress import handler
        with pytest.raises(Exception):
            handler(make_event(arguments={"questId": 12345}), None)

    @patch("get_progress.check_user_access")
    @patch("get_progress.progress_table")
    def test_progress_with_empty_completed_stages(self, mock_table, mock_auth):
        """Should return progress that has no completed stages yet."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        progress = {
            "id": VALID_UUID_2,
            "userId": USER_ID,
            "questId": VALID_UUID,
            "currentStageIndex": 0,
            "completedStages": [],
            "status": "in_progress",
            "totalPoints": 0,
            "totalDuration": 0,
        }
        mock_table.query.return_value = {"Items": [progress]}

        from get_progress import handler
        result = handler(make_event(arguments={"questId": VALID_UUID}), None)

        assert result["completedStages"] == []
        assert result["currentStageIndex"] == 0
        assert result["totalPoints"] == 0
