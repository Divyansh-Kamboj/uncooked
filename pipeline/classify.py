"""
classify.py — Use Gemini Vision to classify question images.

For each question image:
  - Identify the question number visible in the image
  - Classify the topic from the whitelist
  - Estimate difficulty: Easy / Medium / Hard

Usage:
    from classify import classify_question
    result = classify_question(image_path)
    # { "question_number": "5", "topic": "Integration", "difficulty": "Medium" }
"""
import json
import logging
import re
import time
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_SLEEP_SECONDS, TOPIC_WHITELIST, gemini_call_with_backoff

logger = logging.getLogger(__name__)

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


_TOPIC_LIST_STR = "\n".join(f"- {t}" for t in TOPIC_WHITELIST)

_CLASSIFY_PROMPT = f"""You are an expert CAIE A-Level Mathematics examiner.

Look at the question paper image provided and extract the following information:

1. **question_number**: The question number shown in the image (e.g., "1", "5", "10").
   - This is usually a bold number at the start of the question.
   - If the page is a cover page or instructions page with no question, return "0".

2. **topic**: The primary mathematical topic being tested. Choose EXACTLY one from this list:
{_TOPIC_LIST_STR}

3. **difficulty**: How difficult is this question?
   - "Easy": straightforward, 1-4 marks, routine application
   - "Medium": requires some problem-solving, 5-8 marks, moderate complexity
   - "Hard": multi-step, 9+ marks, or requires deep insight

Respond with ONLY valid JSON (no markdown, no extra text):
{{"question_number": "5", "topic": "Integration", "difficulty": "Medium"}}
"""


def classify_question(
    image_path: Path,
    sleep_after: bool = True,
) -> Optional[dict]:
    """
    Classify a question image using Gemini Vision.

    Args:
        image_path:   Path to the PNG image of the question page.
        sleep_after:  Whether to sleep GEMINI_SLEEP_SECONDS after the call
                      (for rate limiting).

    Returns:
        dict with keys: question_number (str), topic (str), difficulty (str)
        Returns None on error.
    """
    client = _get_client()

    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        response = gemini_call_with_backoff(client.models.generate_content,
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                _CLASSIFY_PROMPT,
            ],
        )

        raw = response.text.strip()

        # Strip markdown code fences if present
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)

        # Validate topic
        topic = data.get("topic", "").strip()
        if topic not in TOPIC_WHITELIST:
            # Try to find closest match (case-insensitive)
            lower_map = {t.lower(): t for t in TOPIC_WHITELIST}
            topic = lower_map.get(topic.lower(), TOPIC_WHITELIST[0])
            data["topic"] = topic

        # Validate difficulty
        difficulty = data.get("difficulty", "Medium")
        if difficulty not in ("Easy", "Medium", "Hard"):
            difficulty = "Medium"
        data["difficulty"] = difficulty

        # Ensure question_number is a string
        data["question_number"] = str(data.get("question_number", "0")).strip()

        return data

    except json.JSONDecodeError as exc:
        logger.error("JSON parse error classifying %s: %s | raw=%r", image_path.name, exc, raw)
        return None
    except Exception as exc:
        logger.error("Gemini classify error for %s: %s", image_path.name, exc)
        return None
    finally:
        if sleep_after:
            time.sleep(GEMINI_SLEEP_SECONDS)
