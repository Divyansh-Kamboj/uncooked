from fastapi import FastAPI
import fitz  # PyMuPDF
import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

PAPER_DIR = "papers"
app = FastAPI()

def upload_to_supabase_storage(image_bytes, filename):
    storage_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/octet-stream"
    }
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{filename}"
    r = requests.put(upload_url, headers=storage_headers, data=image_bytes)

    if r.status_code != 200:
        print(f"❌ Image upload failed for {filename}: {r.text}")
        return None

    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"

def upload_metadata_to_supabase(metadata):
    db_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/alevel_math_questions",
        headers=db_headers,
        json=metadata
    )

    if r.status_code not in [200, 201]:
        print(f"❌ Metadata upload failed for Q{metadata['question_number']}: {r.text}")
    else:
        print(f"✅ Uploaded Q{metadata['question_number']}")

@app.get("/upload-all")
def upload_all_pdfs():
    pdf_files = [f for f in os.listdir(PAPER_DIR) if f.endswith(".pdf")]
    for exam_paper in pdf_files:
        process_paper(os.path.join(PAPER_DIR, exam_paper))
    return {"message": "✅ All PDFs processed and uploaded."}

def process_paper(filepath):
    exam_paper = os.path.basename(filepath)
    print(f"\n📄 Processing {exam_paper}...")

    doc = fitz.open(filepath)

    # match pattern like: 9709_m23_qp_12.pdf
    match = re.match(r"9709_([msw])(\d\d)_qp_(\d)(\d)\.pdf", exam_paper, re.IGNORECASE)
    if not match:
        print(f"❌ Filename format not recognized: {exam_paper}")
        return

    session_code, year_suffix, component_code, paper_code = match.groups()
    session = {"m": "Feb/March", "s": "May/June", "w": "Oct/Nov"}.get(session_code.lower(), "Unknown")
    year = f"20{year_suffix}"
    component = {
        "1": "Pure 1",
        "2": "Pure 2",  # optional — if you ever add this
        "3": "Pure 3",
        "4": "Mechanics",
        "5": "Stats 1",
        "6": "Stats 2"
    }.get(component_code, "Unknown")

    print(f"📄 {component}_{session}_{year}_P{paper_code}")

    question_index = 1
    current_question = str(question_index)
    question_img_map = {}

    for page_num in range(2, doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text()

        if "Additional page" in text or "BLANK PAGE" in text:
            continue

        lines = text.splitlines()
        combined = " ".join(lines[:10])
        match = re.search(r"\b(\d{1,2})\s*\(?[a-zA-Z]\)?", combined)

        if match:
            current_question = str(question_index)
            question_index += 1
            question_img_map[current_question] = []

        subpart = len(question_img_map.get(current_question, []))
        if subpart == 0:
            filename = f"{component}_{session}_{year}_{paper_code}_{current_question}.png"
        else:
            filename = f"{component}_{session}_{year}_{paper_code}_{current_question}_sub{subpart}.png"

        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        public_url = upload_to_supabase_storage(img_bytes, filename)

        if not public_url:
            print(f"❌ Skipping metadata for Q{current_question}")
            continue

        question_img_map.setdefault(current_question, []).append(public_url)

    for question_num, img_links in question_img_map.items():
        metadata = {
            "question_number": question_num,
            "paper_code": paper_code,
            "paper_year": year,
            "session": session,
            "component": component,
            "question_img": img_links,
            "topic": None,
            "answer_img": None,
            "difficulty": None,
            "ai_explanation": None
        }
        upload_metadata_to_supabase(metadata)
