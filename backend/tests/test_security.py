"""Security-focused tests: injection, XSS, authorization, and input abuse.

These tests verify that the validation and auth layers properly reject
malicious or malformed inputs.
"""

import sys
import os
import json
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers")
)

from validation import (
    validate_uuid,
    validate_string,
    validate_transcript,
    validate_enum,
    validate_positive_int,
    validate_quest_input,
    ValidationError,
)
from auth_helpers import check_user_access, check_admin_access


# ---------------------------------------------------------------------------
# 1. NoSQL Injection attempts
# ---------------------------------------------------------------------------


class TestNoSQLInjection:
    """Verify that injection payloads are rejected by validation."""

    INJECTION_PAYLOADS = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$regex": ".*"}',
        "'; DROP TABLE users; --",
        '" OR "1"="1',
        "{ $where: 'this.password.length > 0' }",
        '{"$or": [{"a": 1}, {"b": 2}]}',
        "1; db.users.find()",
        '{"__proto__": {"isAdmin": true}}',
    ]

    @pytest.mark.parametrize("payload", INJECTION_PAYLOADS)
    def test_uuid_rejects_injection(self, payload):
        with pytest.raises(ValidationError):
            validate_uuid(payload, "testField")

    @pytest.mark.parametrize("payload", INJECTION_PAYLOADS)
    def test_enum_rejects_injection(self, payload):
        with pytest.raises(ValidationError):
            validate_enum(payload, "testField", ["valid1", "valid2"])


# ---------------------------------------------------------------------------
# 2. XSS payload attempts
# ---------------------------------------------------------------------------


class TestXSSPrevention:
    """Verify that XSS payloads pass string validation but are safe strings.

    Note: DynamoDB stores raw strings; the frontend is responsible for
    escaping on render. These tests confirm the payloads don't bypass
    length/type validation but ARE allowed as strings (they're stored safely).
    """

    XSS_PAYLOADS = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        "javascript:alert(1)",
        '<svg onload=alert(1)>',
        '"><script>alert(document.cookie)</script>',
        "'-alert(1)-'",
    ]

    @pytest.mark.parametrize("payload", XSS_PAYLOADS)
    def test_xss_in_string_stays_within_length(self, payload):
        """XSS payloads are valid strings but must respect max_length."""
        result = validate_string(payload, "title", max_length=500)
        assert isinstance(result, str)
        assert len(result) <= 500

    def test_xss_rejected_when_exceeding_max_length(self):
        """A very long XSS payload is rejected by length validation."""
        long_xss = '<script>' + 'a' * 2000 + '</script>'
        with pytest.raises(ValidationError, match="at most"):
            validate_string(long_xss, "title", max_length=200)


# ---------------------------------------------------------------------------
# 3. UUID validation against malicious inputs
# ---------------------------------------------------------------------------


class TestUUIDValidation:
    """Ensure only well-formed UUID v4 strings pass validation."""

    MALICIOUS_UUIDS = [
        "",
        "not-a-uuid",
        "12345678-1234-1234-1234-123456789012",  # not v4 (wrong version nibble)
        "../../../etc/passwd",
        "550e8400-e29b-41d4-a716-44665544000",  # too short
        "550e8400-e29b-41d4-a716-4466554400000",  # too long
        "550e8400-e29b-41d4-a716-44665544000g",  # invalid hex
        "null",
        "undefined",
        "0",
        None,
        123,
        True,
    ]

    @pytest.mark.parametrize("value", MALICIOUS_UUIDS)
    def test_rejects_invalid_uuid(self, value):
        with pytest.raises(ValidationError):
            validate_uuid(value, "id")

    def test_accepts_valid_uuid_v4(self):
        valid = "550e8400-e29b-41d4-a716-446655440000"
        result = validate_uuid(valid, "id")
        assert result == valid


# ---------------------------------------------------------------------------
# 4. Rate-like behavior: multiple rapid requests
# ---------------------------------------------------------------------------


class TestRapidRequests:
    """Simulate multiple rapid invocations to ensure no state leaks."""

    @patch("list_quests.check_user_access")
    @patch("list_quests.quests_table")
    def test_rapid_list_quests(self, mock_quests, mock_auth):
        """100 rapid calls return consistent results without crashes."""
        mock_auth.return_value = {
            "userId": "user-1",
            "status": "active",
            "role": "player",
        }
        mock_quests.scan.return_value = {"Items": [{"id": "q1", "isPublished": True}]}

        from list_quests import handler

        event = {
            "identity": {"sub": "user-1", "claims": {}},
            "arguments": {},
        }

        results = []
        for _ in range(100):
            result = handler(event, None)
            results.append(result)

        assert all(len(r["items"]) == 1 for r in results)
        assert all(r["items"][0]["id"] == "q1" for r in results)


# ---------------------------------------------------------------------------
# 5. Unauthorized access: wrong userId
# ---------------------------------------------------------------------------


class TestUnauthorizedAccess:
    """Verify resolvers enforce ownership and access control."""

    @patch("update_conversation.check_user_access")
    @patch("update_conversation.conversations_table")
    def test_update_conversation_wrong_user(self, mock_convs, mock_auth):
        """Updating another user's conversation raises an error."""
        mock_auth.return_value = {"userId": "attacker", "status": "active"}
        mock_convs.get_item.return_value = {
            "Item": {
                "id": "aa0e8400-e29b-41d4-a716-446655440000",
                "userId": "victim-user",
                "status": "in_progress",
            }
        }

        from update_conversation import handler

        event = {
            "identity": {"sub": "attacker", "claims": {}},
            "arguments": {
                "input": {
                    "id": "aa0e8400-e29b-41d4-a716-446655440000",
                    "transcript": "hacked",
                }
            },
        }

        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)

    @patch("analyze_conversation.check_user_access")
    @patch("analyze_conversation.conversations_table")
    def test_analyze_conversation_wrong_user(self, mock_convs, mock_auth):
        """Analyzing another user's conversation raises an error."""
        mock_auth.return_value = {"userId": "attacker", "status": "active"}
        mock_convs.get_item.return_value = {
            "Item": {
                "id": "aa0e8400-e29b-41d4-a716-446655440000",
                "userId": "victim-user",
            }
        }

        from analyze_conversation import handler

        event = {
            "identity": {"sub": "attacker", "claims": {}},
            "arguments": {
                "conversationId": "aa0e8400-e29b-41d4-a716-446655440000",
            },
        }

        with pytest.raises(Exception, match="Not found or unauthorized"):
            handler(event, None)


# ---------------------------------------------------------------------------
# 6. Admin endpoints reject non-admins
# ---------------------------------------------------------------------------


class TestAdminAccessControl:
    """Ensure admin-only resolvers reject regular users."""

    @patch("auth_helpers.users_table")
    def test_check_admin_access_non_admin_user(self, mock_users):
        """Non-admin user is rejected by check_admin_access."""
        mock_users.get_item.return_value = {
            "Item": {"userId": "regular-user", "role": "player"}
        }
        event = {"identity": {"claims": {}}}

        with pytest.raises(PermissionError, match="Admin access required"):
            check_admin_access(event, "regular-user")

    @patch("auth_helpers.users_table")
    def test_check_admin_access_admin_group(self, mock_users):
        """User in admins Cognito group is allowed."""
        event = {"identity": {"claims": {"cognito:groups": ["admins"]}}}
        result = check_admin_access(event, "admin-user")
        assert result is True

    @patch("auth_helpers.users_table")
    def test_check_admin_access_admin_role(self, mock_users):
        """User with role=admin in DB is allowed."""
        mock_users.get_item.return_value = {
            "Item": {"userId": "admin-user", "role": "admin"}
        }
        event = {"identity": {"claims": {}}}
        result = check_admin_access(event, "admin-user")
        assert result is True

    @patch("auth_helpers.users_table")
    def test_check_user_access_pending(self, mock_users):
        """Pending user is denied access."""
        mock_users.get_item.return_value = {
            "Item": {"userId": "pending-user", "status": "pending"}
        }
        with pytest.raises(PermissionError, match="pending approval"):
            check_user_access("pending-user")

    @patch("auth_helpers.users_table")
    def test_check_user_access_suspended(self, mock_users):
        """Suspended user is denied access."""
        mock_users.get_item.return_value = {
            "Item": {"userId": "suspended-user", "status": "suspended"}
        }
        with pytest.raises(PermissionError, match="suspended"):
            check_user_access("suspended-user")

    @patch("auth_helpers.users_table")
    def test_check_user_access_not_found(self, mock_users):
        """Unknown user is denied access."""
        mock_users.get_item.return_value = {}
        with pytest.raises(PermissionError, match="not found"):
            check_user_access("ghost-user")


# ---------------------------------------------------------------------------
# 7. Transcript size limits
# ---------------------------------------------------------------------------


class TestTranscriptLimits:
    """Verify that oversized transcripts are rejected."""

    def test_transcript_within_limit(self):
        """Normal transcript passes validation."""
        transcript = "A" * 1000
        result = validate_transcript(transcript)
        assert result == transcript

    def test_transcript_at_limit(self):
        """Transcript exactly at 512KB passes."""
        transcript = "A" * 524288
        result = validate_transcript(transcript)
        assert result == transcript

    def test_transcript_exceeds_limit(self):
        """Transcript over 512KB is rejected."""
        transcript = "A" * 524289
        with pytest.raises(ValidationError, match="at most 524288 bytes"):
            validate_transcript(transcript)

    def test_transcript_multibyte_chars(self):
        """Multibyte UTF-8 characters count by byte size, not char count."""
        # Each emoji is ~4 bytes in UTF-8
        transcript = "\U0001F600" * 131073  # > 512KB in bytes
        with pytest.raises(ValidationError, match="at most 524288 bytes"):
            validate_transcript(transcript)

    def test_transcript_non_string(self):
        """Non-string transcript is rejected."""
        with pytest.raises(ValidationError, match="must be a string"):
            validate_transcript(123)

        with pytest.raises(ValidationError, match="must be a string"):
            validate_transcript(None)


# ---------------------------------------------------------------------------
# 8. Large payload handling
# ---------------------------------------------------------------------------


class TestLargePayloads:
    """Verify that oversized inputs are properly rejected."""

    def test_very_long_title(self):
        """Title exceeding 200 chars is rejected."""
        long_title = "A" * 201
        with pytest.raises(ValidationError, match="at most 200 characters"):
            validate_quest_input({"title": long_title, "description": "Valid desc " * 5})

    def test_very_long_description(self):
        """Description exceeding 2000 chars is rejected."""
        input_data = {
            "title": "Valid Title",
            "description": "A" * 2001,
        }
        with pytest.raises(ValidationError, match="at most 2000 characters"):
            validate_quest_input(input_data)

    def test_integer_overflow_prevention(self):
        """Extremely large integers are rejected."""
        with pytest.raises(ValidationError, match="between 0 and 999999"):
            validate_positive_int(1_000_000, "rewardPoints")

    def test_negative_integer_rejection(self):
        """Negative integers are rejected."""
        with pytest.raises(ValidationError, match="between 0 and"):
            validate_positive_int(-1, "points")

    def test_boolean_not_treated_as_int(self):
        """Boolean values are not accepted as integers."""
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(True, "points")

    def test_string_not_treated_as_int(self):
        """String values are not accepted as integers."""
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int("42", "points")

    def test_quest_input_must_be_dict(self):
        """Quest input must be a dictionary."""
        with pytest.raises(ValidationError, match="must be an object"):
            validate_quest_input("not a dict")

    def test_empty_string_fields_rejected(self):
        """Empty or whitespace-only strings are rejected."""
        with pytest.raises(ValidationError, match="non-empty"):
            validate_string("", "title")

        with pytest.raises(ValidationError, match="non-empty"):
            validate_string("   ", "title")

        with pytest.raises(ValidationError, match="non-empty"):
            validate_string("\n\t", "title")
