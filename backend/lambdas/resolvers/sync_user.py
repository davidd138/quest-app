import os
import boto3
from datetime import datetime, timezone

users_table = boto3.resource("dynamodb").Table(os.environ["USERS_TABLE"])
cognito = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["USER_POOL_ID"]


def handler(event, context):
    identity = event.get("identity", {})
    username = identity.get("username", "")
    user_id = identity.get("sub", "") or username

    # Look up user attributes from Cognito
    cognito_user = cognito.admin_get_user(
        UserPoolId=USER_POOL_ID,
        Username=username,
    )
    attrs = {a["Name"]: a["Value"] for a in cognito_user.get("UserAttributes", [])}
    email = attrs.get("email", "")
    name = attrs.get("name", "") or email.split("@")[0]

    if not user_id or not email:
        raise Exception(f"Missing user_id ({user_id!r}) or email ({email!r})")

    # Get Cognito groups for this user
    groups_resp = cognito.admin_list_groups_for_user(
        UserPoolId=USER_POOL_ID,
        Username=username,
    )
    groups = [g["GroupName"] for g in groups_resp.get("Groups", [])]
    is_admin = "admins" in groups

    now = datetime.now(timezone.utc).isoformat()

    # Preserve existing fields if user already exists
    existing = users_table.get_item(Key={"userId": user_id}).get("Item")

    if existing:
        role = "admin" if is_admin else existing.get("role", "player")
        status = existing.get("status", "active")
        total_points = existing.get("totalPoints", 0)
        quests_completed = existing.get("questsCompleted", 0)
        created_at = existing.get("createdAt", now)
    else:
        role = "admin" if is_admin else "player"
        status = "active"
        total_points = 0
        quests_completed = 0
        created_at = now

    item = {
        "userId": user_id,
        "email": email.lower(),
        "name": name,
        "role": role,
        "status": status,
        "totalPoints": total_points,
        "questsCompleted": quests_completed,
        "createdAt": created_at,
        "updatedAt": now,
    }
    users_table.put_item(Item=item)

    return item
