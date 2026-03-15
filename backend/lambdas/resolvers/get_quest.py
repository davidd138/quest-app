import os
import boto3
from boto3.dynamodb.conditions import Key
from auth_helpers import check_user_access
from validation import validate_uuid, convert_decimals, ValidationError

dynamodb = boto3.resource("dynamodb")
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})

    try:
        quest_id = validate_uuid(args.get("id"), "id")
    except ValidationError as e:
        raise Exception(str(e))

    # Get the quest
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    # Query user's progress for this quest
    progress_resp = progress_table.query(
        IndexName="userId-questId-index",
        KeyConditionExpression=Key("userId").eq(user_id) & Key("questId").eq(quest_id),
    )
    progress_items = progress_resp.get("Items", [])

    if progress_items:
        quest["userProgress"] = progress_items[0]

    return convert_decimals(quest)
