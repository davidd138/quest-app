import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from collections import defaultdict
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])
users_table = dynamodb.Table(os.environ["USERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    limit = args.get("limit", 20)

    # Scan all scores
    all_scores = []
    scan_kwargs = {}
    while True:
        response = scores_table.scan(**scan_kwargs)
        all_scores.extend(response.get("Items", []))
        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        scan_kwargs["ExclusiveStartKey"] = last_key

    # Aggregate by userId
    user_agg = defaultdict(lambda: {"totalPoints": 0, "questIds": set()})
    for s in all_scores:
        uid = s.get("userId", "")
        if uid:
            user_agg[uid]["totalPoints"] += int(s.get("score", 0))
            quest_id = s.get("questId", "")
            if quest_id:
                user_agg[uid]["questIds"].add(quest_id)

    # Fetch user names and build entries
    entries = []
    for uid, data in user_agg.items():
        user = users_table.get_item(Key={"userId": uid}).get("Item")
        entries.append({
            "userId": uid,
            "userName": user.get("name", user.get("email", "Unknown")) if user else "Unknown",
            "avatarUrl": user.get("avatarUrl") if user else None,
            "totalPoints": data["totalPoints"],
            "questsCompleted": len(data["questIds"]),
            "averageScore": round(data["totalPoints"] / max(len(data["questIds"]), 1), 1),
        })

    # Sort by totalPoints descending
    entries.sort(key=lambda x: x["totalPoints"], reverse=True)

    # Add rank and trim to limit
    result = []
    for i, entry in enumerate(entries[:limit], 1):
        entry["rank"] = i
        result.append(entry)

    return result
