import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import (
    validate_string,
    validate_enum,
    validate_positive_int,
    ValidationError,
)

quests_table = boto3.resource("dynamodb").Table(os.environ["QUESTS_TABLE"])

VALID_CATEGORIES = [
    "adventure", "mystery", "cultural", "educational",
    "culinary", "nature", "urban", "team_building",
]
VALID_DIFFICULTIES = ["easy", "medium", "hard", "legendary"]


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_admin_access(event, user_id)

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

    # Generate IDs for stages and calculate total points
    total_points = 0
    stages = []
    for i, stage_input in enumerate(stages_input):
        stage = dict(stage_input)
        if not stage.get("id"):
            stage["id"] = str(uuid.uuid4())
        stage_points = int(stage.get("points", 0))
        total_points += stage_points
        stages.append(stage)

    now = datetime.now(timezone.utc).isoformat()

    location = args.get("location", {})
    radius = args.get("radius", 0)
    tags = args.get("tags", [])
    is_published = args.get("isPublished", False)

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
        "location": location,
        "radius": radius,
        "tags": tags,
        "isPublished": is_published,
        "createdBy": user_id,
        "createdAt": now,
        "updatedAt": now,
    }

    quests_table.put_item(Item=item)
    return item
