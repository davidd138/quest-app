import pytest
import os

os.environ.setdefault("USERS_TABLE", "test-qm-users")
os.environ.setdefault("QUESTS_TABLE", "test-qm-quests")
os.environ.setdefault("PROGRESS_TABLE", "test-qm-progress")
os.environ.setdefault("CONVERSATIONS_TABLE", "test-qm-conversations")
os.environ.setdefault("SCORES_TABLE", "test-qm-scores")
os.environ.setdefault("ACHIEVEMENTS_TABLE", "test-qm-achievements")
os.environ.setdefault("ENV_NAME", "test")
os.environ.setdefault("USER_POOL_ID", "test-pool-id")
os.environ.setdefault("OPENAI_SECRET_NAME", "test/openai-api-key")
os.environ.setdefault("BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")

def pytest_collection_modifyitems(config, items):
    for item in items:
        if "e2e" in item.keywords:
            item.add_marker(pytest.mark.skip(reason="E2E tests skipped by default"))
