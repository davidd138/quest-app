import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access
from validation import validate_uuid, convert_decimals, ValidationError

conversations_table = boto3.resource("dynamodb").Table(os.environ["CONVERSATIONS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    try:
        conv_id = validate_uuid(event.get("arguments", {}).get("id", ""), "id")
    except ValidationError as e:
        raise Exception(str(e))

    conv = conversations_table.get_item(Key={"id": conv_id}).get("Item")
    if not conv or conv["userId"] != user_id:
        raise Exception("Not found or unauthorized")

    return convert_decimals(conv)
