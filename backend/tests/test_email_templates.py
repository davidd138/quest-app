"""Tests for email_templates.py template builder."""
import sys
import os
import re
import pytest

# Add resolvers directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lambdas", "resolvers"))

from email_templates import (
    welcome_email,
    quest_completed,
    achievement_unlocked,
    weekly_summary,
    account_deletion_confirmation,
    quest_approved,
    quest_rejected,
)


# ── Helpers ───────────────────────────────────────────────────────────

HTML_TAG_RE = re.compile(r"<[^>]+>")


def _assert_template_structure(result: dict) -> None:
    """Validate the common structure every template must have."""
    assert "subject" in result
    assert "html_body" in result
    assert "text_body" in result

    assert isinstance(result["subject"], str)
    assert isinstance(result["html_body"], str)
    assert isinstance(result["text_body"], str)

    # Subject is non-empty
    assert len(result["subject"].strip()) > 0

    # HTML body contains QuestMaster branding
    assert "QuestMaster" in result["html_body"]

    # Text body is plain text — no HTML tags
    assert not HTML_TAG_RE.search(result["text_body"])

    # Unsubscribe link placeholder present in both bodies
    assert "unsubscribe_url" in result["html_body"]
    assert "unsubscribe_url" in result["text_body"]


# ── welcome_email ─────────────────────────────────────────────────────

class TestWelcomeEmail:
    def test_structure(self):
        result = welcome_email("Carlos")
        _assert_template_structure(result)

    def test_user_name_in_subject_or_body(self):
        result = welcome_email("Carlos")
        assert "Carlos" in result["html_body"]
        assert "Carlos" in result["text_body"]

    def test_subject_contains_bienvenido(self):
        result = welcome_email("Ana")
        assert "Bienvenido" in result["subject"]

    def test_html_contains_branding_header(self):
        result = welcome_email("Test")
        assert "QuestMaster" in result["html_body"]
        assert "Aventuras Interactivas" in result["html_body"]


# ── quest_completed ───────────────────────────────────────────────────

class TestQuestCompleted:
    def test_structure(self):
        result = quest_completed("Maria", "El Templo Perdido", 750, 1000)
        _assert_template_structure(result)

    def test_variables_replaced(self):
        result = quest_completed("Maria", "El Templo Perdido", 750, 1000)
        assert "Maria" in result["html_body"]
        assert "El Templo Perdido" in result["html_body"]
        assert "750" in result["html_body"]
        assert "Maria" in result["text_body"]
        assert "El Templo Perdido" in result["text_body"]

    def test_subject_contains_quest_title(self):
        result = quest_completed("User", "Dragon Quest", 100, 200)
        assert "Dragon Quest" in result["subject"]

    def test_percentage_calculation(self):
        result = quest_completed("User", "Q", 500, 1000)
        assert "50%" in result["html_body"] or "50" in result["html_body"]

    def test_zero_total_points(self):
        # Should not raise ZeroDivisionError
        result = quest_completed("User", "Q", 0, 0)
        _assert_template_structure(result)


# ── achievement_unlocked ──────────────────────────────────────────────

class TestAchievementUnlocked:
    def test_structure(self):
        result = achievement_unlocked("Pedro", "Explorador", "Visita 10 ubicaciones")
        _assert_template_structure(result)

    def test_variables_replaced(self):
        result = achievement_unlocked("Pedro", "Explorador", "Visita 10 ubicaciones")
        assert "Pedro" in result["html_body"]
        assert "Explorador" in result["html_body"]
        assert "Visita 10 ubicaciones" in result["html_body"]
        assert "Pedro" in result["text_body"]
        assert "Explorador" in result["text_body"]

    def test_subject_contains_achievement(self):
        result = achievement_unlocked("U", "Veterano", "desc")
        assert "Veterano" in result["subject"]


# ── weekly_summary ────────────────────────────────────────────────────

class TestWeeklySummary:
    def test_structure(self):
        result = weekly_summary("Laura", 5, 2300, 12, 7)
        _assert_template_structure(result)

    def test_variables_replaced(self):
        result = weekly_summary("Laura", 5, 2300, 12, 7)
        assert "Laura" in result["html_body"]
        assert "5" in result["html_body"]
        assert "2300" in result["html_body"]
        assert "12" in result["html_body"]
        assert "Laura" in result["text_body"]

    def test_subject_contains_stats(self):
        result = weekly_summary("U", 3, 100, 1, 2)
        assert "3" in result["subject"]
        assert "100" in result["subject"]


# ── account_deletion_confirmation ─────────────────────────────────────

class TestAccountDeletionConfirmation:
    def test_structure(self):
        result = account_deletion_confirmation("Roberto")
        _assert_template_structure(result)

    def test_user_name_present(self):
        result = account_deletion_confirmation("Roberto")
        assert "Roberto" in result["html_body"]
        assert "Roberto" in result["text_body"]

    def test_mentions_30_days(self):
        result = account_deletion_confirmation("User")
        assert "30" in result["html_body"]
        assert "30" in result["text_body"]


# ── quest_approved ────────────────────────────────────────────────────

class TestQuestApproved:
    def test_structure(self):
        result = quest_approved("Elena", "Aventura en la Ciudad")
        _assert_template_structure(result)

    def test_variables_replaced(self):
        result = quest_approved("Elena", "Aventura en la Ciudad")
        assert "Elena" in result["html_body"]
        assert "Aventura en la Ciudad" in result["html_body"]
        assert "Elena" in result["text_body"]
        assert "Aventura en la Ciudad" in result["text_body"]

    def test_subject_contains_quest_title(self):
        result = quest_approved("U", "Mi Quest")
        assert "Mi Quest" in result["subject"]


# ── quest_rejected ────────────────────────────────────────────────────

class TestQuestRejected:
    def test_structure(self):
        result = quest_rejected("Juan", "Quest Rota", "Falta descripcion en la etapa 3")
        _assert_template_structure(result)

    def test_variables_replaced(self):
        result = quest_rejected("Juan", "Quest Rota", "Falta descripcion")
        assert "Juan" in result["html_body"]
        assert "Quest Rota" in result["html_body"]
        assert "Falta descripcion" in result["html_body"]
        assert "Juan" in result["text_body"]
        assert "Quest Rota" in result["text_body"]
        assert "Falta descripcion" in result["text_body"]

    def test_subject_contains_quest_title(self):
        result = quest_rejected("U", "La Quest", "reason")
        assert "La Quest" in result["subject"]
