"""Tests for validation.py helper functions."""
import sys
import os
import pytest

# Add resolvers directory to path so we can import validation
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

from validation import (
    ValidationError,
    validate_uuid,
    validate_string,
    validate_enum,
    validate_positive_int,
    validate_transcript,
    validate_latitude,
    validate_longitude,
)

# ── validate_uuid ──────────────────────────────────────────────────────

class TestValidateUuid:
    def test_valid_uuid_v4(self):
        valid = "550e8400-e29b-41d4-a716-446655440000"
        assert validate_uuid(valid, "id") == valid

    def test_valid_uuid_v4_uppercase(self):
        valid = "550E8400-E29B-41D4-A716-446655440000"
        assert validate_uuid(valid, "id") == valid

    def test_invalid_uuid_wrong_format(self):
        with pytest.raises(ValidationError, match="must be a valid UUID v4"):
            validate_uuid("not-a-uuid", "id")

    def test_invalid_uuid_empty_string(self):
        with pytest.raises(ValidationError, match="must be a non-empty string"):
            validate_uuid("", "id")

    def test_invalid_uuid_none(self):
        with pytest.raises(ValidationError, match="must be a non-empty string"):
            validate_uuid(None, "id")

    def test_invalid_uuid_integer(self):
        with pytest.raises(ValidationError, match="must be a non-empty string"):
            validate_uuid(12345, "id")

    def test_invalid_uuid_v1(self):
        # UUID v1 has version digit 1 in the 3rd group
        with pytest.raises(ValidationError, match="must be a valid UUID v4"):
            validate_uuid("550e8400-e29b-11d4-a716-446655440000", "id")

    def test_field_name_in_error(self):
        with pytest.raises(ValidationError, match="questId"):
            validate_uuid("bad", "questId")


# ── validate_string ────────────────────────────────────────────────────

class TestValidateString:
    def test_valid_string(self):
        assert validate_string("hello", "name") == "hello"

    def test_strips_whitespace(self):
        assert validate_string("  hello  ", "name") == "hello"

    def test_empty_string(self):
        with pytest.raises(ValidationError, match="must be a non-empty string"):
            validate_string("", "name")

    def test_whitespace_only(self):
        with pytest.raises(ValidationError, match="must be a non-empty string"):
            validate_string("   ", "name")

    def test_exceeds_max_length(self):
        with pytest.raises(ValidationError, match="at most 10 characters"):
            validate_string("a" * 11, "name", max_length=10)

    def test_at_max_length(self):
        result = validate_string("a" * 10, "name", max_length=10)
        assert result == "a" * 10

    def test_not_a_string(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string(123, "name")

    def test_none_value(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string(None, "name")

    def test_default_max_length(self):
        # Default max_length is 1000
        result = validate_string("a" * 1000, "name")
        assert len(result) == 1000

    def test_exceeds_default_max_length(self):
        with pytest.raises(ValidationError, match="at most 1000 characters"):
            validate_string("a" * 1001, "name")


# ── validate_enum ──────────────────────────────────────────────────────

class TestValidateEnum:
    def test_valid_enum(self):
        assert validate_enum("easy", "difficulty", ["easy", "medium", "hard"]) == "easy"

    def test_invalid_enum(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum("extreme", "difficulty", ["easy", "medium", "hard"])

    def test_error_lists_allowed_values(self):
        with pytest.raises(ValidationError, match="easy, medium, hard"):
            validate_enum("bad", "difficulty", ["easy", "medium", "hard"])

    def test_none_value(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum(None, "status", ["active", "inactive"])

    def test_case_sensitive(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum("Easy", "difficulty", ["easy", "medium", "hard"])


# ── validate_positive_int ──────────────────────────────────────────────

class TestValidatePositiveInt:
    def test_valid_zero(self):
        assert validate_positive_int(0, "count") == 0

    def test_valid_positive(self):
        assert validate_positive_int(42, "count") == 42

    def test_valid_at_max(self):
        assert validate_positive_int(999999, "count") == 999999

    def test_negative(self):
        with pytest.raises(ValidationError, match="must be between 0 and"):
            validate_positive_int(-1, "count")

    def test_exceeds_max(self):
        with pytest.raises(ValidationError, match="must be between 0 and"):
            validate_positive_int(1000000, "count")

    def test_custom_max(self):
        assert validate_positive_int(50, "count", max_value=100) == 50
        with pytest.raises(ValidationError, match="must be between 0 and 100"):
            validate_positive_int(101, "count", max_value=100)

    def test_float_rejected(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(3.14, "count")

    def test_string_rejected(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int("42", "count")

    def test_boolean_rejected(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(True, "count")

    def test_none_rejected(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(None, "count")


# ── validate_transcript ────────────────────────────────────────────────

class TestValidateTranscript:
    def test_valid_transcript(self):
        text = "Hello, this is a conversation."
        assert validate_transcript(text) == text

    def test_empty_string(self):
        # Empty string is valid (no minimum check in implementation)
        assert validate_transcript("") == ""

    def test_exceeds_max_bytes(self):
        # Default max is 524288 bytes (512KB)
        with pytest.raises(ValidationError, match="at most 524288 bytes"):
            validate_transcript("a" * 524289)

    def test_custom_max_bytes(self):
        with pytest.raises(ValidationError, match="at most 100 bytes"):
            validate_transcript("a" * 101, max_bytes=100)

    def test_unicode_byte_counting(self):
        # Unicode chars take more bytes in UTF-8
        # Each emoji is ~4 bytes
        text = "\U0001f600" * 25  # 25 emojis = ~100 bytes
        assert validate_transcript(text, max_bytes=200) == text

    def test_not_a_string(self):
        with pytest.raises(ValidationError, match="transcript must be a string"):
            validate_transcript(123)

    def test_none_rejected(self):
        with pytest.raises(ValidationError, match="transcript must be a string"):
            validate_transcript(None)

    def test_at_exact_limit(self):
        text = "a" * 524288
        assert validate_transcript(text) == text


# ── validate_latitude ──────────────────────────────────────────────────

class TestValidateLatitude:
    def test_valid_latitude(self):
        assert validate_latitude(41.3818) == 41.3818

    def test_zero(self):
        assert validate_latitude(0) == 0

    def test_min_boundary(self):
        assert validate_latitude(-90) == -90

    def test_max_boundary(self):
        assert validate_latitude(90) == 90

    def test_integer_accepted(self):
        assert validate_latitude(45) == 45

    def test_below_min(self):
        with pytest.raises(ValidationError, match="latitude must be between -90 and 90"):
            validate_latitude(-91)

    def test_above_max(self):
        with pytest.raises(ValidationError, match="latitude must be between -90 and 90"):
            validate_latitude(91)

    def test_string_rejected(self):
        with pytest.raises(ValidationError, match="latitude must be a number"):
            validate_latitude("41.3818")

    def test_none_rejected(self):
        with pytest.raises(ValidationError, match="latitude must be a number"):
            validate_latitude(None)

    def test_boolean_rejected(self):
        with pytest.raises(ValidationError, match="latitude must be a number"):
            validate_latitude(True)


# ── validate_longitude ─────────────────────────────────────────────────

class TestValidateLongitude:
    def test_valid_longitude(self):
        assert validate_longitude(2.1719) == 2.1719

    def test_zero(self):
        assert validate_longitude(0) == 0

    def test_min_boundary(self):
        assert validate_longitude(-180) == -180

    def test_max_boundary(self):
        assert validate_longitude(180) == 180

    def test_negative(self):
        assert validate_longitude(-73.9969) == -73.9969

    def test_below_min(self):
        with pytest.raises(ValidationError, match="longitude must be between -180 and 180"):
            validate_longitude(-181)

    def test_above_max(self):
        with pytest.raises(ValidationError, match="longitude must be between -180 and 180"):
            validate_longitude(181)

    def test_string_rejected(self):
        with pytest.raises(ValidationError, match="longitude must be a number"):
            validate_longitude("2.1719")

    def test_none_rejected(self):
        with pytest.raises(ValidationError, match="longitude must be a number"):
            validate_longitude(None)

    def test_boolean_rejected(self):
        with pytest.raises(ValidationError, match="longitude must be a number"):
            validate_longitude(True)
