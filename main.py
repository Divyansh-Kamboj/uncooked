from fastapi import FastAPI
import fitz  # PyMuPDF
import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

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
        print(f"Image upload failed for {filename}: {r.text}")
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
        print(f"Metadata upload failed for Q{metadata['question_number']}: {r.text}")
    else:
        print(f"Uploaded Q{metadata['question_number']}")

@app.get("/upload")
def upload_pdf():
    exam_paper = "9709_S24_32.pdf"
    doc = fitz.open(exam_paper)

    session = {"S": "May/June", "W": "October/November", "M": "February/March"}.get(exam_paper[5], "Unknown")
    year = {"5": "2025", "4": "2024", "3": "2023", "2": "2022", "1": "2021", "0": "2020"}.get(exam_paper[7], "Unknown")
    component = {"1": "Pure 1", "3": "Pure 3", "4": "Mechanics", "5": "Stats 1", "6": "Stats 2"}.get(exam_paper[9], "Unknown")
    paper_code = exam_paper[-5]  # 2 in "9709_S24_32.pdf"

    print(f"📄 Processing: {component}_{session}_{year}_P{paper_code}")

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
            print(f"Skipping metadata for Q{current_question}")
            continue

        question_img_map.setdefault(current_question, []).append(public_url)

    # Upload metadata after all pages processed
    for question_num, img_links in question_img_map.items():
        metadata = {
            "question_number": question_num,
            "paper_code": paper_code,
            "paper_year": year,
            "session": session,
            "component": component,
            "question_img": img_links,  # list of links
            "topic": None,
            "answer_img": None,
            "difficulty": None,
            "ai_explanation": None
        }
        upload_metadata_to_supabase(metadata)

    return {"message": "Upload process complete"}
