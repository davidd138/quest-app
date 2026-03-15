import os
import json
import uuid
import boto3
from datetime import datetime, timezone
from auth_helpers import check_admin_access
from validation import validate_string, validate_enum, validate_positive_int, ValidationError

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

PRIMARY_MODEL_ID = "us.anthropic.claude-sonnet-4-20250514"
FALLBACK_MODEL_ID = "amazon.nova-pro-v1:0"

VALID_DIFFICULTIES = ["easy", "medium", "hard", "legendary"]


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_admin_access(event, user_id)

    args = event.get("arguments", {}).get("input", {})

    try:
        city = validate_string(args.get("city", ""), "city", max_length=200)
        theme = validate_string(args.get("theme", ""), "theme", max_length=500)
        difficulty = validate_enum(
            args.get("difficulty", ""), "difficulty", VALID_DIFFICULTIES
        )
        stage_count = validate_positive_int(
            args.get("stageCount", 0), "stageCount", max_value=20
        )
    except ValidationError as e:
        raise Exception(str(e))

    if stage_count < 1:
        raise Exception("stageCount must be at least 1")

    language = args.get("language", "en") or "en"
    if language not in ("en", "es"):
        language = "en"

    prompt = _build_generation_prompt(city, theme, difficulty, stage_count, language)

    generated_text = None
    for model_id in [PRIMARY_MODEL_ID, FALLBACK_MODEL_ID]:
        try:
            response = bedrock.converse(
                modelId=model_id,
                messages=[{"role": "user", "content": [{"text": prompt}]}],
                inferenceConfig={"maxTokens": 8192, "temperature": 0.7},
            )
            generated_text = response["output"]["message"]["content"][0]["text"]
            break
        except Exception as e:
            error_msg = str(e)
            if "ResourceNotFoundException" in error_msg or "AccessDeniedException" in error_msg:
                if model_id != FALLBACK_MODEL_ID:
                    print(f"Model {model_id} not accessible, falling back to {FALLBACK_MODEL_ID}")
                    continue
            raise

    if not generated_text:
        raise Exception("No model available for quest generation")

    # Strip markdown code fences if present
    if generated_text.startswith("```"):
        lines = generated_text.split("\n")
        lines = [l for l in lines if not l.startswith("```")]
        generated_text = "\n".join(lines)

    quest_data = json.loads(generated_text)

    now = datetime.now(timezone.utc).isoformat()

    # Build stages with generated IDs
    stages = []
    total_points = 0
    for i, stage_data in enumerate(quest_data.get("stages", [])):
        stage = {
            "id": str(uuid.uuid4()),
            "order": i + 1,
            "title": stage_data.get("title", f"Stage {i + 1}"),
            "description": stage_data.get("description", ""),
            "location": stage_data.get("location", {
                "latitude": 0.0,
                "longitude": 0.0,
                "name": city,
            }),
            "character": stage_data.get("character", {
                "name": "Guide",
                "role": "guide",
                "personality": "friendly",
                "backstory": "A local guide.",
                "voiceStyle": "friendly",
                "greetingMessage": "Welcome!",
            }),
            "challenge": stage_data.get("challenge", {
                "type": "conversation",
                "description": "Complete the conversation.",
                "successCriteria": "Engage meaningfully.",
                "failureHints": ["Try again."],
            }),
            "points": int(stage_data.get("points", 100)),
            "hints": stage_data.get("hints", []),
            "unlockCondition": stage_data.get("unlockCondition"),
        }
        total_points += stage["points"]
        stages.append(stage)

    # Build the Quest structure (not persisted - admin reviews first)
    quest = {
        "id": str(uuid.uuid4()),
        "title": quest_data.get("title", f"{theme} Quest in {city}"),
        "description": quest_data.get("description", ""),
        "category": quest_data.get("category", "adventure"),
        "difficulty": difficulty,
        "estimatedDuration": int(quest_data.get("estimatedDuration", stage_count * 15)),
        "coverImageUrl": None,
        "stages": stages,
        "totalPoints": total_points,
        "location": quest_data.get("location", {
            "latitude": 0.0,
            "longitude": 0.0,
            "name": city,
        }),
        "radius": float(quest_data.get("radius", 5.0)),
        "tags": quest_data.get("tags", [theme, city]),
        "isPublished": False,
        "createdBy": user_id,
        "createdAt": now,
        "updatedAt": now,
    }

    return quest


def _build_generation_prompt(city, theme, difficulty, stage_count, language):
    """Build the prompt for AI quest generation."""
    difficulty_guide = {
        "easy": "Simple challenges, clear instructions, short conversations. Suitable for beginners.",
        "medium": "Moderate complexity, some critical thinking required. Good for regular players.",
        "hard": "Complex puzzles, nuanced conversations, creative problem-solving required.",
        "legendary": "Expert-level challenges, multi-layered puzzles, exceptional creativity needed.",
    }

    lang_instruction = ""
    if language == "es":
        lang_instruction = "Generate ALL text content (title, descriptions, character dialogue, hints) in Spanish."
    else:
        lang_instruction = "Generate ALL text content (title, descriptions, character dialogue, hints) in English."

    prompt = f"""You are a creative quest designer for an interactive adventure game platform.

Generate a complete quest structure for the following parameters:
- City: {city}
- Theme: {theme}
- Difficulty: {difficulty} ({difficulty_guide.get(difficulty, '')})
- Number of stages: {stage_count}

{lang_instruction}

Create an immersive, engaging quest with a compelling narrative that connects all stages.
Each stage should have a unique character the player must interact with, a specific location in {city},
and a challenge appropriate for the {difficulty} difficulty level.

Respond ONLY with valid JSON in this exact format:
{{
  "title": "Quest title",
  "description": "A 2-3 sentence compelling quest description",
  "category": "adventure|mystery|cultural|educational|culinary|nature|urban|team_building",
  "estimatedDuration": <total minutes as integer>,
  "location": {{
    "latitude": <city center latitude>,
    "longitude": <city center longitude>,
    "name": "{city}"
  }},
  "radius": <quest area radius in km>,
  "tags": ["tag1", "tag2", "tag3"],
  "stages": [
    {{
      "title": "Stage title",
      "description": "What the player must do",
      "location": {{
        "latitude": <real latitude of a landmark/place in {city}>,
        "longitude": <real longitude>,
        "name": "Specific place name",
        "address": "Street address"
      }},
      "character": {{
        "name": "Character Name",
        "role": "Their role in the story",
        "personality": "2-3 personality traits",
        "backstory": "2-3 sentence backstory",
        "voiceStyle": "warm|mysterious|energetic|scholarly|playful|serious",
        "greetingMessage": "What they say when the player arrives"
      }},
      "challenge": {{
        "type": "conversation|riddle|knowledge|negotiation|persuasion|exploration|trivia",
        "description": "What the player must accomplish",
        "successCriteria": "Specific criteria for passing",
        "failureHints": ["Hint 1", "Hint 2"]
      }},
      "points": <points for completing, 50-200>,
      "hints": ["Navigation hint 1", "Navigation hint 2"]
    }}
  ]
}}

Rules:
- Use REAL locations and landmarks in {city} with accurate coordinates
- Each character should be unique with a distinct personality
- Challenges should be varied across stages (don't repeat the same type)
- The narrative should flow naturally from one stage to the next
- Points should scale with difficulty (easy: 50-100, medium: 75-150, hard: 100-175, legendary: 150-200)
- Include 2-3 hints per stage for navigation help
- Ensure the quest can be completed on foot within the estimated duration"""

    return prompt
