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


def scan_by_user_id(table, index_name, user_id, sort_key_name=None):
    """Query a GSI by userId to get all items for a user."""
    try:
        kwargs = {
            "IndexName": index_name,
            "KeyConditionExpression": Key("userId").eq(user_id),
        }
        items = []
        while True:
            resp = table.query(**kwargs)
            items.extend(resp.get("Items", []))
            last_key = resp.get("LastEvaluatedKey")
            if not last_key:
                break
            kwargs["ExclusiveStartKey"] = last_key
        return items
    except Exception as e:
        logger.warning(f"Error querying {table.table_name}: {e}")
        return []


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "") or identity.get("username", "")
    check_user_access(user_id)
    now = datetime.now(timezone.utc).isoformat()

    logger.info(
        json.dumps({
            "action": "GDPR_DATA_EXPORT",
            "userId": user_id,
            "timestamp": now,
            "sourceIp": event.get("request", {}).get("headers", {}).get("x-forwarded-for", "unknown"),
        })
    )

    # Fetch user profile
    user_resp = users_table.get_item(Key={"userId": user_id})
    user_data = user_resp.get("Item", {})

    # Fetch progress records
    progress_items = scan_by_user_id(
        progress_table, "userId-questId-index", user_id
    )

    # Fetch conversations
    conversation_items = scan_by_user_id(
        conversations_table, "userId-startedAt-index", user_id
    )

    # Fetch scores
    score_items = scan_by_user_id(
        scores_table, "userId-completedAt-index", user_id
    )

    # Fetch achievements
    achievement_items = scan_by_user_id(
        achievements_table, "userId-earnedAt-index", user_id
    )

    # Convert DynamoDB Decimal types to int/float for JSON serialization
    def convert_decimals(obj):
        if isinstance(obj, list):
            return [convert_decimals(i) for i in obj]
        elif isinstance(obj, dict):
            return {k: convert_decimals(v) for k, v in obj.items()}
        elif hasattr(obj, "__int__") and not isinstance(obj, (int, float, bool, str)):
            if float(obj) == int(obj):
                return int(obj)
            return float(obj)
        return obj

    # Record audit log in user table
    users_table.update_item(
        Key={"userId": user_id},
        UpdateExpression="SET lastDataExportAt = :ts",
        ExpressionAttributeValues={":ts": now},
    )

    result = {
        "user": convert_decimals(user_data),
        "progress": convert_decimals(progress_items),
        "conversations": convert_decimals(conversation_items),
        "scores": convert_decimals(score_items),
        "achievements": convert_decimals(achievement_items),
        "exportedAt": now,
    }

    return result
