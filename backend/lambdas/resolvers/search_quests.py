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
    query = args.get("query", "").strip()
    category = args.get("category")
    difficulty = args.get("difficulty")
    limit = args.get("limit", 50)

    if not query:
        raise Exception("query is required")

    if limit is not None and (not isinstance(limit, int) or limit < 1):
        limit = 50
    limit = min(limit, 100)

    is_admin = user.get("role") == "admin"

    # Build filter expressions
    filter_parts = []
    expr_names = {}
    expr_values = {}

    # Text search: title, description, or tags contain query (case-insensitive)
    query_lower = query.lower()
    filter_parts.append(
        "(contains(#title_lower, :query) OR contains(#desc_lower, :query) OR contains(#tags_str, :query))"
    )
    expr_names["#title_lower"] = "titleLower"
    expr_names["#desc_lower"] = "descriptionLower"
    expr_names["#tags_str"] = "tagsLower"
    expr_values[":query"] = query_lower

    # Non-admins only see published quests
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

    response = quests_table.scan(**scan_kwargs)
    items = response.get("Items", [])

    # Fallback: if no results from indexed lower fields, do in-memory search
    # This handles quests that don't have the *Lower fields yet
    if not items:
        # Re-scan without the text filter, then filter in-memory
        fallback_filter_parts = []
        fallback_names = {}
        fallback_values = {}

        if not is_admin:
            fallback_filter_parts.append("#pub = :pub")
            fallback_names["#pub"] = "isPublished"
            fallback_values[":pub"] = True

        if category:
            fallback_filter_parts.append("#cat = :cat")
            fallback_names["#cat"] = "category"
            fallback_values[":cat"] = category

        if difficulty:
            fallback_filter_parts.append("#diff = :diff")
            fallback_names["#diff"] = "difficulty"
            fallback_values[":diff"] = difficulty

        fallback_kwargs = {}
        if fallback_filter_parts:
            fallback_kwargs["FilterExpression"] = " AND ".join(fallback_filter_parts)
            fallback_kwargs["ExpressionAttributeNames"] = fallback_names
            fallback_kwargs["ExpressionAttributeValues"] = fallback_values

        all_results = quests_table.scan(**fallback_kwargs)
        all_items = all_results.get("Items", [])

        # In-memory text search
        for item in all_items:
            title = (item.get("title") or "").lower()
            desc = (item.get("description") or "").lower()
            tags = [t.lower() for t in (item.get("tags") or [])]
            tags_str = " ".join(tags)

            if query_lower in title or query_lower in desc or query_lower in tags_str:
                items.append(item)
                if len(items) >= limit:
                    break

    result = {
        "items": items[:limit],
        "nextToken": None,
    }

    last_key = response.get("LastEvaluatedKey")
    if last_key:
        result["nextToken"] = last_key.get("id")

    return result
