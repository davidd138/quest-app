import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key
from auth_helpers import check_user_access
from validation import convert_decimals

achievements_table = boto3.resource("dynamodb").Table(os.environ["ACHIEVEMENTS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    response = achievements_table.query(
        IndexName="userId-earnedAt-index",
        KeyConditionExpression=Key("userId").eq(user_id),
        ScanIndexForward=False,
    )

    return convert_decimals(response.get("Items", []))
