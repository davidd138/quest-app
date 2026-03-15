import os
import boto3
from auth_helpers import check_admin_access
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    check_admin_access(event, user_id)

    args = event.get("arguments", {})
    limit = args.get("limit", 50)
    next_token = args.get("nextToken")

    if not isinstance(limit, int) or limit < 1:
        limit = 50
    limit = min(limit, 100)

    scan_kwargs = {
        "FilterExpression": Attr("isPublished").eq(False) & Attr("isCommunityQuest").eq(True),
        "Limit": limit,
    }

    if next_token:
        scan_kwargs["ExclusiveStartKey"] = {"id": next_token}

    response = quests_table.scan(**scan_kwargs)
    items = response.get("Items", [])

    # Sort by createdAt descending (newest first)
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

    result = {
        "items": items[:limit],
        "nextToken": None,
    }

    last_key = response.get("LastEvaluatedKey")
    if last_key:
        result["nextToken"] = last_key.get("id")

    return result
