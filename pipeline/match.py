"""
match.py — Match question images to mark scheme pages.

Primary strategy (zero API calls):
  1. build_ms_index_from_pdf(): extract text from each MS PDF page using
     pypdfium2, regex-match question numbers → {qnum: [page_paths]} dict.
  2. match_from_index(): O(1) lookup per question from the pre-built index.

Gemini Vision fallback (only if PDF has no text layer):
  3. build_ms_index(): Gemini Vision scan of PNG images — use sparingly.
"""
import json
import logging
import re
import time
from pathlib import Path
from typing import Optional

import pypdfium2 as pdfium
from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_SLEEP_SECONDS, gemini_call_with_backoff

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

        response = gemini_call_with_backoff(
            client.models.generate_content,
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


def _extract_qnums_from_text(text: str) -> list[str]:
    """
    Extract question numbers from a CAIE mark scheme PDF page.

    CAIE MSs have a "Question Answer Marks" column header before each
    question section. We split on that header and read only the first
    non-empty line of each section, which is the question number (e.g.
    "1", "2(a)", "3(b)(i)"). This avoids false positives from mathematical
    content embedded in the answer text.
    """
    found: set[str] = set()
    # Match "Question Answer Marks" with optional trailing words (e.g. "Guidance")
    sections = re.split(r"Question\s+Answer\s+Marks[^\n]*", text, flags=re.IGNORECASE)
    for section in sections[1:]:  # sections[0] is pre-header boilerplate
        for line in section.split("\n"):
            stripped = line.strip()
            if not stripped:
                continue
            m = re.match(
                r"^(\d{1,2})(?:\s*\([a-z]\)(?:\s*\([ivx]+\))*)?(?:\s|$)", stripped
            )
            if m:
                n = int(m.group(1))
                if 1 <= n <= 20:
                    found.add(str(n))
            break  # only the first non-empty line per section
    return sorted(found, key=int)


def build_ms_index_from_pdf(
    ms_pdf_path: Path,
    ms_page_images: list[tuple[int, Path]],
) -> dict[str, list[Path]]:
    """
    Build the MS question→pages index from the PDF text layer. Zero API calls.

    Uses pypdfium2 to extract the text from each page, then regexes for
    CAIE-style question numbers. Works for all native-digital CAIE PDFs.
    Returns an empty dict if the PDF has no text layer (scanned documents).

    Args:
        ms_pdf_path:    Path to the mark scheme PDF.
        ms_page_images: List of (page_num_1indexed, png_path) from split_ms().

    Returns:
        {normalized_question_number: [page_image_paths]}
    """
    index: dict[str, list[Path]] = {}
    page_image_map = {pn: ip for pn, ip in ms_page_images}

    try:
        doc = pdfium.PdfDocument(str(ms_pdf_path))
    except Exception as exc:
        logger.warning("Cannot open PDF for text extraction: %s", exc)
        return index

    try:
        for i in range(len(doc)):
            page_num = i + 1
            img_path = page_image_map.get(page_num)
            if img_path is None:
                continue
            try:
                textpage = doc[i].get_textpage()
                text = textpage.get_text_range()
                nums = _extract_qnums_from_text(text)
                logger.debug("PDF page %d → questions: %s", page_num, nums)
                for n in nums:
                    index.setdefault(n, []).append(img_path)
            except Exception as exc:
                logger.debug("Text extraction page %d: %s", page_num, exc)
    finally:
        doc.close()

    logger.info("Text-based MS index: %d question entries", len(index))
    return index


def build_ms_index(ms_page_images: list[tuple[int, Path]]) -> dict[str, list[Path]]:
    """
    Scan ALL mark scheme pages ONCE and return a lookup dict.

    Call this once per paper, then use match_from_index() for each question.
    This costs M Gemini calls (one per MS page) rather than N*M (one per
    question × page).

    Returns:
        {normalized_question_number: [page_paths]}
    """
    index: dict[str, list[Path]] = {}
    logger.info("Building MS index for %d pages...", len(ms_page_images))
    for page_num, page_path in ms_page_images:
        nums = _extract_ms_question_numbers(page_path, sleep_after=True)
        logger.debug("MS page %d → questions: %s", page_num, nums)
        for n in nums:
            norm = _normalize_qnum(n)
            index.setdefault(norm, []).append(page_path)
    logger.info("MS index built: %d question entries", len(index))
    return index


def match_from_index(question_number: str, ms_index: dict[str, list[Path]]) -> list[Path]:
    """
    O(1) lookup from a pre-built MS index (see build_ms_index).
    Returns matching page paths, or [] if not found.
    """
    return ms_index.get(_normalize_qnum(question_number), [])


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
