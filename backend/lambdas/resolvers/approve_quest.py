import os
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import validate_string, ValidationError

dynamodb = boto3.resource("dynamodb")
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")

    check_admin_access(event, user_id)

    args = event.get("arguments", {})
    quest_id = args.get("questId", "")
    approved = args.get("approved")
    rejection_reason = args.get("rejectionReason")

    if not quest_id:
        raise Exception("questId is required")

    if approved is None or not isinstance(approved, bool):
        raise Exception("approved must be a boolean")

    if not approved and rejection_reason:
        try:
            rejection_reason = validate_string(
                rejection_reason, "rejectionReason", max_length=1000
            )
        except ValidationError as e:
            raise Exception(str(e))

    # Fetch quest
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    now = datetime.now(timezone.utc).isoformat()

    if approved:
        quests_table.update_item(
            Key={"id": quest_id},
            UpdateExpression="SET isPublished = :published, approvedAt = :now, approvedBy = :admin, updatedAt = :now",
            ExpressionAttributeValues={
                ":published": True,
                ":now": now,
                ":admin": user_id,
            },
        )
        quest["isPublished"] = True
        quest["approvedAt"] = now
        quest["approvedBy"] = user_id

        # Send notification to creator (mock - save to users table)
        creator_id = quest.get("createdBy")
        if creator_id:
            notification = {
                "userId": f"notification#{creator_id}#{now}",
                "targetUserId": creator_id,
                "type": "quest_approved",
                "message": f"Your quest '{quest.get('title', '')}' has been approved and published!",
                "questId": quest_id,
                "createdAt": now,
                "read": False,
            }
            users_table.put_item(Item=notification)
    else:
        update_expr = "SET rejectedAt = :now, rejectedBy = :admin, updatedAt = :now"
        expr_values = {
            ":now": now,
            ":admin": user_id,
        }

        if rejection_reason:
            update_expr += ", rejectionReason = :reason"
            expr_values[":reason"] = rejection_reason

        quests_table.update_item(
            Key={"id": quest_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
        )
        quest["rejectedAt"] = now
        quest["rejectedBy"] = user_id
        if rejection_reason:
            quest["rejectionReason"] = rejection_reason

        # Send rejection notification to creator
        creator_id = quest.get("createdBy")
        if creator_id:
            msg = f"Your quest '{quest.get('title', '')}' was not approved."
            if rejection_reason:
                msg += f" Reason: {rejection_reason}"
            notification = {
                "userId": f"notification#{creator_id}#{now}",
                "targetUserId": creator_id,
                "type": "quest_rejected",
                "message": msg,
                "questId": quest_id,
                "createdAt": now,
                "read": False,
            }
            users_table.put_item(Item=notification)

    quest["updatedAt"] = now
    return quest
