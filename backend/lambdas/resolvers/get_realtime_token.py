import os
import json
import uuid
import time
import boto3
from datetime import datetime, timezone
from urllib import request
from auth_helpers import check_user_access
from validation import validate_uuid, ValidationError

secrets_client = boto3.client("secretsmanager")
quests_table = boto3.resource("dynamodb").Table(os.environ["QUESTS_TABLE"])

_cached_key = None
_cached_at = 0
CACHE_TTL = 300


def get_api_key():
    global _cached_key, _cached_at
    now = time.time()
    if _cached_key and (now - _cached_at) < CACHE_TTL:
        return _cached_key
    resp = secrets_client.get_secret_value(SecretId=os.environ["OPENAI_SECRET_NAME"])
    _cached_key = resp["SecretString"]
    _cached_at = now
    return _cached_key


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})

    try:
        quest_id = validate_uuid(args.get("questId", ""), "questId")
        stage_id = validate_uuid(args.get("stageId", ""), "stageId")
    except ValidationError as e:
        raise Exception(str(e))

    # Fetch quest and find the stage character info
    quest = quests_table.get_item(Key={"id": quest_id}).get("Item")
    if not quest:
        raise Exception("Quest not found")

    stages = quest.get("stages", [])
    if isinstance(stages, str):
        stages = json.loads(stages)

    stage = None
    for s in stages:
        if s.get("id") == stage_id:
            stage = s
            break

    if not stage:
        raise Exception("Stage not found in quest")

    character = stage.get("character", {})
    if isinstance(character, str):
        character = json.loads(character)

    challenge = stage.get("challenge", {})
    if isinstance(challenge, str):
        challenge = json.loads(challenge)

    # Build voice and instructions from character
    voice_style = character.get("voiceStyle", "alloy")
    voice_map = {
        "friendly": "alloy",
        "authoritative": "echo",
        "mysterious": "fable",
        "warm": "shimmer",
        "gruff": "onyx",
        "cheerful": "nova",
    }
    voice = voice_map.get(voice_style.lower(), voice_style.lower())

    instructions = (
        f"You are {character.get('name', 'a character')}. "
        f"Role: {character.get('role', 'NPC')}. "
        f"Personality: {character.get('personality', '')}. "
        f"Backstory: {character.get('backstory', '')}. "
        f"Challenge: {challenge.get('description', '')}. "
        f"Stay in character at all times. "
        f"Greet the user with: {character.get('greetingMessage', 'Hello!')}"
    )

    api_key = get_api_key()

    body = json.dumps({
        "model": "gpt-4o-realtime-preview-2024-12-17",
        "voice": voice,
        "modalities": ["audio", "text"],
        "instructions": instructions,
    }).encode()

    req = request.Request(
        "https://api.openai.com/v1/realtime/sessions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with request.urlopen(req) as resp:
        data = json.loads(resp.read())

    return {
        "token": data["client_secret"]["value"],
        "expiresAt": data["client_secret"]["expires_at"],
    }
