"""
split.py — Split a PDF into per-page PNG images using pypdfium2.

Each page becomes one image at 150 DPI.

Usage:
    from split import split_pdf
    images = split_pdf(Path("/tmp/.../paper.pdf"), out_dir=Path("/tmp/.../pages/"))
    # returns list of (page_num_1indexed, image_path)
"""
import logging
from pathlib import Path
from typing import Optional

import pypdfium2 as pdfium

logger = logging.getLogger(__name__)

# 150 DPI: good balance of quality vs file size.
# pypdfium2 uses a scale factor relative to 72 DPI: scale = DPI / 72
_SCALE = 150 / 72


def split_pdf(
    pdf_path: Path,
    out_dir: Optional[Path] = None,
    dpi: int = 150,
) -> list[tuple[int, Path]]:
    """
    Render every page of *pdf_path* to a PNG image.

    Args:
        pdf_path: path to the PDF file
        out_dir:  directory to save images; defaults to same dir as PDF with
                  a sub-folder named after the PDF stem.
        dpi:      resolution in dots per inch (default 150)

    Returns:
        List of (page_number, image_path) tuples, 1-indexed page numbers.
    """
    scale = dpi / 72.0

    if out_dir is None:
        out_dir = pdf_path.parent / pdf_path.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    results: list[tuple[int, Path]] = []

    try:
        doc = pdfium.PdfDocument(str(pdf_path))
    except Exception as exc:
        logger.error("Failed to open PDF %s: %s", pdf_path, exc)
        return results

    try:
        n_pages = len(doc)
        logger.info("Splitting %s (%d pages)", pdf_path.name, n_pages)

        for i in range(n_pages):
            page_num = i + 1  # 1-indexed
            img_path = out_dir / f"page_{page_num:03d}.png"

            if img_path.exists():
                logger.debug("Page image already exists, skipping: %s", img_path.name)
                results.append((page_num, img_path))
                continue

            try:
                page = doc[i]
                bitmap = page.render(scale=scale, rotation=0)
                pil_image = bitmap.to_pil()
                pil_image.save(str(img_path), format="PNG")
                results.append((page_num, img_path))
                logger.debug("Rendered page %d → %s", page_num, img_path.name)
            except Exception as exc:
                logger.error(
                    "Failed to render page %d of %s: %s", page_num, pdf_path.name, exc
                )
    finally:
        doc.close()

    return results


def split_qp(pdf_path: Path, out_dir: Optional[Path] = None) -> list[tuple[int, Path]]:
    """Split a question paper PDF. Alias for split_pdf."""
    return split_pdf(pdf_path, out_dir=out_dir)


def split_ms(pdf_path: Path, out_dir: Optional[Path] = None) -> list[tuple[int, Path]]:
    """Split a mark scheme PDF. Alias for split_pdf."""
    return split_pdf(pdf_path, out_dir=out_dir)
