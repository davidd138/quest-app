import os
import boto3
from decimal import Decimal
from auth_helpers import check_user_access
from validation import validate_uuid, convert_decimals

dynamodb = boto3.resource("dynamodb")
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])


def _scan_all(table, filter_expression, expression_values):
    """Paginated scan with a filter expression."""
    items = []
    scan_kwargs = {
        "FilterExpression": filter_expression,
        "ExpressionAttributeValues": expression_values,
    }
    while True:
        response = table.scan(**scan_kwargs)
        items.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        scan_kwargs["ExclusiveStartKey"] = last_key
    return items


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    quest_id = validate_uuid(args.get("questId", ""), "questId")

    # Get all progress records for this quest
    progress_items = _scan_all(
        progress_table,
        "questId = :qid",
        {":qid": quest_id},
    )

    total_plays = len(progress_items)
    completed = [p for p in progress_items if p.get("status") == "completed"]
    completed_count = len(completed)

    completion_rate = 0.0
    if total_plays > 0:
        completion_rate = round((completed_count / total_plays) * 100, 2)

    # Calculate average time from completed progress records
    durations = [int(p.get("totalDuration", 0)) for p in completed if p.get("totalDuration")]
    avg_time = round(sum(durations) / max(len(durations), 1)) if durations else 0

    # Get scores for this quest
    score_items = _scan_all(
        scores_table,
        "questId = :qid AND begins_with(id, :score_prefix)",
        {":qid": quest_id, ":score_prefix": "score#"},
    )

    scores = [int(s.get("score", 0)) for s in score_items if s.get("score") is not None]
    avg_score = round(sum(scores) / max(len(scores), 1), 2) if scores else 0.0

    # Get ratings for this quest
    rating_prefix = f"rating#{quest_id}#"
    rating_items = _scan_all(
        scores_table,
        "begins_with(id, :prefix)",
        {":prefix": rating_prefix},
    )

    ratings = []
    for item in rating_items:
        r = item.get("rating")
        if r is not None:
            ratings.append(int(r))

    total_ratings = len(ratings)
    avg_rating = round(sum(ratings) / max(total_ratings, 1), 2) if ratings else 0.0

    return convert_decimals({
        "questId": quest_id,
        "totalPlays": total_plays,
        "completionRate": completion_rate,
        "avgScore": avg_score,
        "avgTime": avg_time,
        "totalRatings": total_ratings,
        "avgRating": avg_rating,
    })
