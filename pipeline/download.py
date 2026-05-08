"""
download.py — Scrape pastpapers.co and download 9709 PDFs for a given session.

Usage:
    from download import download_session
    paths = download_session("m", "25", Path("/tmp/uncooked_pipeline/m25"))
"""
import re
import logging
from pathlib import Path
from typing import Optional

import httpx
from bs4 import BeautifulSoup

from config import SESSION_MONTH_WORD, TMP_DIR

logger = logging.getLogger(__name__)

BASE_URL = "https://pastpapers.co"
LISTING_URL_TEMPLATE = (
    "{base}/caie/a-level/mathematics-9709/{year}-{month}/"
)
DOWNLOAD_URL_TEMPLATE = "{base}/api/file{path}?download=true"

_VALID_TYPES = {"qp", "ms"}
_FILENAME_RE = re.compile(r"9709_[msw]\d{2}_(qp|ms|er|gt|in)_\d{2}\.pdf", re.IGNORECASE)


def _build_listing_url(session_code: str, year_2digit: str) -> str:
    month = SESSION_MONTH_WORD[session_code]
    year_full = f"20{year_2digit}"
    return LISTING_URL_TEMPLATE.format(base=BASE_URL, year=year_full, month=month)


def _scrape_pdf_links(listing_url: str, session_code: str, year_2digit: str) -> list[dict]:
    """
    Fetch the listing page and return a list of dicts:
        { "filename": "9709_m25_qp_32.pdf", "path": "/caie/.../9709_m25_qp_32.pdf" }
    Only includes qp and ms PDFs.
    """
    try:
        resp = httpx.get(listing_url, timeout=30, follow_redirects=True)
        resp.raise_for_status()
    except Exception as exc:
        logger.error("Failed to fetch listing page %s: %s", listing_url, exc)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    results = []

    for a_tag in soup.find_all("a", href=True):
        href: str = a_tag["href"]
        # Match filenames like 9709_m25_qp_32.pdf
        m = _FILENAME_RE.search(href)
        if not m:
            continue

        paper_type = m.group(1).lower()
        if paper_type not in _VALID_TYPES:
            continue

        # Extract just the filename from the href
        filename = href.rstrip("/").split("/")[-1]

        # Make sure the filename contains our session
        session_tag = f"9709_{session_code}{year_2digit}_"
        if session_tag not in filename.lower():
            continue

        # The path is everything after the base URL, or the full href if relative
        if href.startswith("http"):
            path = "/" + "/".join(href.split("/")[3:])
        else:
            path = href if href.startswith("/") else f"/{href}"

        results.append({"filename": filename, "path": path})

    # Deduplicate by filename
    seen = set()
    unique = []
    for item in results:
        if item["filename"] not in seen:
            seen.add(item["filename"])
            unique.append(item)

    return unique


def _download_pdf(path: str, dest: Path, client: httpx.Client) -> Optional[Path]:
    """
    Download one PDF file. Returns the saved Path or None on error.
    """
    url = DOWNLOAD_URL_TEMPLATE.format(base=BASE_URL, path=path)
    filename = path.rstrip("/").split("/")[-1]
    out_path = dest / filename

    if out_path.exists():
        logger.info("Already exists, skipping download: %s", out_path.name)
        return out_path

    try:
        with client.stream("GET", url, timeout=60, follow_redirects=True) as resp:
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                for chunk in resp.iter_bytes(chunk_size=65536):
                    f.write(chunk)
        logger.info("Downloaded: %s", out_path.name)
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
) -> list[Path]:
    """
    Download all qp + ms PDFs for a given session from pastpapers.co.

    Args:
        session_code:  'm', 's', or 'w'
        year_2digit:   two-digit year, e.g. '25'
        download_dir:  where to save; defaults to TMP_DIR/{session_code}{year_2digit}/

    Returns:
        List of Paths to successfully downloaded PDF files.
    """
    if download_dir is None:
        download_dir = TMP_DIR / f"{session_code}{year_2digit}"
    download_dir.mkdir(parents=True, exist_ok=True)

    listing_url = _build_listing_url(session_code, year_2digit)
    logger.info("Fetching listing: %s", listing_url)

    links = _scrape_pdf_links(listing_url, session_code, year_2digit)
    if not links:
        logger.warning("No PDF links found for session %s%s", session_code, year_2digit)
        return []

    logger.info("Found %d PDF(s) to download", len(links))

    downloaded: list[Path] = []
    with httpx.Client(headers={"User-Agent": "Mozilla/5.0"}) as client:
        for item in links:
            path = _download_pdf(item["path"], download_dir, client)
            if path is not None:
                downloaded.append(path)

    logger.info(
        "Downloaded %d/%d files for session %s%s",
        len(downloaded), len(links), session_code, year_2digit,
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
    Download a single mark-scheme PDF for backfill.
    Filename: 9709_{session_code}{year_2digit}_ms_{component_num}{paper_code}.pdf
    """
    filename = f"9709_{session_code}{year_2digit}_ms_{component_num}{paper_code}.pdf"
    path = f"/caie/a-level/mathematics-9709/20{year_2digit}-{SESSION_MONTH_WORD[session_code]}/{filename}"

    if download_dir is None:
        download_dir = TMP_DIR / f"{session_code}{year_2digit}"
    download_dir.mkdir(parents=True, exist_ok=True)

    out_path = download_dir / filename
    if out_path.exists():
        logger.info("Already exists: %s", filename)
        return out_path

    url = DOWNLOAD_URL_TEMPLATE.format(base=BASE_URL, path=path)
    try:
        with httpx.Client(headers={"User-Agent": "Mozilla/5.0"}) as client:
            with client.stream("GET", url, timeout=60, follow_redirects=True) as resp:
                resp.raise_for_status()
                with open(out_path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=65536):
                        f.write(chunk)
        logger.info("Downloaded MS: %s", filename)
        return out_path
    except Exception as exc:
        logger.error("Failed to download MS %s: %s", filename, exc)
        if out_path.exists():
            out_path.unlink()
        return None
