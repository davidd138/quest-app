import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key
from auth_helpers import check_user_access
from validation import validate_uuid, convert_decimals, ValidationError

dynamodb = boto3.resource("dynamodb")
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])
conversations_table = dynamodb.Table(os.environ["CONVERSATIONS_TABLE"])
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])
achievements_table = dynamodb.Table(os.environ["ACHIEVEMENTS_TABLE"])
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


ACHIEVEMENT_MILESTONES = {
    1: {"title": "First Quest", "description": "Completed your first quest"},
    5: {"title": "Adventurer", "description": "Completed 5 quests"},
    10: {"title": "Seasoned Explorer", "description": "Completed 10 quests"},
    25: {"title": "Quest Master", "description": "Completed 25 quests"},
    50: {"title": "Legend", "description": "Completed 50 quests"},
}


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})

    try:
        quest_id = validate_uuid(args.get("questId"), "questId")
        stage_id = validate_uuid(args.get("stageId"), "stageId")
        conversation_id = validate_uuid(args.get("conversationId"), "conversationId")
    except ValidationError as e:
        raise Exception(str(e))

    now = datetime.now(timezone.utc).isoformat()

    # Fetch quest to get stage info
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    stages = quest.get("stages", [])
    total_stages = len(stages)

    # Find the stage in the quest
    stage_info = None
    stage_index = None
    for i, s in enumerate(stages):
        if s.get("id") == stage_id:
            stage_info = s
            stage_index = i
            break

    if stage_info is None:
        raise Exception("Stage not found in quest")

    # Fetch conversation for duration and result
    conversation = conversations_table.get_item(Key={"id": conversation_id}).get("Item")
    if not conversation:
        raise Exception("Conversation not found")
    if conversation.get("userId") != user_id:
        raise Exception("Not authorized to use this conversation")

    duration = conversation.get("duration", 0)
    result = conversation.get("result", "completed")

    # Get or create progress for this quest
    progress_resp = progress_table.query(
        IndexName="userId-questId-index",
        KeyConditionExpression=Key("userId").eq(user_id) & Key("questId").eq(quest_id),
    )
    progress_items = progress_resp.get("Items", [])

    if progress_items:
        progress = progress_items[0]
    else:
        # Create new progress
        progress = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "questId": quest_id,
            "currentStageIndex": 0,
            "completedStages": [],
            "status": "in_progress",
            "startedAt": now,
            "totalPoints": 0,
            "totalDuration": 0,
        }
        progress_table.put_item(Item=progress)

    # Check if stage already completed
    completed_stages = progress.get("completedStages", [])
    already_completed = any(cs.get("stageId") == stage_id for cs in completed_stages)
    if already_completed:
        return convert_decimals(progress)

    # Build completed stage entry
    stage_points = stage_info.get("rewardPoints", 0)
    completed_stage = {
        "stageId": stage_id,
        "conversationId": conversation_id,
        "completedAt": now,
        "duration": duration,
        "result": result,
        "pointsEarned": stage_points,
    }

    completed_stages.append(completed_stage)
    new_total_points = progress.get("totalPoints", 0) + stage_points
    new_total_duration = progress.get("totalDuration", 0) + duration
    new_stage_index = max(progress.get("currentStageIndex", 0), stage_index + 1)

    all_complete = len(completed_stages) >= total_stages

    # Update progress
    update_expr = (
        "SET completedStages = :cs, totalPoints = :tp, totalDuration = :td, "
        "currentStageIndex = :csi, updatedAt = :now"
    )
    expr_values = {
        ":cs": completed_stages,
        ":tp": new_total_points,
        ":td": new_total_duration,
        ":csi": new_stage_index,
        ":now": now,
    }

    if all_complete:
        update_expr += ", #status = :status, completedAt = :completedAt"
        expr_values[":status"] = "completed"
        expr_values[":completedAt"] = now

    update_kwargs = {
        "Key": {"id": progress["id"]},
        "UpdateExpression": update_expr,
        "ExpressionAttributeValues": expr_values,
        "ReturnValues": "ALL_NEW",
    }
    if all_complete:
        update_kwargs["ExpressionAttributeNames"] = {"#status": "status"}

    response = progress_table.update_item(**update_kwargs)
    updated_progress = response["Attributes"]

    # If all stages complete, create score and check achievements
    if all_complete:
        # Create score entry
        score_item = {
            "id": str(uuid.uuid4()),
            "userId": user_id,
            "questId": quest_id,
            "progressId": progress["id"],
            "totalPoints": new_total_points,
            "totalDuration": new_total_duration,
            "completedAt": now,
        }
        scores_table.put_item(Item=score_item)

        # Update user stats
        users_table.update_item(
            Key={"userId": user_id},
            UpdateExpression=(
                "SET totalPoints = totalPoints + :pts, "
                "questsCompleted = questsCompleted + :one, "
                "updatedAt = :now"
            ),
            ExpressionAttributeValues={
                ":pts": new_total_points,
                ":one": 1,
                ":now": now,
            },
        )

        # Check achievement milestones
        user = users_table.get_item(Key={"userId": user_id}).get("Item", {})
        quests_completed = user.get("questsCompleted", 0)

        if quests_completed in ACHIEVEMENT_MILESTONES:
            milestone = ACHIEVEMENT_MILESTONES[quests_completed]
            achievement_item = {
                "id": str(uuid.uuid4()),
                "userId": user_id,
                "title": milestone["title"],
                "description": milestone["description"],
                "questsCompleted": quests_completed,
                "earnedAt": now,
            }
            achievements_table.put_item(Item=achievement_item)

    return convert_decimals(updated_progress)
