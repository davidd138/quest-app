import os
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access
from validation import validate_uuid, validate_enum, convert_decimals, ValidationError

dynamodb = boto3.resource("dynamodb")
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})

    try:
        progress_id = validate_uuid(args.get("id"), "id")
    except ValidationError as e:
        raise Exception(str(e))

    # Fetch existing progress and validate ownership
    existing = progress_table.get_item(Key={"id": progress_id}).get("Item")
    if not existing:
        raise Exception("Progress not found")
    if existing["userId"] != user_id:
        raise Exception("Not authorized to update this progress")

    now = datetime.now(timezone.utc).isoformat()

    update_parts = ["#updatedAt = :updatedAt"]
    expr_names = {"#updatedAt": "updatedAt"}
    expr_values = {":updatedAt": now}

    if "currentStageIndex" in args:
        current_stage_index = args["currentStageIndex"]
        if not isinstance(current_stage_index, int) or current_stage_index < 0:
            raise Exception("currentStageIndex must be a non-negative integer")
        update_parts.append("#csi = :csi")
        expr_names["#csi"] = "currentStageIndex"
        expr_values[":csi"] = current_stage_index

    if "status" in args:
        try:
            status = validate_enum(
                args["status"], "status",
                ["in_progress", "completed", "abandoned"],
            )
        except ValidationError as e:
            raise Exception(str(e))
        update_parts.append("#status = :status")
        expr_names["#status"] = "status"
        expr_values[":status"] = status

    response = progress_table.update_item(
        Key={"id": progress_id},
        UpdateExpression="SET " + ", ".join(update_parts),
        ExpressionAttributeNames=expr_names,
        ExpressionAttributeValues=expr_values,
        ReturnValues="ALL_NEW",
    )

    return convert_decimals(response["Attributes"])
