"""
upload.py — Upload question/answer images to Supabase Storage.

Storage path format:
    {Component}_{SessionFirst}/{SessionSecond}_{Year}_{PaperCode}_{QuestionNum}.png

Examples:
    Stats 1_May/June_2020_2_5.png  (in alevel-math-question-images)
    Mechanics_Oct/Nov_2024_1_2.png

The SessionFirst and SessionSecond split on '/':
    "May/June"  → SessionFirst="May",   SessionSecond="June"
    "Oct/Nov"   → SessionFirst="Oct",   SessionSecond="Nov"
    "Feb/March" → SessionFirst="Feb",   SessionSecond="March"
"""
import logging
from pathlib import Path
from typing import Optional

from supabase import create_client, Client

from config import (
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    QUESTION_BUCKET,
    ANSWER_BUCKET,
    SESSION_STORAGE_MAP,
)

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def _get_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client


def _build_storage_path(
    component: str,
    session: str,
    year: str,
    paper_code: str,
    question_num: str,
) -> str:
    """
    Build the storage path from metadata.

    Returns e.g. "Stats 1_May/June_2020_2_5.png"
    Wait — looking at the spec more carefully:

    The path format is:
      {Component}_{SessionFirst}/{SessionSecond}_{Year}_{PaperCode}_{QuestionNum}.png

    Splitting "May/June" → folder part="May", file prefix="June"
    So:  Stats 1_May/June_2020_2_5.png
         ^folder^/^------- filename --------^

    That means: folder = "Stats 1_May", filename = "June_2020_2_5.png"
    Combined path = "Stats 1_May/June_2020_2_5.png"
    """
    session_first, session_second = session.split("/")
    folder = f"{component}_{session_first}"
    filename = f"{session_second}_{year}_{paper_code}_{question_num}.png"
    return f"{folder}/{filename}"


def _upload_image(
    bucket: str,
    storage_path: str,
    image_path: Path,
) -> Optional[str]:
    """
    Upload image_path to the given bucket at storage_path.
    Returns the public URL on success, None on failure.
    Skips upload if the file already exists (returns existing URL).
    """
    client = _get_client()

    # Check if it already exists by attempting to get URL
    try:
        existing = client.storage.from_(bucket).get_public_url(storage_path)
        # Verify the file actually exists via a HEAD request
        import httpx
        r = httpx.head(existing, timeout=10, follow_redirects=True)
        if r.status_code == 200:
            logger.info("Already exists in storage, skipping: %s", storage_path)
            return existing
    except Exception:
        pass  # Will attempt upload below

    try:
        with open(image_path, "rb") as f:
            data = f.read()

        client.storage.from_(bucket).upload(
            path=storage_path,
            file=data,
            file_options={"content-type": "image/png", "upsert": "true"},
        )

        public_url = client.storage.from_(bucket).get_public_url(storage_path)
        logger.info("Uploaded → %s", storage_path)
        return public_url

    except Exception as exc:
        logger.error("Upload failed for %s/%s: %s", bucket, storage_path, exc)
        return None


def upload_question_image(
    image_path: Path,
    component: str,
    session: str,
    year: str,
    paper_code: str,
    question_num: str,
) -> Optional[str]:
    """
    Upload a question image to alevel-math-question-images bucket.
    Returns public URL or None on failure.
    """
    storage_path = _build_storage_path(component, session, year, paper_code, question_num)
    return _upload_image(QUESTION_BUCKET, storage_path, image_path)


def upload_answer_image(
    image_path: Path,
    component: str,
    session: str,
    year: str,
    paper_code: str,
    question_num: str,
) -> Optional[str]:
    """
    Upload an answer/mark-scheme image to alevel-math-answer-images bucket.
    Returns public URL or None on failure.
    """
    storage_path = _build_storage_path(component, session, year, paper_code, question_num)
    return _upload_image(ANSWER_BUCKET, storage_path, image_path)


def get_public_url(bucket: str, storage_path: str) -> str:
    """Return the public URL for a storage path without uploading."""
    client = _get_client()
    return client.storage.from_(bucket).get_public_url(storage_path)
