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
    "s": "may",
    "w": "october",
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
# Free tier: ~15 RPM.  Sleep this many seconds between consecutive Gemini calls.
GEMINI_SLEEP_SECONDS = 4
