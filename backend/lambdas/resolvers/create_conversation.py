import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access
from validation import validate_uuid, ValidationError

dynamodb = boto3.resource("dynamodb")
conversations_table = dynamodb.Table(os.environ["CONVERSATIONS_TABLE"])
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})

    try:
        quest_id = validate_uuid(args.get("questId"), "questId")
        stage_id = validate_uuid(args.get("stageId"), "stageId")
    except ValidationError as e:
        raise Exception(str(e))

    # Fetch quest and find the stage
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    stages = quest.get("stages", [])
    if isinstance(stages, str):
        stages = json.loads(stages)

    stage = None
    for s in stages:
        if s.get("id") == stage_id:
            stage = s
            break

    if not stage:
        raise Exception("Stage not found in quest")

    character = stage.get("character", {})
    if isinstance(character, str):
        character = json.loads(character)

    item = {
        "id": str(uuid.uuid4()),
        "userId": user_id,
        "questId": quest_id,
        "stageId": stage_id,
        "characterName": character.get("name", "Unknown"),
        "transcript": "[]",
        "status": "in_progress",
        "startedAt": datetime.now(timezone.utc).isoformat(),
    }
    conversations_table.put_item(Item=item)
    return item
