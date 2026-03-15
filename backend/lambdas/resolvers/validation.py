import re
import json
from decimal import Decimal


class ValidationError(Exception):
    """Custom exception for input validation errors."""

    def __init__(self, message):
        self.message = message
        super().__init__(self.message)


def convert_decimals(obj):
    """Recursively convert Decimal values to int/float for JSON serialization."""
    if isinstance(obj, Decimal):
        if obj == int(obj):
            return int(obj)
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    return obj


UUID_V4_REGEX = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    re.IGNORECASE,
)


def validate_uuid(value, field_name):
    """Validates that value is a valid UUID v4 string."""
    if not value or not isinstance(value, str):
        raise ValidationError(f"{field_name} must be a non-empty string")
    if not UUID_V4_REGEX.match(value):
        raise ValidationError(f"{field_name} must be a valid UUID v4")
    return value


def validate_string(value, field_name, max_length=1000):
    """Validates that value is a non-empty string within max_length."""
    if not isinstance(value, str):
        raise ValidationError(f"{field_name} must be a string")
    stripped = value.strip()
    if not stripped:
        raise ValidationError(f"{field_name} must be a non-empty string")
    if len(stripped) > max_length:
        raise ValidationError(
            f"{field_name} must be at most {max_length} characters"
        )
    return stripped


def validate_enum(value, field_name, allowed_values):
    """Validates that value is one of the allowed values."""
    if value not in allowed_values:
        raise ValidationError(
            f"{field_name} must be one of: {', '.join(allowed_values)}"
        )
    return value


def validate_positive_int(value, field_name, max_value=999999):
    """Validates that value is an integer between 0 and max_value inclusive."""
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValidationError(f"{field_name} must be an integer")
    if value < 0 or value > max_value:
        raise ValidationError(
            f"{field_name} must be between 0 and {max_value}"
        )
    return value


def validate_transcript(value, max_bytes=524288):
    """Validates that value is a string within max_bytes (default 512KB) UTF-8."""
    if not isinstance(value, str):
        raise ValidationError("transcript must be a string")
    encoded = value.encode("utf-8")
    if len(encoded) > max_bytes:
        raise ValidationError(
            f"transcript must be at most {max_bytes} bytes (UTF-8)"
        )
    return value


def validate_latitude(value):
    """Validates that value is a valid latitude between -90 and 90."""
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValidationError("latitude must be a number")
    if value < -90 or value > 90:
        raise ValidationError("latitude must be between -90 and 90")
    return value


def validate_longitude(value):
    """Validates that value is a valid longitude between -180 and 180."""
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValidationError("longitude must be a number")
    if value < -180 or value > 180:
        raise ValidationError("longitude must be between -180 and 180")
    return value


def validate_quest_input(input_data):
    """Validates all fields of a CreateQuestInput."""
    if not isinstance(input_data, dict):
        raise ValidationError("input must be an object")

    validated = {}

    validated["title"] = validate_string(
        input_data.get("title", ""), "title", max_length=200
    )
    validated["description"] = validate_string(
        input_data.get("description", ""), "description", max_length=2000
    )

    if "difficulty" in input_data:
        validated["difficulty"] = validate_enum(
            input_data["difficulty"],
            "difficulty",
            ["EASY", "MEDIUM", "HARD", "EXPERT"],
        )

    if "latitude" in input_data:
        validated["latitude"] = validate_latitude(input_data["latitude"])

    if "longitude" in input_data:
        validated["longitude"] = validate_longitude(input_data["longitude"])

    if "maxParticipants" in input_data:
        validated["maxParticipants"] = validate_positive_int(
            input_data["maxParticipants"], "maxParticipants", max_value=10000
        )

    if "rewardPoints" in input_data:
        validated["rewardPoints"] = validate_positive_int(
            input_data["rewardPoints"], "rewardPoints", max_value=999999
        )

    if "transcript" in input_data:
        validated["transcript"] = validate_transcript(input_data["transcript"])

    return validated
