import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import validate_uuid, validate_string, validate_enum, ValidationError

quests_table = boto3.resource("dynamodb").Table(os.environ["QUESTS_TABLE"])

UPDATABLE_FIELDS = [
    "title", "description", "category", "difficulty", "estimatedDuration",
    "coverImageUrl", "stages", "location", "radius", "tags", "isPublished",
]

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
        quest_id = validate_uuid(args.get("id", ""), "id")
    except ValidationError as e:
        raise Exception(str(e))

    # Verify quest exists
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    # Validate provided fields
    try:
        if "title" in args and args["title"] is not None:
            validate_string(args["title"], "title", max_length=200)
        if "description" in args and args["description"] is not None:
            validate_string(args["description"], "description", max_length=2000)
        if "category" in args and args["category"] is not None:
            validate_enum(args["category"], "category", VALID_CATEGORIES)
        if "difficulty" in args and args["difficulty"] is not None:
            validate_enum(args["difficulty"], "difficulty", VALID_DIFFICULTIES)
    except ValidationError as e:
        raise Exception(str(e))

    update_parts = []
    expr_values = {}
    expr_names = {}

    for field in UPDATABLE_FIELDS:
        if field in args and args[field] is not None:
            safe = f"#{field}"
            update_parts.append(f"{safe} = :{field}")
            expr_values[f":{field}"] = args[field]
            expr_names[safe] = field

    if not update_parts:
        return quest

    # Recalculate totalPoints if stages are updated
    if "stages" in args and args["stages"] is not None:
        stages = args["stages"]
        # Generate IDs for new stages
        for stage in stages:
            if not stage.get("id"):
                stage["id"] = str(uuid.uuid4())
        total_points = sum(int(s.get("points", 0)) for s in stages)
        update_parts.append("#totalPoints = :totalPoints")
        expr_values[":totalPoints"] = total_points
        expr_names["#totalPoints"] = "totalPoints"

    update_parts.append("#updatedAt = :updatedAt")
    expr_values[":updatedAt"] = datetime.now(timezone.utc).isoformat()
    expr_names["#updatedAt"] = "updatedAt"

    quests_table.update_item(
        Key={"id": quest_id},
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeValues=expr_values,
        ExpressionAttributeNames=expr_names,
    )

    # Return updated quest
    for field in UPDATABLE_FIELDS:
        if field in args and args[field] is not None:
            quest[field] = args[field]
    quest["updatedAt"] = expr_values[":updatedAt"]

    return quest
