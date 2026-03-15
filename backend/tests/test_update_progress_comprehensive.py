"""Comprehensive tests for the update_progress resolver."""
import sys
import os
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

VALID_UUID = "550e8400-e29b-41d4-a716-446655440000"
VALID_UUID_2 = "660e8400-e29b-41d4-a716-446655440000"
USER_ID = "user-test-456"


def make_event(user_id=USER_ID, arguments=None):
    return {
        "identity": {"sub": user_id, "claims": {}},
        "arguments": arguments or {},
    }


def _make_existing_progress(user_id=USER_ID, progress_id=VALID_UUID):
    return {
        "id": progress_id,
        "userId": user_id,
        "questId": VALID_UUID_2,
        "currentStageIndex": 0,
        "completedStages": [],
        "status": "in_progress",
        "totalPoints": 0,
        "totalDuration": 0,
    }


class TestUpdateProgressComprehensive:
    """Comprehensive tests for update_progress resolver."""

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_updates_current_stage_index(self, mock_table, mock_auth):
        """Should update currentStageIndex to the specified value."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "currentStageIndex": 3}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": 3}})
        result = handler(event, None)

        assert result["currentStageIndex"] == 3

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_updates_status_to_completed(self, mock_table, mock_auth):
        """Should update status to completed."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "status": "completed"}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "completed"}})
        result = handler(event, None)

        assert result["status"] == "completed"

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_updates_status_to_abandoned(self, mock_table, mock_auth):
        """Should update status to abandoned."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "status": "abandoned"}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "abandoned"}})
        result = handler(event, None)

        assert result["status"] == "abandoned"

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_validates_ownership_rejects_wrong_user(self, mock_table, mock_auth):
        """Should reject when the progress belongs to a different user."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress(user_id="other-user-999")
        mock_table.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "completed"}})
        with pytest.raises(Exception, match="Not authorized"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_rejects_invalid_status_enum(self, mock_table, mock_auth):
        """Should reject status values not in the allowed enum."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "invalid_status"}})
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_rejects_paused_status(self, mock_table, mock_auth):
        """Should reject 'paused' which is not a valid status."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "paused"}})
        with pytest.raises(Exception, match="must be one of"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_not_found_handling(self, mock_table, mock_auth):
        """Should raise when progress ID does not exist."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_table.get_item.return_value = {}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID}})
        with pytest.raises(Exception, match="Progress not found"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_negative_stage_index_rejected(self, mock_table, mock_auth):
        """Should reject negative currentStageIndex values."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": -1}})
        with pytest.raises(Exception, match="non-negative integer"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_float_stage_index_rejected(self, mock_table, mock_auth):
        """Should reject float currentStageIndex values."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": 1.5}})
        with pytest.raises(Exception, match="non-negative integer"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_zero_stage_index_accepted(self, mock_table, mock_auth):
        """Should accept currentStageIndex of 0."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "currentStageIndex": 0}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": 0}})
        result = handler(event, None)

        assert result["currentStageIndex"] == 0

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_updates_both_status_and_stage(self, mock_table, mock_auth):
        """Should update both status and currentStageIndex simultaneously."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "status": "completed", "currentStageIndex": 5}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={
            "input": {"id": VALID_UUID, "status": "completed", "currentStageIndex": 5}
        })
        result = handler(event, None)

        assert result["status"] == "completed"
        assert result["currentStageIndex"] == 5

    @patch("update_progress.check_user_access")
    def test_invalid_progress_id_raises(self, mock_auth):
        """Should raise when progress id is not a valid UUID."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": "not-a-uuid"}})
        with pytest.raises(Exception, match="must be a valid UUID"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_sets_updated_at(self, mock_table, mock_auth):
        """Should always set updatedAt in the update expression."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "status": "in_progress"}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "in_progress"}})
        handler(event, None)

        call_kwargs = mock_table.update_item.call_args[1]
        assert ":updatedAt" in call_kwargs["ExpressionAttributeValues"]

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_update_uses_return_all_new(self, mock_table, mock_auth):
        """Should use ReturnValues=ALL_NEW to get the full updated item."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        mock_table.update_item.return_value = {"Attributes": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "status": "in_progress"}})
        handler(event, None)

        call_kwargs = mock_table.update_item.call_args[1]
        assert call_kwargs["ReturnValues"] == "ALL_NEW"

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_string_stage_index_rejected(self, mock_table, mock_auth):
        """Should reject string currentStageIndex values."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": "two"}})
        with pytest.raises(Exception, match="non-negative integer"):
            handler(event, None)

    @patch("update_progress.check_user_access")
    @patch("update_progress.progress_table")
    def test_large_stage_index_accepted(self, mock_table, mock_auth):
        """Should accept large positive currentStageIndex values."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        existing = _make_existing_progress()
        mock_table.get_item.return_value = {"Item": existing}
        updated = {**existing, "currentStageIndex": 100}
        mock_table.update_item.return_value = {"Attributes": updated}

        from update_progress import handler
        event = make_event(arguments={"input": {"id": VALID_UUID, "currentStageIndex": 100}})
        result = handler(event, None)

        assert result["currentStageIndex"] == 100
