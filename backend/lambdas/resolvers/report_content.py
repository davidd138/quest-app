import os
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access
from validation import validate_string, validate_enum, convert_decimals, ValidationError

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])

VALID_CONTENT_TYPES = ["quest", "review", "chat_message", "user_profile"]
VALID_REASONS = ["inappropriate", "offensive", "spam", "plagiarism", "other"]


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})

    try:
        content_type = validate_enum(
            args.get("contentType", ""), "contentType", VALID_CONTENT_TYPES
        )
        content_id = validate_string(args.get("contentId", ""), "contentId", max_length=200)
        reason = validate_enum(args.get("reason", ""), "reason", VALID_REASONS)
    except ValidationError as e:
        raise Exception(str(e))

    details = args.get("details")
    if details is not None:
        try:
            details = validate_string(details, "details", max_length=2000)
        except ValidationError as e:
            raise Exception(str(e))

    # Check for duplicate report from same user for same content
    duplicate_id = f"report#{user_id}#{content_type}#{content_id}"
    existing = users_table.get_item(Key={"userId": duplicate_id}).get("Item")
    if existing and existing.get("status") != "dismissed":
        raise Exception("You have already reported this content")

    now = datetime.now(timezone.utc).isoformat()
    report_id = str(uuid.uuid4())

    item = {
        "userId": f"report#{report_id}",
        "reporterId": user_id,
        "contentType": content_type,
        "contentId": content_id,
        "reason": reason,
        "details": details,
        "status": "pending",
        "createdAt": now,
        "duplicateKey": duplicate_id,
    }

    # Also store the duplicate-check key
    duplicate_item = {
        "userId": duplicate_id,
        "reportId": report_id,
        "status": "pending",
        "createdAt": now,
    }

    users_table.put_item(Item=item)
    users_table.put_item(Item=duplicate_item)

    return convert_decimals({
        "id": report_id,
        "reporterId": user_id,
        "contentType": content_type,
        "contentId": content_id,
        "reason": reason,
        "details": details,
        "status": "pending",
        "createdAt": now,
    })
