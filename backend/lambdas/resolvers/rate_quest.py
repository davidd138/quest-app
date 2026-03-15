import os
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_user_access
from validation import validate_uuid, validate_positive_int, validate_string, convert_decimals, ValidationError

dynamodb = boto3.resource("dynamodb")
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    quest_id = validate_uuid(args.get("questId", ""), "questId")
    rating = args.get("rating", 0)
    review = args.get("review")

    # Validate rating (1-5)
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        raise ValidationError("rating must be an integer between 1 and 5")

    # Validate review if provided
    if review is not None:
        review = validate_string(review, "review", max_length=500)

    # Check quest exists
    quest_response = quests_table.get_item(Key={"id": quest_id})
    if not quest_response.get("Item"):
        raise ValueError("Quest not found")

    now = datetime.now(timezone.utc).isoformat()
    rating_id = f"rating#{quest_id}#{user_id}"

    item = {
        "id": rating_id,
        "questId": quest_id,
        "userId": user_id,
        "rating": rating,
        "createdAt": now,
    }

    if review:
        item["review"] = review

    # Put item (creates or overwrites existing rating from this user for this quest)
    scores_table.put_item(Item=item)

    return convert_decimals({
        "id": rating_id,
        "questId": quest_id,
        "userId": user_id,
        "rating": rating,
        "review": review,
        "createdAt": now,
    })
