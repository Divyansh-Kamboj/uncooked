"""
explain.py — Generate AI step-by-step explanations using Gemini Vision.

Usage:
    from explain import generate_explanation
    text = generate_explanation(image_path)
"""
import logging
import time
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_SLEEP_SECONDS, gemini_call_with_backoff

logger = logging.getLogger(__name__)

_client: Optional[genai.Client] = None

_EXPLAIN_PROMPT = (
    "You are an expert A-Level Mathematics tutor. "
    "Provide a clear, step-by-step solution to this question. "
    "Show all working and explain each step. "
    "Use plain text only (no LaTeX or markdown formatting)."
)


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


def generate_explanation(
    image_path: Path,
    sleep_after: bool = True,
) -> Optional[str]:
    """
    Generate a step-by-step explanation for a question image.

    Args:
        image_path:   Path to the PNG image of the question page.
        sleep_after:  Whether to sleep for rate limiting after the call.

    Returns:
        Explanation text string, or None on error.
    """
    client = _get_client()

    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        response = gemini_call_with_backoff(client.models.generate_content,
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                _EXPLAIN_PROMPT,
            ],
        )

        explanation = response.text.strip()
        return explanation if explanation else None

    except Exception as exc:
        logger.error("Gemini explain error for %s: %s", image_path.name, exc)
        return None
    finally:
        if sleep_after:
            time.sleep(GEMINI_SLEEP_SECONDS)
