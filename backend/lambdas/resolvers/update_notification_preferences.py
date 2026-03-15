import os
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    # Validate caller has access
    check_user_access(user_id)

    args = event.get("arguments", {})
    input_data = args.get("input", {})

    allowed_keys = {
        "emailNotifications",
        "pushNotifications",
        "inAppNotifications",
        "marketingEmails",
    }

    preferences = {}
    for key in allowed_keys:
        if key in input_data:
            val = input_data[key]
            if not isinstance(val, bool):
                raise Exception(f"{key} must be a boolean")
            preferences[key] = val

    if not preferences:
        raise Exception("At least one notification preference must be provided")

    now = datetime.now(timezone.utc).isoformat()

    # Build update expression
    update_parts = []
    expr_names = {}
    expr_values = {":updatedAt": now}

    for key, val in preferences.items():
        safe_key = f"#np_{key}"
        safe_val = f":np_{key}"
        update_parts.append(f"notificationPreferences.{safe_key} = {safe_val}")
        expr_names[safe_key] = key
        expr_values[safe_val] = val

    update_parts.append("updatedAt = :updatedAt")

    # Ensure notificationPreferences map exists
    users_table.update_item(
        Key={"userId": user_id},
        UpdateExpression="SET #np = if_not_exists(#np, :empty_map)",
        ExpressionAttributeNames={"#np": "notificationPreferences"},
        ExpressionAttributeValues={":empty_map": {}},
    )

    # Now update the individual preferences
    response = users_table.update_item(
        Key={"userId": user_id},
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
        ReturnValues="ALL_NEW",
    )

    item = response.get("Attributes", {})
    prefs = item.get("notificationPreferences", {})

    return {
        "emailNotifications": prefs.get("emailNotifications", True),
        "pushNotifications": prefs.get("pushNotifications", True),
        "inAppNotifications": prefs.get("inAppNotifications", True),
        "marketingEmails": prefs.get("marketingEmails", True),
    }
