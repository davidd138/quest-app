import os
import boto3
from auth_helpers import check_user_access
from validation import convert_decimals

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    caller_id = identity.get("sub", "")

    # Validate caller has access
    check_user_access(caller_id)

    args = event.get("arguments", {})
    target_user_id = args.get("userId", "")

    if not target_user_id:
        raise Exception("userId is required")

    response = users_table.get_item(Key={"userId": target_user_id})
    user = response.get("Item")

    if not user:
        raise Exception("User not found")

    # Return only public fields — hide email, status details, etc.
    return convert_decimals({
        "userId": user.get("userId", target_user_id),
        "name": user.get("name"),
        "avatarUrl": user.get("avatarUrl"),
        "totalPoints": int(user.get("totalPoints", 0)),
        "questsCompleted": int(user.get("questsCompleted", 0)),
        "role": user.get("role", "user"),
        "createdAt": user.get("createdAt", ""),
    })
