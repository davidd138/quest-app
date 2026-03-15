import os
import boto3
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    user = check_user_access(user_id)

    args = event.get("arguments", {})
    category = args.get("category")
    difficulty = args.get("difficulty")
    limit = args.get("limit", 50)
    next_token = args.get("nextToken")

    is_admin = user.get("role") == "admin"

    # Build filter expressions
    filter_parts = []
    expr_names = {}
    expr_values = {}

    if not is_admin:
        filter_parts.append("#pub = :pub")
        expr_names["#pub"] = "isPublished"
        expr_values[":pub"] = True

    if category:
        filter_parts.append("#cat = :cat")
        expr_names["#cat"] = "category"
        expr_values[":cat"] = category

    if difficulty:
        filter_parts.append("#diff = :diff")
        expr_names["#diff"] = "difficulty"
        expr_values[":diff"] = difficulty

    scan_kwargs = {"Limit": limit}

    if filter_parts:
        scan_kwargs["FilterExpression"] = " AND ".join(filter_parts)
        scan_kwargs["ExpressionAttributeNames"] = expr_names
        scan_kwargs["ExpressionAttributeValues"] = expr_values

    if next_token:
        scan_kwargs["ExclusiveStartKey"] = {"id": next_token}

    response = quests_table.scan(**scan_kwargs)

    result = {
        "items": response.get("Items", []),
        "nextToken": None,
    }

    last_key = response.get("LastEvaluatedKey")
    if last_key:
        result["nextToken"] = last_key.get("id")

    return result
