import fitz
import re
import os

doc = fitz.open("MathTest.pdf")
output_dir = "question_images"
os.makedirs(output_dir, exist_ok=True)

current_question = None
question_subpage_count = {}

for page_num in range(2, doc.page_count):
    page = doc.load_page(page_num)
    text = page.get_text()
    lines = text.splitlines()

    # Skip if it's a blank or additional page
    if "Additional page" in text or "BLANK PAGE" in text:
        continue

    filename = None
    found = False

    # Combine top lines to handle cases like:
    # 1\n(a) Sketch the graph...
    combined = " ".join(lines[:10])  # combine top 10 lines with space

    # Updated regex: captures `1 (a)` or `1\n(a)` as `1`
    match = re.search(r"\b(\d{1,2})\s*\(?[a-zA-Z]\)?", combined)
    if match:
        current_question = match.group(1)
        question_subpage_count[current_question] = 0
        filename = f"{current_question}.png"
        found = True

    if not found and current_question:
        question_subpage_count[current_question] += 1
        filename = f"{current_question}_sub{question_subpage_count[current_question]}.png"

    if filename is None:
        print(f"Page {page_num}: Skipped (no question or continuation found)")
        continue

    # Save image
    pix = page.get_pixmap(dpi=150)
    path = os.path.join(output_dir, filename)
    pix.save(path)
    print(f"Saved page {page_num} as {filename}")
