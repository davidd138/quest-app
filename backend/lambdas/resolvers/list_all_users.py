import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import convert_decimals

users_table = boto3.resource("dynamodb").Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_admin_access(event, user_id)

    args = event.get("arguments", {})
    limit = args.get("limit")

    scan_kwargs = {}
    if limit:
        scan_kwargs["Limit"] = limit

    next_token = args.get("nextToken")
    if next_token:
        scan_kwargs["ExclusiveStartKey"] = json.loads(next_token)

    response = users_table.scan(**scan_kwargs)
    items = response.get("Items", [])

    # Ensure all required fields have defaults
    for item in items:
        item.setdefault("status", "pending")
        item.setdefault("totalPoints", 0)
        item.setdefault("questsCompleted", 0)
        item.setdefault("groups", [])

    # Sort: pending first, then by email
    status_order = {"pending": 0, "active": 1, "suspended": 2, "expired": 3}
    items.sort(
        key=lambda x: (
            status_order.get(x.get("status", "pending"), 9),
            x.get("email", ""),
        )
    )

    result = {"items": convert_decimals(items)}
    if "LastEvaluatedKey" in response:
        result["nextToken"] = json.dumps(response["LastEvaluatedKey"])

    return result
