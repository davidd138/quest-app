"""Comprehensive tests for delete_user_data resolver."""
import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock, call

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

USER_ID = "user-delete-comp-123"
USERNAME = "deleteuser@example.com"


def make_event(user_id=USER_ID, username=USERNAME):
    return {
        "identity": {"sub": user_id, "username": username, "claims": {}},
        "request": {"headers": {"x-forwarded-for": "192.168.1.1"}},
    }


# ── Deletes from all 5 tables ────────────────────────────────────────


class TestDeletesFromAllTables:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_deletes_items_from_every_table(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": [{"id": "p1", "userId": USER_ID}]}
        mock_prog.delete_item.return_value = {}
        mock_convs.query.return_value = {"Items": [{"id": "c1", "userId": USER_ID}]}
        mock_convs.delete_item.return_value = {}
        mock_scores.query.return_value = {"Items": [{"id": "s1", "userId": USER_ID}]}
        mock_scores.delete_item.return_value = {}
        mock_ach.query.return_value = {"Items": [{"id": "a1", "userId": USER_ID}]}
        mock_ach.delete_item.return_value = {}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)

        assert result is True
        mock_prog.delete_item.assert_called_once_with(Key={"id": "p1"})
        mock_convs.delete_item.assert_called_once_with(Key={"id": "c1"})
        mock_scores.delete_item.assert_called_once_with(Key={"id": "s1"})
        mock_ach.delete_item.assert_called_once_with(Key={"id": "a1"})
        mock_users.delete_item.assert_called_once_with(Key={"userId": USER_ID})

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_deletes_multiple_items_per_table(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {
            "Items": [{"id": f"p{i}", "userId": USER_ID} for i in range(4)]
        }
        mock_prog.delete_item.return_value = {}
        mock_convs.query.return_value = {
            "Items": [{"id": f"c{i}", "userId": USER_ID} for i in range(3)]
        }
        mock_convs.delete_item.return_value = {}
        mock_scores.query.return_value = {"Items": [{"id": "s1", "userId": USER_ID}]}
        mock_scores.delete_item.return_value = {}
        mock_ach.query.return_value = {
            "Items": [{"id": f"a{i}", "userId": USER_ID} for i in range(2)]
        }
        mock_ach.delete_item.return_value = {}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)

        assert result is True
        assert mock_prog.delete_item.call_count == 4
        assert mock_convs.delete_item.call_count == 3
        assert mock_scores.delete_item.call_count == 1
        assert mock_ach.delete_item.call_count == 2


# ── Deletes Cognito user ─────────────────────────────────────────────


class TestDeletesCognitoUser:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_cognito_delete_called_with_correct_params(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        handler(make_event(), None)

        mock_cognito.admin_delete_user.assert_called_once_with(
            UserPoolId=os.environ["USER_POOL_ID"],
            Username=USERNAME,
        )


# ── Empty tables don't break ─────────────────────────────────────────


class TestEmptyTablesDontBreak:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_all_tables_empty(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)

        assert result is True
        mock_prog.delete_item.assert_not_called()
        mock_convs.delete_item.assert_not_called()
        mock_scores.delete_item.assert_not_called()
        mock_ach.delete_item.assert_not_called()

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_some_tables_empty_some_not(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": [{"id": "p1", "userId": USER_ID}]}
        mock_prog.delete_item.return_value = {}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": [{"id": "a1", "userId": USER_ID}]}
        mock_ach.delete_item.return_value = {}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)

        assert result is True
        mock_prog.delete_item.assert_called_once()
        mock_convs.delete_item.assert_not_called()
        mock_scores.delete_item.assert_not_called()
        mock_ach.delete_item.assert_called_once()


# ── Audit log created ─────────────────────────────────────────────────


class TestAuditLogCreated:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    @patch("delete_user_data.logger")
    def test_audit_log_contains_user_info(
        self, mock_logger, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        handler(make_event(), None)

        # Should log at least twice (before and after deletion)
        assert mock_logger.info.call_count >= 2
        first_log = mock_logger.info.call_args_list[0][0][0]
        parsed = json.loads(first_log)
        assert parsed["action"] == "GDPR_ACCOUNT_DELETION"
        assert parsed["userId"] == USER_ID
        assert parsed["username"] == USERNAME

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    @patch("delete_user_data.logger")
    def test_completion_audit_log(
        self, mock_logger, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": [{"id": "p1", "userId": USER_ID}]}
        mock_prog.delete_item.return_value = {}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        handler(make_event(), None)

        # The last info log should be the completion log
        last_log = mock_logger.info.call_args_list[-1][0][0]
        parsed = json.loads(last_log)
        assert parsed["action"] == "GDPR_ACCOUNT_DELETION_COMPLETE"
        assert "deletionResults" in parsed


# ── Returns True on success ───────────────────────────────────────────


class TestReturnsTrueOnSuccess:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_returns_true(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.return_value = {}

        from delete_user_data import handler
        result = handler(make_event(), None)
        assert result is True

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_returns_true_even_with_cognito_failure(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        """The handler should still return True even if Cognito deletion fails gracefully."""
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.side_effect = Exception("UserNotFoundException")

        from delete_user_data import handler
        result = handler(make_event(), None)
        assert result is True


# ── Handles Cognito deletion errors gracefully ────────────────────────


class TestCognitoDeletionErrors:
    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_cognito_user_not_found_handled(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.side_effect = Exception("UserNotFoundException: user not found")

        from delete_user_data import handler
        result = handler(make_event(), None)
        assert result is True

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    def test_cognito_internal_error_handled(
        self, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.side_effect = Exception("InternalErrorException: service error")

        from delete_user_data import handler
        result = handler(make_event(), None)
        assert result is True

    @patch("delete_user_data.check_user_access")
    @patch("delete_user_data.cognito")
    @patch("delete_user_data.users_table")
    @patch("delete_user_data.progress_table")
    @patch("delete_user_data.conversations_table")
    @patch("delete_user_data.scores_table")
    @patch("delete_user_data.achievements_table")
    @patch("delete_user_data.logger")
    def test_cognito_error_is_logged(
        self, mock_logger, mock_ach, mock_scores, mock_convs, mock_prog, mock_users, mock_cognito, mock_auth
    ):
        mock_auth.return_value = {"userId": USER_ID, "status": "active"}
        mock_prog.query.return_value = {"Items": []}
        mock_convs.query.return_value = {"Items": []}
        mock_scores.query.return_value = {"Items": []}
        mock_ach.query.return_value = {"Items": []}
        mock_users.delete_item.return_value = {}
        mock_cognito.admin_delete_user.side_effect = Exception("AccessDeniedException: no permission")

        from delete_user_data import handler
        handler(make_event(), None)

        # Check that the error was logged
        error_calls = [c for c in mock_logger.error.call_args_list if "Cognito" in str(c)]
        assert len(error_calls) >= 1
