import os
import boto3
from boto3.dynamodb.conditions import Key
from auth_helpers import check_user_access
from validation import validate_uuid, convert_decimals, ValidationError

dynamodb = boto3.resource("dynamodb")
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

    # Query progress by userId and questId
    progress_resp = progress_table.query(
        IndexName="userId-questId-index",
        KeyConditionExpression=Key("userId").eq(user_id) & Key("questId").eq(quest_id),
    )
    items = progress_resp.get("Items", [])

    if items:
        return convert_decimals(items[0])

    return None
