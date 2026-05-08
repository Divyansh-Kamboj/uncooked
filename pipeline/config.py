"""
config.py — Load environment variables and define constants for the pipeline.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the pipeline directory (robust: works from any cwd)
_ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(_ENV_PATH)

# ── Credentials ────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

# ── Storage buckets ────────────────────────────────────────────────────────────
QUESTION_BUCKET = "alevel-math-question-images"
ANSWER_BUCKET = "alevel-math-answer-images"

# ── Gemini model ───────────────────────────────────────────────────────────────
GEMINI_MODEL = "gemini-2.0-flash"

# ── Tmp directory for downloaded / split files ─────────────────────────────────
TMP_DIR = Path("/tmp/uncooked_pipeline")
TMP_DIR.mkdir(parents=True, exist_ok=True)

# ── Component mappings ─────────────────────────────────────────────────────────
# PDF component number → DB component name
COMPONENT_MAP = {
    "1": "Pure 1",
    "2": "Pure 2",
    "3": "Pure 3",
    "4": "Mechanics",
    "5": "Stats 1",
    "6": "Stats 2",
}

# Session code (in filename) → DB session name
SESSION_CODE_MAP = {
    "m": "Feb/March",
    "s": "May/June",
    "w": "Oct/Nov",
}

# Session code → month word used in pastpapers.co URLs
SESSION_MONTH_WORD = {
    "m": "march",
    "s": "may-june",
    "w": "oct-nov",
}

# DB session name → (folder_suffix, file_prefix)
# Storage path: {Component}_{folder_suffix}/{file_prefix}_{Year}_{PaperCode}_{QuestionNum}.png
SESSION_STORAGE_MAP = {
    "May/June":  ("May",   "June"),
    "Oct/Nov":   ("Oct",   "Nov"),
    "Feb/March": ("Feb",   "March"),
}

# ── Topic whitelist for classification ────────────────────────────────────────
TOPIC_WHITELIST = [
    "Algebra",
    "Quadratics",
    "Functions",
    "Coordinate geometry",
    "Circular measure",
    "Trigonometry",
    "Series",
    "Differentiation",
    "Integration",
    "Numerical solution of equations",
    "Vectors",
    "Complex numbers",
    "Forces and equilibrium",
    "Kinematics of motion in a straight line",
    "Newton's laws of motion",
    "Energy work and power",
    "Momentum",
    "Representation of data",
    "Permutations and combinations",
    "Probability",
    "Discrete random variables",
    "The normal distribution",
    "Continuous random variables",
    "Sampling and estimation",
    "Hypothesis tests",
    "The Poisson distribution",
    "Linear combinations of random variables",
]

# ── Gemini rate limiting ───────────────────────────────────────────────────────
# Free tier: 15 RPM. 6s between calls = 10 RPM — comfortable headroom.
GEMINI_SLEEP_SECONDS = 6
# Max seconds to wait on a 429 before retrying (exponential backoff caps here)
GEMINI_BACKOFF_MAX = 60


def gemini_call_with_backoff(fn, *args, max_retries: int = 6, **kwargs):
    """
    Call fn(*args, **kwargs) with exponential backoff on 429 rate-limit errors.
    Raises the last exception if all retries are exhausted.
    """
    import time as _time
    import logging as _logging
    _log = _logging.getLogger(__name__)
    wait = 10
    for attempt in range(max_retries):
        try:
            return fn(*args, **kwargs)
        except Exception as exc:
            msg = str(exc)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower():
                if attempt + 1 >= max_retries:
                    raise
                actual_wait = min(wait, GEMINI_BACKOFF_MAX)
                _log.warning("Gemini 429 – waiting %ds before retry %d/%d", actual_wait, attempt + 1, max_retries)
                _time.sleep(actual_wait)
                wait = min(wait * 2, GEMINI_BACKOFF_MAX)
            else:
                raise
