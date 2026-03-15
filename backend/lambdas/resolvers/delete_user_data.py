import os
import json
import logging
from datetime import datetime, timezone

import boto3
from boto3.dynamodb.conditions import Key

from auth_helpers import check_user_access

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])
conversations_table = dynamodb.Table(os.environ["CONVERSATIONS_TABLE"])
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])
achievements_table = dynamodb.Table(os.environ["ACHIEVEMENTS_TABLE"])
cognito = boto3.client("cognito-idp")
USER_POOL_ID = os.environ["USER_POOL_ID"]


def delete_items_by_user(table, index_name, user_id, pk_name="id"):
    """Query a GSI by userId and delete all matching items."""
    deleted_count = 0
    try:
        kwargs = {
            "IndexName": index_name,
            "KeyConditionExpression": Key("userId").eq(user_id),
        }
        while True:
            resp = table.query(**kwargs)
            items = resp.get("Items", [])
            for item in items:
                pk_value = item.get(pk_name)
                if pk_value:
                    table.delete_item(Key={pk_name: pk_value})
                    deleted_count += 1
            last_key = resp.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key
    except Exception as e:
        logger.error(f"Error deleting from {table.table_name}: {e}")
    return deleted_count


def handler(event, context):
    identity = event.get("identity", {})
    username = identity.get("username", "")
    user_id = identity.get("sub", "") or username
    check_user_access(user_id)
    now = datetime.now(timezone.utc).isoformat()

    # Audit log BEFORE deletion (GDPR requires this)
    audit_entry = {
        "action": "GDPR_ACCOUNT_DELETION",
        "userId": user_id,
        "username": username,
        "timestamp": now,
        "sourceIp": event.get("request", {}).get("headers", {}).get("x-forwarded-for", "unknown"),
    }
    logger.info(json.dumps(audit_entry))

    deletion_results = {}

    # 1. Delete progress records
    deletion_results["progress"] = delete_items_by_user(
        progress_table, "userId-questId-index", user_id
    )

    # 2. Delete conversations
    deletion_results["conversations"] = delete_items_by_user(
        conversations_table, "userId-startedAt-index", user_id
    )

    # 3. Delete scores
    deletion_results["scores"] = delete_items_by_user(
        scores_table, "userId-completedAt-index", user_id
    )

    # 4. Delete achievements
    deletion_results["achievements"] = delete_items_by_user(
        achievements_table, "userId-earnedAt-index", user_id
    )

    # 5. Delete user profile
    try:
        users_table.delete_item(Key={"userId": user_id})
        deletion_results["user"] = 1
    except Exception as e:
        logger.error(f"Error deleting user profile: {e}")
        deletion_results["user"] = 0

    # 6. Delete Cognito account
    try:
        cognito.admin_delete_user(
            UserPoolId=USER_POOL_ID,
            Username=username,
        )
        deletion_results["cognito"] = True
    except Exception as e:
        logger.error(f"Error deleting Cognito user: {e}")
        deletion_results["cognito"] = False

    # Final audit log with results
    logger.info(json.dumps({
        "action": "GDPR_ACCOUNT_DELETION_COMPLETE",
        "userId": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "deletionResults": deletion_results,
    }))

    return True
