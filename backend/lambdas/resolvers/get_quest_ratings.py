import os
import boto3
from decimal import Decimal
from auth_helpers import check_user_access
from validation import validate_uuid, convert_decimals

dynamodb = boto3.resource("dynamodb")
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    quest_id = validate_uuid(args.get("questId", ""), "questId")

    # Scan scores table for rating entries matching this quest
    # Rating items have id format: rating#{questId}#{userId}
    prefix = f"rating#{quest_id}#"

    ratings = []
    scan_kwargs = {
        "FilterExpression": "begins_with(id, :prefix)",
        "ExpressionAttributeValues": {":prefix": prefix},
    }

    while True:
        response = scores_table.scan(**scan_kwargs)
        for item in response.get("Items", []):
            r = item.get("rating")
            if r is not None:
                ratings.append(int(r))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        scan_kwargs["ExclusiveStartKey"] = last_key

    total = len(ratings)

    if total == 0:
        return convert_decimals({
            "averageRating": 0.0,
            "totalRatings": 0,
            "distribution": [0, 0, 0, 0, 0],
        })

    # Calculate distribution [1-star count, 2-star count, ..., 5-star count]
    distribution = [0, 0, 0, 0, 0]
    for r in ratings:
        if 1 <= r <= 5:
            distribution[r - 1] += 1

    average = sum(ratings) / total

    return convert_decimals({
        "averageRating": round(average, 2),
        "totalRatings": total,
        "distribution": distribution,
    })
