"""Audit logging module for GDPR compliance and platform monitoring.

Writes audit events to the USERS_TABLE using a PK prefix of 'audit#'
to colocate audit records alongside user data without a separate table.
"""

import os
import uuid
import logging
from datetime import datetime, timezone

import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])

# Allowed audit actions
AUDIT_ACTIONS = frozenset([
    "login",
    "quest_start",
    "quest_complete",
    "conversation_start",
    "data_export",
    "account_delete",
    "admin_action",
])


def log_audit_event(
    user_id,
    action,
    resource_type,
    resource_id,
    details=None,
    ip_address=None,
):
    """Persist an audit event to DynamoDB.

    Parameters
    ----------
    user_id : str
        The Cognito sub of the acting user.
    action : str
        One of the recognised AUDIT_ACTIONS.
    resource_type : str
        The kind of resource affected (e.g. 'quest', 'conversation', 'user').
    resource_id : str
        The ID of the affected resource.
    details : dict | None
        Optional free-form metadata about the event.
    ip_address : str | None
        Source IP address if available from the request context.

    Returns
    -------
    dict
        The audit event item that was written.
    """
    if action not in AUDIT_ACTIONS:
        raise ValueError(
            f"Unknown audit action '{action}'. "
            f"Must be one of: {', '.join(sorted(AUDIT_ACTIONS))}"
        )

    if not user_id or not isinstance(user_id, str):
        raise ValueError("user_id must be a non-empty string")

    if not resource_type or not isinstance(resource_type, str):
        raise ValueError("resource_type must be a non-empty string")

    if not resource_id or not isinstance(resource_id, str):
        raise ValueError("resource_id must be a non-empty string")

    now = datetime.now(timezone.utc).isoformat()
    event_id = str(uuid.uuid4())

    item = {
        "userId": f"audit#{event_id}",
        "id": event_id,
        "actorUserId": user_id,
        "action": action,
        "resourceType": resource_type,
        "resourceId": resource_id,
        "timestamp": now,
        "ipAddress": ip_address or "unknown",
    }

    if details and isinstance(details, dict):
        item["details"] = details

    try:
        users_table.put_item(Item=item)
        logger.info(
            "Audit event recorded: action=%s user=%s resource=%s/%s",
            action,
            user_id,
            resource_type,
            resource_id,
        )
    except Exception:
        # Audit logging must never break the caller's flow.
        # Log the failure and let the request continue.
        logger.exception(
            "Failed to write audit event: action=%s user=%s", action, user_id
        )

    return item


def query_audit_events(
    action_filter=None,
    user_id_filter=None,
    start_date=None,
    end_date=None,
    limit=50,
    last_key=None,
):
    """Scan audit events with optional filters.

    This performs a DynamoDB scan with filter expressions.
    Suitable for admin dashboards with moderate traffic.

    Parameters
    ----------
    action_filter : str | None
        Filter to a specific action type.
    user_id_filter : str | None
        Filter by the actor's userId.
    start_date : str | None
        ISO date string for range start.
    end_date : str | None
        ISO date string for range end.
    limit : int
        Maximum number of items to return.
    last_key : dict | None
        Pagination token from a previous call.

    Returns
    -------
    dict
        {items: [...], lastKey: ... | None}
    """
    from boto3.dynamodb.conditions import Key, Attr

    filter_parts = [Attr("userId").begins_with("audit#")]

    if action_filter:
        filter_parts.append(Attr("action").eq(action_filter))

    if user_id_filter:
        filter_parts.append(Attr("actorUserId").eq(user_id_filter))

    if start_date:
        filter_parts.append(Attr("timestamp").gte(start_date))

    if end_date:
        filter_parts.append(Attr("timestamp").lte(end_date))

    combined_filter = filter_parts[0]
    for fp in filter_parts[1:]:
        combined_filter = combined_filter & fp

    scan_kwargs = {
        "FilterExpression": combined_filter,
        "Limit": min(limit, 200),
    }

    if last_key:
        scan_kwargs["ExclusiveStartKey"] = last_key

    response = users_table.scan(**scan_kwargs)

    items = response.get("Items", [])
    # Sort by timestamp descending
    items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

    return {
        "items": items,
        "lastKey": response.get("LastEvaluatedKey"),
    }
