import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from decimal import Decimal
from auth_helpers import check_user_access
from validation import validate_uuid, ValidationError

dynamodb = boto3.resource("dynamodb")
conversations_table = dynamodb.Table(os.environ["CONVERSATIONS_TABLE"])
quests_table = dynamodb.Table(os.environ["QUESTS_TABLE"])
scores_table = dynamodb.Table(os.environ["SCORES_TABLE"])
bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "us.anthropic.claude-sonnet-4-20250514")
FALLBACK_MODEL_ID = "amazon.nova-pro-v1:0"


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    try:
        conv_id = validate_uuid(
            event.get("arguments", {}).get("conversationId", ""), "conversationId"
        )
    except ValidationError as e:
        raise Exception(str(e))

    # Fetch conversation and check ownership
    conv = conversations_table.get_item(Key={"id": conv_id}).get("Item")
    if not conv or conv["userId"] != user_id:
        raise Exception("Not found or unauthorized")

    transcript = conv.get("transcript", "[]")
    if isinstance(transcript, str):
        transcript = json.loads(transcript)

    # Fetch quest to get stage/challenge details
    quest_id = conv.get("questId", "")
    stage_id = conv.get("stageId", "")
    quest = None
    stage = None
    challenge = None

    if quest_id:
        quest = quests_table.get_item(Key={"id": quest_id}).get("Item")

    if quest:
        stages = quest.get("stages", [])
        if isinstance(stages, str):
            stages = json.loads(stages)
        for s in stages:
            if s.get("id") == stage_id:
                stage = s
                break

    if stage:
        challenge = stage.get("challenge", {})
        if isinstance(challenge, str):
            challenge = json.loads(challenge)

    # Build analysis prompt
    prompt = _build_prompt(transcript, quest, stage, challenge, conv)

    # Try primary model, fallback if access denied
    analysis_text = None
    for model_id in [MODEL_ID, FALLBACK_MODEL_ID]:
        try:
            response = bedrock.converse(
                modelId=model_id,
                messages=[{"role": "user", "content": [{"text": prompt}]}],
                inferenceConfig={"maxTokens": 4096, "temperature": 0.15},
            )
            analysis_text = response["output"]["message"]["content"][0]["text"]
            break
        except Exception as e:
            error_msg = str(e)
            if "ResourceNotFoundException" in error_msg or "AccessDeniedException" in error_msg:
                if model_id != FALLBACK_MODEL_ID:
                    print(f"Model {model_id} not accessible, falling back to {FALLBACK_MODEL_ID}")
                    continue
            raise

    if not analysis_text:
        raise Exception("No model available for analysis")

    # Strip markdown code fences if present
    if analysis_text.startswith("```"):
        lines = analysis_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        analysis_text = "\n".join(lines)

    analysis = json.loads(analysis_text)

    now = datetime.now(timezone.utc).isoformat()

    challenge_result = {
        "passed": analysis.get("passed", False),
        "score": int(analysis.get("score", 0)),
        "feedback": analysis.get("feedback", ""),
        "strengths": analysis.get("strengths", []),
        "improvements": analysis.get("improvements", []),
    }

    # Save challenge result to conversation
    conversations_table.update_item(
        Key={"id": conv_id},
        UpdateExpression="SET challengeResult = :cr, #s = :st",
        ExpressionAttributeValues={
            ":cr": challenge_result,
            ":st": "analyzed",
        },
        ExpressionAttributeNames={"#s": "status"},
    )

    # Save score record
    score_item = {
        "id": str(uuid.uuid4()),
        "conversationId": conv_id,
        "userId": user_id,
        "questId": quest_id,
        "stageId": stage_id,
        "passed": challenge_result["passed"],
        "score": challenge_result["score"],
        "feedback": challenge_result["feedback"],
        "strengths": challenge_result["strengths"],
        "improvements": challenge_result["improvements"],
        "analyzedAt": now,
    }
    scores_table.put_item(Item=score_item)

    return challenge_result


def _build_prompt(transcript, quest, stage, challenge, conv):
    """Build an evaluation prompt for the challenge."""
    parts = []

    parts.append("You are an evaluator for an interactive quest game.")
    parts.append("Analyze the following conversation transcript and determine if the user successfully completed the challenge.")
    parts.append("")

    if quest:
        parts.append(f"Quest: {quest.get('title', 'Unknown')}")
        parts.append(f"Quest Description: {quest.get('description', '')}")
        parts.append("")

    if stage:
        parts.append(f"Stage: {stage.get('title', 'Unknown')}")
        parts.append(f"Stage Description: {stage.get('description', '')}")
        parts.append("")

    if challenge:
        parts.append(f"Challenge Type: {challenge.get('type', 'conversation')}")
        parts.append(f"Challenge Description: {challenge.get('description', '')}")
        parts.append(f"Success Criteria: {challenge.get('successCriteria', '')}")
        parts.append("")

    parts.append(f"Character: {conv.get('characterName', 'Unknown')}")
    parts.append("")

    parts.append("TRANSCRIPT:")
    if not transcript:
        parts.append("[Empty transcript - no conversation took place]")
    else:
        for i, msg in enumerate(transcript, 1):
            role = "USER" if msg.get("role") == "user" else "CHARACTER"
            parts.append(f"[{i}] {role}: {msg.get('text', '[no text]')}")

    parts.append("")
    parts.append("Based on the success criteria, evaluate the conversation.")
    parts.append("Respond ONLY with valid JSON in this exact format:")
    parts.append(json.dumps({
        "passed": True,
        "score": 75,
        "feedback": "Overall feedback about the user's performance...",
        "strengths": ["Strength 1", "Strength 2"],
        "improvements": ["Improvement 1", "Improvement 2"],
    }, indent=2))
    parts.append("")
    parts.append("Rules:")
    parts.append("- passed: true if the user met the success criteria, false otherwise")
    parts.append("- score: 0-100 rating of how well the user performed")
    parts.append("- feedback: 2-4 sentences summarizing the performance")
    parts.append("- strengths: 2-4 specific things the user did well")
    parts.append("- improvements: 2-4 specific actionable suggestions")

    return "\n".join(parts)
