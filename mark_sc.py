from fastapi import FastAPI
import fitz
import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MARK_SCHEME_BUCKET_NAME = os.getenv("MARK_SCHEME_BUCKET_NAME")
PAPER_DIR = "answers"

app = FastAPI()

# -------------------------------
# Upload to Supabase
# -------------------------------
def upload_to_supabase_storage(image_bytes, filename, bucket_name):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/octet-stream"
    }
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{filename}"
    r = requests.put(upload_url, headers=headers, data=image_bytes)

    if r.status_code != 200:
        print(f"❌ Upload failed for {filename}: {r.text}")
        return None
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{filename}"


# -------------------------------
# Update Supabase DB
# -------------------------------
def update_question_with_mark_scheme(metadata):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    query = "&".join([
        f"question_number=eq.{metadata['question_number']}",
        f"paper_code=eq.{metadata['paper_code']}",
        f"paper_year=eq.{metadata['paper_year']}",
        f"session=eq.{metadata['session']}",
        f"component=eq.{metadata['component']}"
    ])
    url = f"{SUPABASE_URL}/rest/v1/alevel_math_questions?{query}"

    r = requests.patch(url, headers=headers, json={"answer_img": metadata["answer_img"]})

    if r.status_code in [200, 204]:
        print(f"✅ Updated mark scheme for Q{metadata['question_number']}")
    else:
        print(f"❌ Failed to update DB for Q{metadata['question_number']}: {r.text}")


# -------------------------------
# Process PDF
# -------------------------------
@app.get("/upload-mark-scheme")
def upload_mark_scheme_pdf():
    filename = "9709_S24_ms_32.pdf"  # example
    filepath = os.path.join(PAPER_DIR, filename)

    doc = fitz.open(filepath)
    print(f"\n📄 Processing: {filename} | Total pages: {doc.page_count}")

    # Parse filename metadata
    match = re.match(r"9709_([msw])(\d\d)_ms_(\d)(\d)\.pdf", filename, re.IGNORECASE)
    if not match:
        print(f"❌ Bad filename format: {filename}")
        return {"message": "Bad filename format"}

    session_code, year_suffix, component_code, paper_code = match.groups()
    session = {"m": "Feb/March", "s": "May/June", "w": "Oct/Nov"}.get(session_code.lower(), "Unknown")
    year = f"20{year_suffix}"
    component = {
        "1": "Pure 1",
        "2": "Pure 2",
        "3": "Pure 3",
        "4": "Mechanics",
        "5": "Stats 1",
        "6": "Stats 2"
    }.get(component_code, "Unknown")

    # Track questions
    question_map = {}
    current_question = None
    current_subpart = None
    continuation_count = {}

    # -------------------------------
    # Iterate over pages
    # -------------------------------
    for page_num in range(5, doc.page_count):  # skip first 5 pages
        page = doc.load_page(page_num)
        text = page.get_text("text")
        first_lines = " ".join(text.splitlines()[:20])  # look at first ~20 lines

        # Case 1: Direct subpart match (e.g., "7(a)")
        subpart_match = re.search(r"\b(\d{1,2}\([a-z]\))", first_lines)
        # Case 2: Full question number only (e.g., "2")
        question_match = re.search(r"\bQuestion\s*(\d{1,2})\b", first_lines, re.IGNORECASE)
        # Case 3: Alternative method (continuation)
        alt_match = re.search(r"Alternative method for Question (\d{1,2})", first_lines, re.IGNORECASE)

        new_detected = False
        if subpart_match:
            current_question = re.match(r"(\d{1,2})", subpart_match.group(1)).group(1)
            current_subpart = re.search(r"\(([a-z])\)", subpart_match.group(1)).group(1)
            continuation_count[f"{current_question}{current_subpart}"] = 0
            new_detected = True

        elif question_match:
            current_question = question_match.group(1)
            current_subpart = None
            continuation_count[f"{current_question}"] = 0
            new_detected = True

        elif alt_match:
            # Continuation of existing question
            current_question = alt_match.group(1)
            # leave current_subpart as is (still same)
            key = f"{current_question}{current_subpart or ''}"
            continuation_count[key] = continuation_count.get(key, 0) + 1
            new_detected = False

        else:
            # No new question → continuation of previous
            key = f"{current_question}{current_subpart or ''}"
            continuation_count[key] = continuation_count.get(key, 0) + 1
            new_detected = False

        # -------------------------------
        # Build filename
        # -------------------------------
        base_filename = f"{component}_{session}_{year}_{paper_code}_{current_question}"
        if current_subpart:
            base_filename += current_subpart

        key = f"{current_question}{current_subpart or ''}"
        sub_index = continuation_count.get(key, 0)

        if sub_index == 0:
            filename_img = f"{base_filename}.png"
        else:
            filename_img = f"{base_filename}_sub{sub_index}.png"

        # -------------------------------
        # Save & upload
        # -------------------------------
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        public_url = upload_to_supabase_storage(img_bytes, filename_img, MARK_SCHEME_BUCKET_NAME)

        if public_url:
            q_key = current_question + (f"({current_subpart})" if current_subpart else "")
            question_map.setdefault(q_key, []).append(public_url)

        print(f"📄 Page {page_num+1} → {filename_img}")

    # -------------------------------
    # Push to Supabase
    # -------------------------------
    for q_num, img_links in question_map.items():
        metadata = {
            "question_number": q_num,
            "paper_code": paper_code,
            "paper_year": year,
            "session": session,
            "component": component,
            "answer_img": img_links
        }
        update_question_with_mark_scheme(metadata)

    return {"message": "✅ Mark scheme processed successfully"}
