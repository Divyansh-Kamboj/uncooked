"""
download.py — Download 9709 PDFs from pastpapers.co by constructing URLs directly.

The listing page returns 403, but direct download URLs work fine.
We enumerate all possible component/variant combinations and download what exists.

Usage:
    from download import download_session, download_single_ms
    paths = download_session("m", "25", Path("/tmp/uncooked_pipeline/m25"))
"""
import logging
from pathlib import Path
from typing import Optional

import httpx

from config import TMP_DIR

logger = logging.getLogger(__name__)

BASE_URL = "https://pastpapers.co"
DOWNLOAD_URL_TEMPLATE = "{base}/api/file/caie/a-level/mathematics-9709/{year}-{month}/{filename}?download=true"

# Month word used in pastpapers.co URL paths
SESSION_MONTH_WORD = {
    "m": "march",
    "s": "may-june",
    "w": "oct-nov",
}

# All component numbers for 9709
ALL_COMPONENTS = ["1", "2", "3", "4", "5", "6"]
# All variant/paper codes
ALL_VARIANTS = ["1", "2", "3"]

_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "*/*",
    "Referer": "https://pastpapers.co/",
}


def _build_download_url(session_code: str, year_2digit: str, paper_type: str, component: str, variant: str) -> str:
    filename = f"9709_{session_code}{year_2digit}_{paper_type}_{component}{variant}.pdf"
    month = SESSION_MONTH_WORD[session_code]
    year_full = f"20{year_2digit}"
    return DOWNLOAD_URL_TEMPLATE.format(
        base=BASE_URL, year=year_full, month=month, filename=filename
    ), filename


def _download_one(url: str, filename: str, dest: Path, client: httpx.Client) -> Optional[Path]:
    out_path = dest / filename
    if out_path.exists():
        logger.info("Already exists, skipping: %s", filename)
        return out_path
    try:
        with client.stream("GET", url, timeout=60, follow_redirects=True) as resp:
            if resp.status_code == 404:
                return None  # This variant doesn't exist — normal
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                for chunk in resp.iter_bytes(chunk_size=65536):
                    f.write(chunk)
        logger.info("Downloaded: %s", filename)
        return out_path
    except Exception as exc:
        logger.error("Failed to download %s: %s", filename, exc)
        if out_path.exists():
            out_path.unlink()
        return None


def download_session(
    session_code: str,
    year_2digit: str,
    download_dir: Optional[Path] = None,
    components: Optional[list] = None,
    paper_types: Optional[list] = None,
) -> list[Path]:
    """
    Download all qp + ms PDFs for a session by enumerating all component/variant combos.

    The listing page on pastpapers.co blocks scrapers, so we construct URLs directly.
    A 404 response means that variant doesn't exist — this is expected and silently skipped.

    Args:
        session_code:  'm', 's', or 'w'
        year_2digit:   two-digit year, e.g. '25'
        download_dir:  where to save; defaults to TMP_DIR/{session_code}{year_2digit}/
        components:    component numbers to try (default: all ["1","2","3","4","5","6"])
        paper_types:   paper types to download (default: ["qp", "ms"])

    Returns:
        List of Paths to successfully downloaded PDF files.
    """
    if download_dir is None:
        download_dir = TMP_DIR / f"{session_code}{year_2digit}"
    download_dir.mkdir(parents=True, exist_ok=True)

    if components is None:
        components = ALL_COMPONENTS
    if paper_types is None:
        paper_types = ["qp", "ms"]

    downloaded: list[Path] = []
    with httpx.Client(headers=_HEADERS) as client:
        for comp in components:
            for variant in ALL_VARIANTS:
                for ptype in paper_types:
                    url, filename = _build_download_url(session_code, year_2digit, ptype, comp, variant)
                    path = _download_one(url, filename, download_dir, client)
                    if path is not None:
                        downloaded.append(path)

    logger.info(
        "Downloaded %d file(s) for session %s%s",
        len(downloaded), session_code, year_2digit,
    )
    return downloaded


def download_single_ms(
    session_code: str,
    year_2digit: str,
    component_num: str,
    paper_code: str,
    download_dir: Optional[Path] = None,
) -> Optional[Path]:
    """
    Download a single mark-scheme PDF (for backfill mode).
    Returns the local Path or None if not found / on error.
    """
    if download_dir is None:
        download_dir = TMP_DIR / f"{session_code}{year_2digit}"
    download_dir.mkdir(parents=True, exist_ok=True)

    url, filename = _build_download_url(session_code, year_2digit, "ms", component_num, paper_code)

    with httpx.Client(headers=_HEADERS) as client:
        return _download_one(url, filename, download_dir, client)
