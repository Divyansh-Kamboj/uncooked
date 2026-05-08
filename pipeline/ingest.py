"""
ingest.py — CLI entrypoint for the Uncooked pipeline.

Usage:
    # New session: download, split, classify, explain, match, upload, upsert
    python pipeline/ingest.py --session m25

    # Backfill: fill answer_img for existing records (and explanations where missing)
    python pipeline/ingest.py --backfill

    # Dry run (no uploads / DB writes)
    python pipeline/ingest.py --session m25 --dry-run
"""
import json
import logging
import shutil
import sys
import time
from collections import defaultdict
from pathlib import Path
from typing import Optional

import click
from tqdm import tqdm

# ── Pipeline modules ───────────────────────────────────────────────────────────
# Add parent dir to sys.path so we can run from any cwd
sys.path.insert(0, str(Path(__file__).parent))

from config import (
    TMP_DIR,
    SESSION_CODE_MAP,
    COMPONENT_MAP,
    GEMINI_SLEEP_SECONDS,
)
from parse import parse_filename, session_code_from_input
from download import download_session, download_single_ms
from split import split_qp, split_ms
from classify import classify_question
from explain import generate_explanation
from match import match_question_to_ms, build_ms_index, match_from_index
from upload import upload_question_image, upload_answer_image
from db import (
    upsert_question,
    get_questions_missing_answers,
    get_questions_missing_explanations,
    update_answer_img_multi,
    update_explanation,
)

# ── Logging setup ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("ingest")


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _component_num_from_name(component: str) -> Optional[str]:
    """Reverse-look up the component number from the component name."""
    reverse = {v: k for k, v in COMPONENT_MAP.items()}
    return reverse.get(component)


def _session_code_from_session(session: str) -> Optional[str]:
    """Reverse-look up the session code (m/s/w) from the DB session name."""
    reverse = {v: k for k, v in SESSION_CODE_MAP.items()}
    return reverse.get(session)


def _year_2digit(year: str) -> str:
    """Convert '2025' → '25'."""
    return year[-2:]


# ─────────────────────────────────────────────────────────────────────────────
# New session flow
# ─────────────────────────────────────────────────────────────────────────────

def process_new_session(session_arg: str, dry_run: bool) -> None:
    """
    Full pipeline for a new session:
      1. Download all QP + MS PDFs
      2. For each QP: split → classify each page → match to MS → upload → upsert
    """
    session_code, year_2digit = session_code_from_input(session_arg)
    year_full = f"20{year_2digit}"
    session_name = SESSION_CODE_MAP[session_code]

    logger.info(
        "=== New session: %s%s  (%s %s) ===",
        session_code, year_2digit, session_name, year_full,
    )

    # ── Step 1: Download PDFs ──────────────────────────────────────────────────
    dl_dir = TMP_DIR / f"{session_code}{year_2digit}"
    pdfs = download_session(session_code, year_2digit, dl_dir)

    if not pdfs:
        logger.warning("No PDFs downloaded — aborting session processing.")
        return

    # Separate QPs from MSs
    qp_pdfs = [p for p in pdfs if f"_qp_" in p.name.lower()]
    ms_pdfs = [p for p in pdfs if f"_ms_" in p.name.lower()]

    logger.info("QPs: %d  |  MSs: %d", len(qp_pdfs), len(ms_pdfs))

    # Build a lookup: (component_num, paper_code) → MS page images
    ms_page_cache: dict[tuple[str, str], list[tuple[int, Path]]] = {}

    def _get_ms_pages(component_num: str, paper_code: str) -> list[tuple[int, Path]]:
        key = (component_num, paper_code)
        if key not in ms_page_cache:
            # Find the matching MS PDF
            target_stem = f"9709_{session_code}{year_2digit}_ms_{component_num}{paper_code}"
            matching_ms = [p for p in ms_pdfs if p.stem.lower() == target_stem.lower()]
            if not matching_ms:
                logger.warning("No MS PDF found for component %s variant %s", component_num, paper_code)
                ms_page_cache[key] = []
            else:
                ms_out = matching_ms[0].parent / f"{matching_ms[0].stem}_pages"
                ms_page_cache[key] = split_ms(matching_ms[0], out_dir=ms_out)
        return ms_page_cache[key]

    # ── Step 2: Process each QP ────────────────────────────────────────────────
    total_success = 0
    total_errors = 0
    error_log: list[str] = []

    for qp_pdf in qp_pdfs:
        meta = parse_filename(qp_pdf.name)
        if meta is None or meta["paper_type"] != "qp":
            logger.warning("Skipping unrecognized file: %s", qp_pdf.name)
            continue

        component = meta["component"]
        component_num = meta["component_num"]
        paper_code = meta["paper_code"]
        session = meta["session"]
        year = meta["year"]

        logger.info(
            "Processing QP: %s  (component=%s, paper_code=%s)",
            qp_pdf.name, component, paper_code,
        )

        # Split QP into pages
        qp_out = qp_pdf.parent / f"{qp_pdf.stem}_pages"
        qp_pages = split_qp(qp_pdf, out_dir=qp_out)

        if not qp_pages:
            logger.error("No pages extracted from %s", qp_pdf.name)
            total_errors += 1
            continue

        # Get MS pages for this paper
        ms_pages = _get_ms_pages(component_num, paper_code)

        # Process each page
        with tqdm(qp_pages, desc=f"{qp_pdf.stem}", unit="page") as pbar:
            for page_num, page_path in pbar:
                try:
                    _process_qp_page(
                        page_path=page_path,
                        page_num=page_num,
                        component=component,
                        component_num=component_num,
                        paper_code=paper_code,
                        session=session,
                        year=year,
                        ms_pages=ms_pages,
                        dry_run=dry_run,
                    )
                    total_success += 1
                except Exception as exc:
                    msg = f"ERROR page {page_num} of {qp_pdf.name}: {exc}"
                    logger.error(msg)
                    error_log.append(msg)
                    total_errors += 1

    # ── Summary ────────────────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print(f"Session {session_arg} complete.")
    print(f"  Processed: {total_success} question pages")
    print(f"  Errors:    {total_errors}")
    if error_log:
        print("\nErrors:")
        for e in error_log:
            print(f"  {e}")
    print('='*60)


def _process_qp_page(
    page_path: Path,
    page_num: int,
    component: str,
    component_num: str,
    paper_code: str,
    session: str,
    year: str,
    ms_pages: list[tuple[int, Path]],
    dry_run: bool,
) -> None:
    """
    Process a single QP page image:
      - Classify (topic, difficulty, question_number)
      - Generate explanation
      - Match to MS pages
      - Upload both images
      - Upsert DB record
    """
    # ── Classify ───────────────────────────────────────────────────────────────
    classification = classify_question(page_path, sleep_after=True)
    if classification is None:
        raise RuntimeError(f"Classification failed for page {page_num}")

    question_number = classification["question_number"]
    topic = classification["topic"]
    difficulty = classification["difficulty"]

    logger.info(
        "Page %d → Q%s | topic=%s | difficulty=%s",
        page_num, question_number, topic, difficulty,
    )

    # Skip cover/instructions pages
    if question_number == "0":
        logger.info("Page %d appears to be a cover/instructions page; skipping.", page_num)
        return

    # ── Check existing DB record ───────────────────────────────────────────────
    from db import get_existing_question
    existing = get_existing_question(year, session, component, paper_code, question_number)
    has_explanation = existing is not None and existing.get("ai_explanation") is not None

    # ── Generate explanation (skip if already exists) ──────────────────────────
    explanation: Optional[str] = None
    if not has_explanation and not dry_run:
        explanation = generate_explanation(page_path, sleep_after=True)

    # ── Match MS pages ─────────────────────────────────────────────────────────
    matched_ms_pages: list[Path] = []
    if ms_pages:
        matched_ms_pages = match_question_to_ms(
            question_number=question_number,
            ms_page_images=ms_pages,
            question_image_path=page_path,
        )

    if dry_run:
        logger.info(
            "[DRY RUN] Would upsert Q%s: topic=%s, difficulty=%s, "
            "ms_pages=%d, explanation=%s",
            question_number, topic, difficulty,
            len(matched_ms_pages),
            "yes" if explanation else "no",
        )
        return

    # ── Upload question image ──────────────────────────────────────────────────
    q_url = upload_question_image(
        image_path=page_path,
        component=component,
        session=session,
        year=year,
        paper_code=paper_code,
        question_num=question_number,
    )

    # ── Upload answer image(s) ─────────────────────────────────────────────────
    answer_urls: list[str] = []
    for i, ms_page_path in enumerate(matched_ms_pages):
        # For multi-page answers, append a suffix to question_num
        q_suffix = question_number if len(matched_ms_pages) == 1 else f"{question_number}_p{i+1}"
        a_url = upload_answer_image(
            image_path=ms_page_path,
            component=component,
            session=session,
            year=year,
            paper_code=paper_code,
            question_num=q_suffix,
        )
        if a_url:
            answer_urls.append(a_url)

    # ── Upsert DB record ───────────────────────────────────────────────────────
    record: dict = {
        "paper_year": year,
        "session": session,
        "component": component,
        "paper_code": paper_code,
        "question_number": question_number,
        "topic": topic,
        "difficulty": difficulty,
    }

    if q_url:
        record["question_img"] = json.dumps([q_url])

    if answer_urls:
        record["answer_img"] = json.dumps(answer_urls)

    if explanation:
        record["ai_explanation"] = explanation

    upsert_question(record)


# ─────────────────────────────────────────────────────────────────────────────
# Backfill flow
# ─────────────────────────────────────────────────────────────────────────────

def process_backfill(dry_run: bool) -> None:
    """
    Backfill flow:
      1. Fetch all records where answer_img IS NULL
      2. Group by (session, paper_year, component, paper_code)
      3. For each group: download MS, split, match to each question, upload, update DB
      4. Also fill ai_explanation where missing
    """
    logger.info("=== Backfill mode ===")

    records = get_questions_missing_answers()
    if not records:
        logger.info("No records missing answer_img — nothing to backfill.")
    else:
        logger.info("Backfilling %d records...", len(records))
        _backfill_answers(records, dry_run)

    # Also generate missing explanations
    exp_records = get_questions_missing_explanations()
    if exp_records:
        logger.info("Generating explanations for %d records...", len(exp_records))
        _backfill_explanations(exp_records, dry_run)
    else:
        logger.info("No records missing ai_explanation.")


def _backfill_answers(records: list[dict], dry_run: bool) -> None:
    """Group records by paper and process each group."""
    # Group by (session, paper_year, component, paper_code)
    groups: dict[tuple, list[dict]] = defaultdict(list)
    for rec in records:
        key = (
            rec.get("session", ""),
            rec.get("paper_year", ""),
            rec.get("component", ""),
            rec.get("paper_code", ""),
        )
        groups[key].append(rec)

    total_success = 0
    total_errors = 0
    error_log: list[str] = []

    for (session, paper_year, component, paper_code), group_records in tqdm(
        groups.items(), desc="Papers", unit="paper"
    ):
        try:
            _backfill_paper_group(
                session=session,
                paper_year=paper_year,
                component=component,
                paper_code=paper_code,
                records=group_records,
                dry_run=dry_run,
            )
            total_success += len(group_records)
        except Exception as exc:
            msg = f"ERROR paper ({session} {paper_year} {component} {paper_code}): {exc}"
            logger.error(msg)
            error_log.append(msg)
            total_errors += len(group_records)

    print(f"\n{'='*60}")
    print(f"Backfill (answers) complete.")
    print(f"  Records attempted: {total_success + total_errors}")
    print(f"  Errors:           {total_errors}")
    if error_log:
        for e in error_log:
            print(f"  {e}")
    print('='*60)


def _backfill_paper_group(
    session: str,
    paper_year: str,
    component: str,
    paper_code: str,
    records: list[dict],
    dry_run: bool,
) -> None:
    """
    Download the MS for one paper, split it, then match each question.
    """
    session_code = _session_code_from_session(session)
    if session_code is None:
        raise ValueError(f"Unknown session: {session}")

    component_num = _component_num_from_name(component)
    if component_num is None:
        raise ValueError(f"Unknown component: {component}")

    year_2d = _year_2digit(paper_year)
    dl_dir = TMP_DIR / f"{session_code}{year_2d}"

    # Download MS PDF
    ms_pdf = download_single_ms(session_code, year_2d, component_num, paper_code, dl_dir)
    if ms_pdf is None:
        raise RuntimeError(f"Could not download MS for {session} {paper_year} {component} {paper_code}")

    # Split MS
    ms_out = ms_pdf.parent / f"{ms_pdf.stem}_pages"
    ms_pages = split_ms(ms_pdf, out_dir=ms_out)

    if not ms_pages:
        raise RuntimeError(f"No pages extracted from {ms_pdf.name}")

    # Build MS index ONCE for this paper (M Gemini calls, not N*M)
    ms_index = build_ms_index(ms_pages)

    # Match and upload for each question record
    for rec in tqdm(records, desc=f"{component} {paper_code}", unit="q", leave=False):
        question_number = str(rec.get("question_number", "")).strip()
        question_id = rec["id"]

        try:
            # O(1) lookup from pre-built index — no extra Gemini calls per question
            matched_ms = match_from_index(question_number, ms_index)

            if not matched_ms:
                logger.warning(
                    "No MS pages matched for Q%s in %s %s %s %s",
                    question_number, session, paper_year, component, paper_code,
                )
                continue

            if dry_run:
                logger.info(
                    "[DRY RUN] Would upload %d MS page(s) for id=%d Q%s",
                    len(matched_ms), question_id, question_number,
                )
                continue

            # Upload each matched MS page
            answer_urls: list[str] = []
            for i, ms_page_path in enumerate(matched_ms):
                q_suffix = (
                    question_number if len(matched_ms) == 1
                    else f"{question_number}_p{i+1}"
                )
                url = upload_answer_image(
                    image_path=ms_page_path,
                    component=component,
                    session=session,
                    year=paper_year,
                    paper_code=paper_code,
                    question_num=q_suffix,
                )
                if url:
                    answer_urls.append(url)

            if answer_urls:
                update_answer_img_multi(question_id, answer_urls)

        except Exception as exc:
            logger.error(
                "Error processing Q%s for id=%d: %s", question_number, question_id, exc
            )


def _backfill_explanations(records: list[dict], dry_run: bool) -> None:
    """Generate and store ai_explanation for records that are missing it."""
    success = 0
    errors = 0

    for rec in tqdm(records, desc="Explanations", unit="q"):
        question_id = rec["id"]
        # We need the question image to generate the explanation
        # Try to get it from question_img field
        q_img_json = rec.get("question_img")
        if not q_img_json:
            logger.debug("No question_img for id=%d, skipping explanation.", question_id)
            errors += 1
            continue

        try:
            urls = json.loads(q_img_json) if isinstance(q_img_json, str) else q_img_json
            if not urls:
                errors += 1
                continue

            # Download the question image temporarily to generate explanation
            import httpx
            q_url = urls[0]
            tmp_img = TMP_DIR / f"explain_tmp_{question_id}.png"

            try:
                resp = httpx.get(q_url, timeout=30, follow_redirects=True)
                resp.raise_for_status()
                tmp_img.write_bytes(resp.content)
            except Exception as exc:
                logger.error("Failed to download question image for id=%d: %s", question_id, exc)
                errors += 1
                continue

            if dry_run:
                logger.info("[DRY RUN] Would generate explanation for id=%d", question_id)
                if tmp_img.exists():
                    tmp_img.unlink()
                success += 1
                continue

            explanation = generate_explanation(tmp_img, sleep_after=True)
            if tmp_img.exists():
                tmp_img.unlink()

            if explanation:
                update_explanation(question_id, explanation)
                success += 1
            else:
                errors += 1

        except Exception as exc:
            logger.error("Error generating explanation for id=%d: %s", question_id, exc)
            errors += 1

    print(f"\nExplanation backfill: {success} succeeded, {errors} failed.")


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

@click.command()
@click.option(
    "--session",
    default=None,
    help="Session code to process, e.g. m25, s24, w23",
)
@click.option(
    "--backfill",
    is_flag=True,
    default=False,
    help="Backfill answer_img (and explanations) for all existing records",
)
@click.option(
    "--dry-run",
    is_flag=True,
    default=False,
    help="Parse and classify without uploading or updating DB",
)
def main(session: Optional[str], backfill: bool, dry_run: bool) -> None:
    """Uncooked pipeline: ingest CAIE 9709 past papers into Supabase."""

    if not session and not backfill:
        raise click.UsageError("Provide --session <code> or --backfill")

    if dry_run:
        logger.info("DRY RUN mode — no uploads or DB writes will occur.")

    if backfill:
        process_backfill(dry_run=dry_run)

    if session:
        process_new_session(session, dry_run=dry_run)


if __name__ == "__main__":
    main()
