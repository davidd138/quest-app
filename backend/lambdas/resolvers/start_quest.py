import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key
from auth_helpers import check_user_access
from validation import validate_uuid, ValidationError

dynamodb = boto3.resource("dynamodb")
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})

    try:
        quest_id = validate_uuid(args.get("questId"), "questId")
    except ValidationError as e:
        raise Exception(str(e))

    # Verify quest exists and is published
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")
    if not quest.get("isPublished"):
        raise Exception("Quest is not available")

    # Check if progress already exists
    progress_resp = progress_table.query(
        IndexName="userId-questId-index",
        KeyConditionExpression=Key("userId").eq(user_id) & Key("questId").eq(quest_id),
    )
    existing = progress_resp.get("Items", [])
    if existing:
        return existing[0]

    now = datetime.now(timezone.utc).isoformat()

    item = {
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "questId": quest_id,
        "currentStageIndex": 0,
        "completedStages": [],
        "status": "in_progress",
        "startedAt": now,
        "totalPoints": 0,
        "totalDuration": 0,
    }
    progress_table.put_item(Item=item)

    return item
