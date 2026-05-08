"""
db.py — Supabase database operations for the alevel_math_questions table.

Uses the service role key to bypass RLS.
"""
import json
import logging
from typing import Optional

from supabase import create_client, Client

from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

logger = logging.getLogger(__name__)

TABLE = "alevel_math_questions"

_client: Optional[Client] = None


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


# ── Read operations ────────────────────────────────────────────────────────────

def get_questions_missing_answers() -> list[dict]:
    """
    Fetch all rows where answer_img IS NULL.
    Returns list of row dicts.
    """
    client = _get_client()
    try:
        resp = (
            client.table(TABLE)
            .select("*")
            .is_("answer_img", "null")
            .execute()
        )
        rows = resp.data or []
        logger.info("Fetched %d records with answer_img IS NULL", len(rows))
        return rows
    except Exception as exc:
        logger.error("Failed to fetch records missing answers: %s", exc)
        return []


def get_questions_missing_explanations() -> list[dict]:
    """
    Fetch all rows where ai_explanation IS NULL.
    """
    client = _get_client()
    try:
        resp = (
            client.table(TABLE)
            .select("*")
            .is_("ai_explanation", "null")
            .execute()
        )
        rows = resp.data or []
        logger.info("Fetched %d records with ai_explanation IS NULL", len(rows))
        return rows
    except Exception as exc:
        logger.error("Failed to fetch records missing explanations: %s", exc)
        return []


def get_existing_question(
    paper_year: str,
    session: str,
    component: str,
    paper_code: str,
    question_number: str,
) -> Optional[dict]:
    """
    Look up a specific question record. Returns the row dict or None.
    """
    client = _get_client()
    try:
        resp = (
            client.table(TABLE)
            .select("*")
            .eq("paper_year", paper_year)
            .eq("session", session)
            .eq("component", component)
            .eq("paper_code", paper_code)
            .eq("question_number", question_number)
            .limit(1)
            .execute()
        )
        rows = resp.data or []
        return rows[0] if rows else None
    except Exception as exc:
        logger.error("Failed to look up question: %s", exc)
        return None


# ── Write operations ───────────────────────────────────────────────────────────

def upsert_question(data: dict) -> Optional[dict]:
    """
    Upsert a question record.

    Required keys in data:
        paper_year, session, component, paper_code, question_number

    Optional keys:
        topic, difficulty, question_img (JSON array string), answer_img (JSON array string),
        ai_explanation

    `question_img` and `answer_img` MUST be JSON array strings, e.g. '["https://..."]'.
    This function enforces that if you pass a list, it gets serialized.

    Returns the upserted row dict or None on error.
    """
    # Ensure img fields are JSON array strings
    for field in ("question_img", "answer_img"):
        if field in data and isinstance(data[field], list):
            data[field] = json.dumps(data[field])

    client = _get_client()
    try:
        resp = (
            client.table(TABLE)
            .upsert(
                data,
                on_conflict="paper_year,session,component,paper_code,question_number",
            )
            .execute()
        )
        rows = resp.data or []
        return rows[0] if rows else None
    except Exception as exc:
        logger.error("Upsert failed for question %s: %s", data.get("question_number"), exc)
        return None


def update_answer_img(question_id: int, answer_img_url: str) -> bool:
    """
    Update the answer_img field for a single row by id.

    answer_img_url can be either:
      - A single URL string (will be wrapped in JSON array)
      - Already a JSON array string (will be stored as-is)
    """
    # Ensure JSON array format
    try:
        # If it parses as JSON already, keep it
        parsed = json.loads(answer_img_url)
        if isinstance(parsed, list):
            img_value = answer_img_url
        else:
            img_value = json.dumps([answer_img_url])
    except (json.JSONDecodeError, TypeError):
        img_value = json.dumps([answer_img_url])

    client = _get_client()
    try:
        client.table(TABLE).update({"answer_img": img_value}).eq("id", question_id).execute()
        logger.info("Updated answer_img for id=%d", question_id)
        return True
    except Exception as exc:
        logger.error("Failed to update answer_img for id=%d: %s", question_id, exc)
        return False


def update_answer_img_multi(question_id: int, urls: list[str]) -> bool:
    """
    Update answer_img with multiple URLs (stored as JSON array string).
    """
    img_value = json.dumps(urls)
    client = _get_client()
    try:
        client.table(TABLE).update({"answer_img": img_value}).eq("id", question_id).execute()
        logger.info("Updated answer_img (%d URLs) for id=%d", len(urls), question_id)
        return True
    except Exception as exc:
        logger.error("Failed to update answer_img for id=%d: %s", question_id, exc)
        return False


def update_explanation(question_id: int, explanation: str) -> bool:
    """Update the ai_explanation field for a single row by id."""
    client = _get_client()
    try:
        client.table(TABLE).update({"ai_explanation": explanation}).eq("id", question_id).execute()
        logger.info("Updated ai_explanation for id=%d", question_id)
        return True
    except Exception as exc:
        logger.error("Failed to update ai_explanation for id=%d: %s", question_id, exc)
        return False
