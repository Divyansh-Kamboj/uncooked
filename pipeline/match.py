"""
match.py — Match question images to mark scheme pages using Gemini Vision.

Strategy:
  1. Extract question number from each MS page via Gemini (primary).
  2. Return pages whose extracted question number matches the target question number.
  3. Fallback: if no numeric match found, use Gemini to visually identify the best match.

Usage:
    from match import match_question_to_ms
    ms_pages = match_question_to_ms(
        question_image_path=Path("..."),
        question_number="5",
        ms_page_images=[(1, Path("...page_001.png")), ...],
    )
    # returns list of Paths that correspond to this question's mark scheme
"""
import json
import logging
import re
import time
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_SLEEP_SECONDS

logger = logging.getLogger(__name__)

_client: Optional[genai.Client] = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


_MS_EXTRACT_PROMPT = """You are reading a CAIE A-Level Mathematics mark scheme page.

Extract the question number(s) that are answered on this page.
Mark schemes label questions like "1", "2(a)", "3(b)(ii)", etc.

Respond with ONLY valid JSON:
{"question_numbers": ["5", "5a", "5b"]}

If this is a cover page, instructions page, or contains no question answers, respond:
{"question_numbers": []}
"""


def _extract_ms_question_numbers(page_image: Path, sleep_after: bool = True) -> list[str]:
    """
    Ask Gemini which question number(s) a mark scheme page covers.
    Returns a list of question number strings (may be empty).
    """
    client = _get_client()
    raw = ""
    try:
        with open(page_image, "rb") as f:
            image_bytes = f.read()

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                _MS_EXTRACT_PROMPT,
            ],
        )

        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        nums = [str(n).strip() for n in data.get("question_numbers", [])]
        return nums

    except json.JSONDecodeError as exc:
        logger.debug("JSON parse error extracting MS question numbers: %s | raw=%r", exc, raw)
        return []
    except Exception as exc:
        logger.debug("Gemini MS extract error for %s: %s", page_image.name, exc)
        return []
    finally:
        if sleep_after:
            time.sleep(GEMINI_SLEEP_SECONDS)


def _normalize_qnum(q: str) -> str:
    """Normalize a question number for comparison: strip, lower, take leading digits."""
    q = q.strip().lower()
    m = re.match(r"(\d+)", q)
    return m.group(1) if m else q


def match_question_to_ms(
    question_number: str,
    ms_page_images: list[tuple[int, Path]],
    question_image_path: Optional[Path] = None,
    use_vision_fallback: bool = True,
) -> list[Path]:
    """
    Identify which mark scheme page(s) correspond to a given question number.

    Args:
        question_number:     The question number string (e.g. "5").
        ms_page_images:      List of (page_num, image_path) from split_ms().
        question_image_path: The question image (used for vision fallback only).
        use_vision_fallback: Whether to try vision-based matching if numeric
                             matching yields nothing.

    Returns:
        List of image Paths for the matching MS pages (may be 1–3 pages).
    """
    if not ms_page_images:
        return []

    target_norm = _normalize_qnum(question_number)
    matched: list[Path] = []

    # Build a cache of {page_path: [question_numbers]} to avoid re-calling Gemini
    # for pages we already extracted numbers for.
    page_qnums: dict[Path, list[str]] = {}

    logger.info("Matching MS pages for question %s (%d pages to scan)", question_number, len(ms_page_images))

    for page_num, page_path in ms_page_images:
        nums = _extract_ms_question_numbers(page_path, sleep_after=True)
        page_qnums[page_path] = nums
        logger.debug("MS page %d covers questions: %s", page_num, nums)

        norm_nums = [_normalize_qnum(n) for n in nums]
        if target_norm in norm_nums:
            matched.append(page_path)

    if matched:
        logger.info("Found %d MS page(s) for question %s via numeric matching", len(matched), question_number)
        return matched

    # ── Fallback: vision-based matching ───────────────────────────────────────
    if use_vision_fallback and question_image_path is not None and question_image_path.exists():
        logger.info("Numeric match failed; trying vision fallback for question %s", question_number)
        matched = _vision_fallback_match(question_image_path, ms_page_images)

    return matched


_VISION_FALLBACK_PROMPT = """You are matching a CAIE A-Level Mathematics question to its mark scheme.

The first image is a QUESTION from the exam paper.
The subsequent images are pages from the MARK SCHEME for the same paper.

Which mark scheme page numbers (1-indexed from the mark scheme images provided)
contain the answers/mark scheme for the question shown?

Respond with ONLY valid JSON:
{"matching_pages": [2, 3]}

If none match, respond: {"matching_pages": []}
"""


def _vision_fallback_match(
    question_image_path: Path,
    ms_page_images: list[tuple[int, Path]],
) -> list[Path]:
    """Use Gemini Vision to visually match question to MS pages."""
    client = _get_client()

    try:
        parts = []
        with open(question_image_path, "rb") as f:
            parts.append(types.Part.from_bytes(data=f.read(), mime_type="image/png"))

        page_paths = [p for _, p in ms_page_images]
        for pg_path in page_paths:
            with open(pg_path, "rb") as f:
                parts.append(types.Part.from_bytes(data=f.read(), mime_type="image/png"))

        parts.append(_VISION_FALLBACK_PROMPT)

        response = client.models.generate_content(model=GEMINI_MODEL, contents=parts)
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        indices = data.get("matching_pages", [])
        # indices are 1-based relative to ms_page_images
        matched = []
        for idx in indices:
            if 1 <= idx <= len(page_paths):
                matched.append(page_paths[idx - 1])
        return matched

    except Exception as exc:
        logger.error("Vision fallback error: %s", exc)
        return []
    finally:
        time.sleep(GEMINI_SLEEP_SECONDS)
