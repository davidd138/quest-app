import os
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access
from validation import (
    validate_string,
    validate_enum,
    validate_positive_int,
    convert_decimals,
    ValidationError,
)

quests_table = boto3.resource("dynamodb").Table(os.environ["QUESTS_TABLE"])

VALID_CATEGORIES = [
    "adventure", "mystery", "cultural", "educational",
    "culinary", "nature", "urban", "team_building",
]
VALID_DIFFICULTIES = ["easy", "medium", "hard", "legendary"]
VALID_CHALLENGE_TYPES = [
    "conversation", "riddle", "knowledge", "negotiation",
    "persuasion", "exploration", "trivia",
]


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    # Any active user can create community quests (not just admin)
    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})

    try:
        title = validate_string(args.get("title", ""), "title", max_length=200)
        description = validate_string(
            args.get("description", ""), "description", max_length=2000
        )
        category = validate_enum(args.get("category", ""), "category", VALID_CATEGORIES)
        difficulty = validate_enum(
            args.get("difficulty", ""), "difficulty", VALID_DIFFICULTIES
        )
        estimated_duration = validate_positive_int(
            args.get("estimatedDuration", 0), "estimatedDuration", max_value=86400
        )
    except ValidationError as e:
        raise Exception(str(e))

    stages_input = args.get("stages", [])
    if not stages_input or not isinstance(stages_input, list):
        raise Exception("At least one stage is required")

    if len(stages_input) < 2:
        raise Exception("Community quests require at least 2 stages")

    # Validate each stage
    total_points = 0
    stages = []
    for i, stage_input in enumerate(stages_input):
        stage = dict(stage_input)
        if not stage.get("id"):
            stage["id"] = str(uuid.uuid4())

        # Validate stage fields
        if not stage.get("title"):
            raise Exception(f"Stage {i + 1}: title is required")
        if not stage.get("description"):
            raise Exception(f"Stage {i + 1}: description is required")

        # Validate location
        location = stage.get("location", {})
        if not location.get("name"):
            raise Exception(f"Stage {i + 1}: location name is required")

        # Validate character
        character = stage.get("character", {})
        if not character.get("name"):
            raise Exception(f"Stage {i + 1}: character name is required")
        if not character.get("personality"):
            raise Exception(f"Stage {i + 1}: character personality is required")
        if not character.get("voiceStyle"):
            raise Exception(f"Stage {i + 1}: character voiceStyle is required")
        if not character.get("greetingMessage"):
            raise Exception(f"Stage {i + 1}: character greetingMessage is required")

        # Validate challenge
        challenge = stage.get("challenge", {})
        if not challenge.get("type"):
            raise Exception(f"Stage {i + 1}: challenge type is required")
        if challenge.get("type") not in VALID_CHALLENGE_TYPES:
            raise Exception(
                f"Stage {i + 1}: invalid challenge type '{challenge.get('type')}'"
            )
        if not challenge.get("description"):
            raise Exception(f"Stage {i + 1}: challenge description is required")
        if not challenge.get("successCriteria"):
            raise Exception(f"Stage {i + 1}: challenge successCriteria is required")

        stage_points = int(stage.get("points", 0))
        if stage_points <= 0:
            raise Exception(f"Stage {i + 1}: points must be positive")
        total_points += stage_points
        stages.append(stage)

    # Validate quest-level location
    quest_location = args.get("location", {})
    if not quest_location.get("name"):
        raise Exception("Quest location name is required")

    radius = args.get("radius", 0)
    if radius <= 0:
        raise Exception("Quest radius must be positive")

    tags = args.get("tags", [])
    if not isinstance(tags, list):
        raise Exception("Tags must be a list")

    now = datetime.now(timezone.utc).isoformat()

    item = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "category": category,
        "difficulty": difficulty,
        "estimatedDuration": estimated_duration,
        "coverImageUrl": args.get("coverImageUrl"),
        "stages": stages,
        "totalPoints": total_points,
        "location": quest_location,
        "radius": radius,
        "tags": tags,
        "isPublished": False,  # Community quests need admin approval
        "isCommunityQuest": True,
        "createdBy": user_id,
        "createdAt": now,
        "updatedAt": now,
    }

    quests_table.put_item(Item=item)
    return convert_decimals(item)
