import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from collections import defaultdict
from auth_helpers import check_admin_access
from validation import convert_decimals

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])


def _scan_all(table):
    """Paginated scan to retrieve all items from a table."""
    items = []
    scan_kwargs = {}
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
    check_admin_access(event, user_id)

    # Scan all tables
    all_users = _scan_all(users_table)
    all_quests = _scan_all(quests_table)
    all_progress = _scan_all(progress_table)
    all_scores = _scan_all(scores_table)

    total_users = len(all_users)
    active_users = sum(1 for u in all_users if u.get("status") == "active")
    total_quests = len(all_quests)
    total_completions = sum(
        1 for p in all_progress if p.get("status") == "completed"
    )

    # Build quest map for titles
    quest_map = {q["id"]: q for q in all_quests}

    # Popular quests: aggregate completions and scores per quest
    quest_stats = defaultdict(lambda: {"completions": 0, "scores": [], "durations": []})
    for p in all_progress:
        qid = p.get("questId", "")
        if p.get("status") == "completed":
            quest_stats[qid]["completions"] += 1
            quest_stats[qid]["durations"].append(int(p.get("totalDuration", 0)))

    for s in all_scores:
        qid = s.get("questId", "")
        quest_stats[qid]["scores"].append(int(s.get("score", 0)))

    popular_quests = []
    for qid, stats in quest_stats.items():
        quest = quest_map.get(qid, {})
        scores = stats["scores"]
        durations = stats["durations"]
        avg_score = round(sum(scores) / max(len(scores), 1), 1) if scores else 0.0
        avg_time = round(sum(durations) / max(len(durations), 1)) if durations else 0
        popular_quests.append({
            "questId": qid,
            "questTitle": quest.get("title", "Unknown"),
            "completions": stats["completions"],
            "averageScore": avg_score,
            "averageTime": avg_time,
        })

    popular_quests.sort(key=lambda x: x["completions"], reverse=True)

    # User growth: aggregate users by creation date (YYYY-MM-DD)
    growth_map = defaultdict(lambda: {"users": 0, "completions": 0})
    for u in all_users:
        created = u.get("createdAt", "")
        if created:
            date_key = created[:10]
            growth_map[date_key]["users"] += 1

    for p in all_progress:
        if p.get("status") == "completed":
            completed_at = p.get("completedAt", "")
            if completed_at:
                date_key = completed_at[:10]
                growth_map[date_key]["completions"] += 1

    user_growth = []
    for date_key in sorted(growth_map.keys()):
        user_growth.append({
            "date": date_key,
            "users": growth_map[date_key]["users"],
            "completions": growth_map[date_key]["completions"],
        })

    return convert_decimals({
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalQuests": total_quests,
        "totalCompletions": total_completions,
        "popularQuests": popular_quests,
        "userGrowth": user_growth,
    })
