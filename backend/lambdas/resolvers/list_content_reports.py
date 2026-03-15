import os
import boto3
from auth_helpers import check_admin_access
from validation import convert_decimals

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    check_admin_access(event, user_id)

    args = event.get("arguments", {})
    status_filter = args.get("status")
    limit = args.get("limit", 50)

    if not isinstance(limit, int) or limit < 1:
        limit = 50
    limit = min(limit, 100)

    # Scan users table for items with report# prefix
    scan_kwargs = {}
    response = users_table.scan(**scan_kwargs)
    all_items = response.get("Items", [])

    # Handle pagination for large tables
    while "LastEvaluatedKey" in response:
        response = users_table.scan(
            ExclusiveStartKey=response["LastEvaluatedKey"],
        )
        all_items.extend(response.get("Items", []))

    # Filter for report items
    reports = []
    for item in all_items:
        pk = item.get("userId", "")
        if not pk.startswith("report#") or pk.count("#") != 1:
            # Only pick items like report#<uuid>, not duplicate-check keys
            continue

        report_id = pk.replace("report#", "")

        report = {
            "id": report_id,
            "reporterId": item.get("reporterId", ""),
            "contentType": item.get("contentType", ""),
            "contentId": item.get("contentId", ""),
            "reason": item.get("reason", ""),
            "details": item.get("details"),
            "status": item.get("status", "pending"),
            "createdAt": item.get("createdAt", ""),
        }

        if status_filter and report["status"] != status_filter:
            continue

        reports.append(report)

    # Sort by date descending
    reports.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

    return convert_decimals(reports[:limit])
