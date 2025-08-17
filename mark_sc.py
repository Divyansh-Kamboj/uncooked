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
    filename = "9709_m23_ms_32.pdf"  # example
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

    # -------------------------------
    # Iterate over pages
    # -------------------------------
    for page_num in range(5, doc.page_count):  # start from page 5
        page = doc.load_page(page_num)
        text = page.get_text("text")
        
        # Simplified regex to find a question number at the beginning of the text
        # This reliably detects both "Question 1" and just "1" at the start of a page
        question_match = re.search(r"^\s*Question\s*(\d{1,2})|\b(\d{1,2})\s*\(?[a-zA-Z]\)?", text, re.IGNORECASE)

        if question_match:
            # Use the most specific match group
            if question_match.group(1):
                current_question = question_match.group(1)
            else:
                current_question = question_match.group(2)
        
        # -------------------------------
        # Build filename
        # -------------------------------
        # The filename now relies on the page number to ensure uniqueness
        if current_question:
            filename_img = f"MS_{component}_{session}_{year}_{paper_code}_{current_question}_page{page_num+1}.png"
            
            # -------------------------------
            # Save & upload
            # -------------------------------
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            public_url = upload_to_supabase_storage(img_bytes, filename_img, MARK_SCHEME_BUCKET_NAME)

            if public_url:
                question_map.setdefault(current_question, []).append(public_url)
            
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
