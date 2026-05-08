"""
parse.py — Parse CAIE 9709 PDF filenames into structured metadata.

Filename format: 9709_{session_code}{year2}_{type}_{component}{variant}.pdf
  e.g.  9709_m25_qp_32.pdf  →  Feb/March 2025, Question Paper, Pure 3, variant 2
        9709_s24_ms_52.pdf  →  May/June 2024, Mark Scheme, Stats 1, variant 2
        9709_w23_qp_41.pdf  →  Oct/Nov 2023, Question Paper, Mechanics, variant 1
"""
import re
from typing import Optional
from config import COMPONENT_MAP, SESSION_CODE_MAP

# Only these paper types are processed
VALID_PAPER_TYPES = {"qp", "ms"}

_FILENAME_RE = re.compile(
    r"^9709_([msw])(\d{2})_(qp|ms|er|gt|in)_(\d)(\d)\.pdf$",
    re.IGNORECASE,
)


def parse_filename(filename: str) -> Optional[dict]:
    """
    Parse a 9709 PDF filename and return a metadata dict, or None if the file
    should be skipped (wrong format or type not in {qp, ms}).

    Returns:
        {
            "session_code": "m",          # raw code: m/s/w
            "year": "2025",               # full 4-digit year string
            "year_2digit": "25",
            "paper_type": "qp",           # "qp" or "ms"
            "component_num": "3",         # raw component digit
            "component": "Pure 3",        # DB component name
            "paper_code": "2",            # variant digit
            "session": "Feb/March",       # DB session name
            "filename": "9709_m25_qp_32.pdf",
        }
    """
    m = _FILENAME_RE.match(filename.strip())
    if not m:
        return None

    session_code = m.group(1).lower()
    year_2digit = m.group(2)
    paper_type = m.group(3).lower()
    component_num = m.group(4)
    variant = m.group(5)

    if paper_type not in VALID_PAPER_TYPES:
        return None

    # Build full 4-digit year: assume 2000s
    year = f"20{year_2digit}"

    session = SESSION_CODE_MAP.get(session_code)
    if session is None:
        return None

    component = COMPONENT_MAP.get(component_num)
    if component is None:
        return None

    return {
        "session_code": session_code,
        "year": year,
        "year_2digit": year_2digit,
        "paper_type": paper_type,
        "component_num": component_num,
        "component": component,
        "paper_code": variant,
        "session": session,
        "filename": filename,
    }


def session_code_from_input(session_arg: str) -> tuple[str, str]:
    """
    Parse a user-supplied session argument like 'm25', 's24', 'w23'.

    Returns:
        (session_code, year_2digit)  e.g. ('m', '25')

    Raises:
        ValueError on bad format.
    """
    session_arg = session_arg.strip().lower()
    m = re.match(r"^([msw])(\d{2})$", session_arg)
    if not m:
        raise ValueError(
            f"Invalid session code '{session_arg}'. "
            "Expected format: <m|s|w><YY>  e.g. m25, s24, w23"
        )
    return m.group(1), m.group(2)
