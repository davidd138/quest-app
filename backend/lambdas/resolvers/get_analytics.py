import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from collections import defaultdict
from boto3.dynamodb.conditions import Key
from auth_helpers import check_user_access
from validation import convert_decimals

dynamodb = boto3.resource("dynamodb")
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])
conversations_table = dynamodb.Table(os.environ["CONVERSATIONS_TABLE"])
progress_table = dynamodb.Table(os.environ["PROGRESS_TABLE"])
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
achievements_table = dynamodb.Table(os.environ["ACHIEVEMENTS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    # Query user's scores
    user_scores = scores_table.query(
        IndexName="userId-analyzedAt-index",
        KeyConditionExpression=Key("userId").eq(user_id),
    ).get("Items", [])

    # Query user's conversations
    user_conversations = conversations_table.query(
        IndexName="userId-startedAt-index",
        KeyConditionExpression=Key("userId").eq(user_id),
    ).get("Items", [])

    # Query user's progress
    user_progress = progress_table.query(
        IndexName="userId-startedAt-index",
        KeyConditionExpression=Key("userId").eq(user_id),
    ).get("Items", [])

    # Fetch all quests for category info
    all_quests = quests_table.scan(
        ProjectionExpression="id, title, category"
    ).get("Items", [])
    quest_map = {q["id"]: q for q in all_quests}

    # Calculate metrics
    total_quests = len(user_progress)
    quests_completed = sum(1 for p in user_progress if p.get("status") == "completed")
    total_points = sum(int(s.get("score", 0)) for s in user_scores)
    average_score = round(total_points / max(len(user_scores), 1), 1)
    total_play_time = sum(int(c.get("duration", 0)) for c in user_conversations)
    completion_rate = round(quests_completed / max(total_quests, 1) * 100, 1)

    # Favorite category
    category_counts = defaultdict(int)
    for p in user_progress:
        quest = quest_map.get(p.get("questId", ""), {})
        cat = quest.get("category", "unknown")
        category_counts[cat] += 1

    favorite_category = None
    if category_counts:
        favorite_category = max(category_counts, key=category_counts.get)

    # Recent activity (last 10 conversations)
    sorted_convs = sorted(
        user_conversations, key=lambda c: c.get("startedAt", ""), reverse=True
    )
    recent_activity = []
    for conv in sorted_convs[:10]:
        quest = quest_map.get(conv.get("questId", ""), {})
        status = conv.get("status", "in_progress")
        action = "completed" if status == "completed" else "started"
        recent_activity.append({
            "date": conv.get("startedAt", ""),
            "questTitle": quest.get("title", "Unknown Quest"),
            "action": action,
            "points": int(conv.get("duration", 0)),
        })

    # Category breakdown
    category_stats = defaultdict(lambda: {"completed": 0, "total": 0, "scores": []})
    for p in user_progress:
        quest = quest_map.get(p.get("questId", ""), {})
        cat = quest.get("category", "unknown")
        category_stats[cat]["total"] += 1
        if p.get("status") == "completed":
            category_stats[cat]["completed"] += 1

    for s in user_scores:
        quest = quest_map.get(s.get("questId", ""), {})
        cat = quest.get("category", "unknown")
        category_stats[cat]["scores"].append(int(s.get("score", 0)))

    category_breakdown = []
    for cat, stats in category_stats.items():
        scores = stats["scores"]
        avg_score = round(sum(scores) / max(len(scores), 1), 1) if scores else 0.0
        category_breakdown.append({
            "category": cat,
            "completed": stats["completed"],
            "total": stats["total"],
            "averageScore": avg_score,
        })

    return convert_decimals({
        "totalQuests": total_quests,
        "questsCompleted": quests_completed,
        "totalPoints": total_points,
        "averageScore": average_score,
        "totalPlayTime": total_play_time,
        "favoriteCategory": favorite_category,
        "completionRate": completion_rate,
        "recentActivity": recent_activity,
        "categoryBreakdown": category_breakdown,
    })
