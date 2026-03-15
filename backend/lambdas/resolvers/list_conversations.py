import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key, Attr
from auth_helpers import check_user_access
from validation import convert_decimals

conversations_table = boto3.resource("dynamodb").Table(os.environ["CONVERSATIONS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    limit = args.get("limit", 20)
    quest_id = args.get("questId")

    query_kwargs = {
        "IndexName": "userId-startedAt-index",
        "KeyConditionExpression": Key("userId").eq(user_id),
        "ScanIndexForward": False,
        "Limit": limit,
    }

    if quest_id:
        query_kwargs["FilterExpression"] = Attr("questId").eq(quest_id)

    next_token = args.get("nextToken")
    if next_token:
        query_kwargs["ExclusiveStartKey"] = json.loads(next_token)

    response = conversations_table.query(**query_kwargs)

    result = {"items": convert_decimals(response.get("Items", []))}
    if "LastEvaluatedKey" in response:
        result["nextToken"] = json.dumps(response["LastEvaluatedKey"])

    return result
