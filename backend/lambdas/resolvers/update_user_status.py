import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import validate_uuid, validate_enum, ValidationError

users_table = boto3.resource("dynamodb").Table(os.environ["USERS_TABLE"])

VALID_STATUSES = ["pending", "active", "suspended", "expired"]


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_admin_access(event, user_id)

    args = event.get("arguments", {})

    try:
        target_user_id = validate_uuid(args.get("userId", ""), "userId")
        status = validate_enum(args.get("status", ""), "status", VALID_STATUSES)
    except ValidationError as e:
        raise Exception(str(e))

    # Verify user exists
    user = users_table.get_item(Key={"userId": target_user_id}).get("Item")
    if not user:
        raise Exception("User not found")

    users_table.update_item(
        Key={"userId": target_user_id},
        UpdateExpression="SET #s = :s, updatedAt = :ua",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":s": status,
            ":ua": datetime.now(timezone.utc).isoformat(),
        },
    )

    user["status"] = status
    user.setdefault("groups", [])

    return user
