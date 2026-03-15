"""Exhaustive tests for validation.py helper functions."""
import sys
import os
import pytest

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


# ── validate_uuid (comprehensive) ────────────────────────────────────

class TestValidateUuidComprehensive:
    def test_valid_v4(self):
        assert validate_uuid("550e8400-e29b-41d4-a716-446655440000", "id")

    def test_uppercase(self):
        assert validate_uuid("550E8400-E29B-41D4-A716-446655440000", "id")

    def test_v1_rejected(self):
        with pytest.raises(ValidationError, match="valid UUID v4"):
            validate_uuid("550e8400-e29b-11d4-a716-446655440000", "id")

    def test_too_short(self):
        with pytest.raises(ValidationError, match="valid UUID v4"):
            validate_uuid("550e8400-e29b-41d4-a716", "id")

    def test_too_long(self):
        with pytest.raises(ValidationError, match="valid UUID v4"):
            validate_uuid("550e8400-e29b-41d4-a716-446655440000-extra", "id")

    def test_special_chars(self):
        with pytest.raises(ValidationError, match="valid UUID v4"):
            validate_uuid("550e8400-e29b-41d4-a716-44665544000!", "id")

    def test_null(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_uuid(None, "id")

    def test_empty(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_uuid("", "id")

    def test_numeric(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_uuid(12345, "id")

    def test_boolean(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_uuid(True, "id")

    def test_list(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_uuid(["550e8400-e29b-41d4-a716-446655440000"], "id")

    def test_v5_rejected(self):
        with pytest.raises(ValidationError, match="valid UUID v4"):
            validate_uuid("550e8400-e29b-51d4-a716-446655440000", "id")

    def test_missing_hyphens(self):
        with pytest.raises(ValidationError, match="valid UUID v4"):
            validate_uuid("550e8400e29b41d4a716446655440000", "id")

    def test_mixed_case(self):
        assert validate_uuid("550e8400-E29B-41d4-a716-446655440000", "id")


# ── validate_string (comprehensive) ──────────────────────────────────

class TestValidateStringComprehensive:
    def test_normal(self):
        assert validate_string("hello", "name") == "hello"

    def test_whitespace_trim(self):
        assert validate_string("  hello  ", "name") == "hello"

    def test_empty(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_string("", "name")

    def test_too_long(self):
        with pytest.raises(ValidationError, match="at most 5"):
            validate_string("abcdef", "name", max_length=5)

    def test_at_limit(self):
        assert validate_string("abcde", "name", max_length=5) == "abcde"

    def test_not_string_int(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string(123, "name")

    def test_null(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string(None, "name")

    def test_unicode(self):
        assert validate_string("hola mundo", "name") == "hola mundo"

    def test_unicode_emoji(self):
        assert validate_string("\U0001f600", "name") == "\U0001f600"

    def test_max_length_zero(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_string("", "name", max_length=0)

    def test_whitespace_only(self):
        with pytest.raises(ValidationError, match="non-empty string"):
            validate_string("   \t\n  ", "name")

    def test_boolean_rejected(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string(True, "name")

    def test_list_rejected(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string(["hello"], "name")

    def test_dict_rejected(self):
        with pytest.raises(ValidationError, match="must be a string"):
            validate_string({"name": "hello"}, "name")

    def test_single_char(self):
        assert validate_string("a", "name") == "a"

    def test_long_string_at_default_limit(self):
        assert len(validate_string("x" * 1000, "name")) == 1000

    def test_long_string_over_default_limit(self):
        with pytest.raises(ValidationError, match="at most 1000"):
            validate_string("x" * 1001, "name")


# ── validate_enum (comprehensive) ────────────────────────────────────

class TestValidateEnumComprehensive:
    def test_valid(self):
        assert validate_enum("easy", "diff", ["easy", "medium", "hard"]) == "easy"

    def test_invalid(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum("extreme", "diff", ["easy", "medium", "hard"])

    def test_case_sensitive(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum("Easy", "diff", ["easy", "medium"])

    def test_null(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum(None, "status", ["active", "inactive"])

    def test_empty_string(self):
        with pytest.raises(ValidationError, match="must be one of"):
            validate_enum("", "status", ["active", "inactive"])

    def test_numeric_in_list(self):
        assert validate_enum(1, "num", [1, 2, 3]) == 1

    def test_numeric_not_in_list(self):
        # join() only works with string lists; numeric allowed_values raises TypeError
        with pytest.raises(TypeError):
            validate_enum(4, "num", [1, 2, 3])

    def test_boolean_in_list(self):
        assert validate_enum(True, "flag", [True, False]) is True

    def test_error_message_lists_values(self):
        with pytest.raises(ValidationError, match="a, b, c"):
            validate_enum("d", "x", ["a", "b", "c"])


# ── validate_positive_int (comprehensive) ────────────────────────────

class TestValidatePositiveIntComprehensive:
    def test_zero(self):
        assert validate_positive_int(0, "count") == 0

    def test_one(self):
        assert validate_positive_int(1, "count") == 1

    def test_max(self):
        assert validate_positive_int(999999, "count") == 999999

    def test_over_max(self):
        with pytest.raises(ValidationError, match="must be between 0 and 999999"):
            validate_positive_int(1000000, "count")

    def test_negative(self):
        with pytest.raises(ValidationError, match="must be between 0"):
            validate_positive_int(-1, "count")

    def test_float(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(3.14, "count")

    def test_string(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int("42", "count")

    def test_bool_true(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(True, "count")

    def test_bool_false(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(False, "count")

    def test_none(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int(None, "count")

    def test_custom_max(self):
        assert validate_positive_int(50, "count", max_value=100) == 50

    def test_custom_max_exceeded(self):
        with pytest.raises(ValidationError, match="must be between 0 and 100"):
            validate_positive_int(101, "count", max_value=100)

    def test_large_negative(self):
        with pytest.raises(ValidationError, match="must be between 0"):
            validate_positive_int(-999999, "count")

    def test_list_rejected(self):
        with pytest.raises(ValidationError, match="must be an integer"):
            validate_positive_int([1], "count")


# ── validate_transcript (comprehensive) ──────────────────────────────

class TestValidateTranscriptComprehensive:
    def test_valid(self):
        assert validate_transcript("Hello, world.") == "Hello, world."

    def test_empty(self):
        assert validate_transcript("") == ""

    def test_at_limit(self):
        text = "a" * 524288
        assert validate_transcript(text) == text

    def test_over_limit(self):
        with pytest.raises(ValidationError, match="at most 524288 bytes"):
            validate_transcript("a" * 524289)

    def test_unicode_bytes(self):
        # 4-byte emoji chars
        text = "\U0001f600" * 25
        assert validate_transcript(text, max_bytes=200) == text

    def test_unicode_over_byte_limit(self):
        # Each emoji is 4 bytes, 50 emojis = 200 bytes
        text = "\U0001f600" * 51
        with pytest.raises(ValidationError, match="at most 200 bytes"):
            validate_transcript(text, max_bytes=200)

    def test_null(self):
        with pytest.raises(ValidationError, match="transcript must be a string"):
            validate_transcript(None)

    def test_integer(self):
        with pytest.raises(ValidationError, match="transcript must be a string"):
            validate_transcript(123)

    def test_boolean(self):
        with pytest.raises(ValidationError, match="transcript must be a string"):
            validate_transcript(True)

    def test_list(self):
        with pytest.raises(ValidationError, match="transcript must be a string"):
            validate_transcript(["hello"])

    def test_custom_max_bytes(self):
        with pytest.raises(ValidationError, match="at most 10 bytes"):
            validate_transcript("a" * 11, max_bytes=10)

    def test_custom_max_at_limit(self):
        assert validate_transcript("a" * 10, max_bytes=10) == "a" * 10


# ── validate_latitude (comprehensive) ────────────────────────────────

class TestValidateLatitudeComprehensive:
    def test_valid(self):
        assert validate_latitude(41.3818) == 41.3818

    def test_zero(self):
        assert validate_latitude(0) == 0

    def test_min_boundary(self):
        assert validate_latitude(-90) == -90

    def test_max_boundary(self):
        assert validate_latitude(90) == 90

    def test_over(self):
        with pytest.raises(ValidationError, match="latitude must be between"):
            validate_latitude(90.01)

    def test_under(self):
        with pytest.raises(ValidationError, match="latitude must be between"):
            validate_latitude(-90.01)

    def test_string(self):
        with pytest.raises(ValidationError, match="latitude must be a number"):
            validate_latitude("41.3818")

    def test_null(self):
        with pytest.raises(ValidationError, match="latitude must be a number"):
            validate_latitude(None)

    def test_bool(self):
        with pytest.raises(ValidationError, match="latitude must be a number"):
            validate_latitude(True)

    def test_integer(self):
        assert validate_latitude(45) == 45

    def test_negative(self):
        assert validate_latitude(-45.5) == -45.5

    def test_large_over(self):
        with pytest.raises(ValidationError, match="latitude must be between"):
            validate_latitude(1000)


# ── validate_longitude (comprehensive) ───────────────────────────────

class TestValidateLongitudeComprehensive:
    def test_valid(self):
        assert validate_longitude(2.1719) == 2.1719

    def test_zero(self):
        assert validate_longitude(0) == 0

    def test_min_boundary(self):
        assert validate_longitude(-180) == -180

    def test_max_boundary(self):
        assert validate_longitude(180) == 180

    def test_over(self):
        with pytest.raises(ValidationError, match="longitude must be between"):
            validate_longitude(180.01)

    def test_under(self):
        with pytest.raises(ValidationError, match="longitude must be between"):
            validate_longitude(-180.01)

    def test_string(self):
        with pytest.raises(ValidationError, match="longitude must be a number"):
            validate_longitude("2.1719")

    def test_null(self):
        with pytest.raises(ValidationError, match="longitude must be a number"):
            validate_longitude(None)

    def test_bool(self):
        with pytest.raises(ValidationError, match="longitude must be a number"):
            validate_longitude(True)

    def test_integer(self):
        assert validate_longitude(90) == 90

    def test_negative(self):
        assert validate_longitude(-73.9969) == -73.9969

    def test_large_over(self):
        with pytest.raises(ValidationError, match="longitude must be between"):
            validate_longitude(1000)
