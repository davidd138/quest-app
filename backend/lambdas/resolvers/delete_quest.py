import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import validate_uuid, ValidationError

quests_table = boto3.resource("dynamodb").Table(os.environ["QUESTS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_admin_access(event, user_id)

    try:
        quest_id = validate_uuid(event.get("arguments", {}).get("id", ""), "id")
    except ValidationError as e:
        raise Exception(str(e))

    # Verify quest exists
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    quests_table.delete_item(Key={"id": quest_id})

    return True
