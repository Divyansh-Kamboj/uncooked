from fastapi import FastAPI
import fitz
import re
import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PAPER_BUCKET_NAME = os.getenv("PAPER_BUCKET_NAME")
MARK_SCHEME_BUCKET_NAME = os.getenv("MARK_SCHEME_BUCKET_NAME")

app = FastAPI()

def upload_to_supabase_storage(image_bytes, filename, bucket_name):
    """Uploads an image to a specified Supabase storage bucket."""
    storage_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/octet-stream"
    }
    upload_url = f"{SUPABASE_URL}/storage/v1/object/{bucket_name}/{filename}"
    r = requests.put(upload_url, headers=storage_headers, data=image_bytes)

    if r.status_code != 200:
        print(f"❌ Image upload failed for {filename} to bucket {bucket_name}: {r.text}")
        return None
    
    return f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{filename}"

def update_question_with_mark_scheme(metadata):
    """
    Updates an existing question record in the database with mark scheme details.
    
    This function assumes the question already exists and uses the unique paper
    details to find and update the correct record.
    """
    db_headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # Construct query to find the specific question
    query_params = {
        "question_number": f"eq.{metadata['question_number']}",
        "paper_code": f"eq.{metadata['paper_code']}",
        "paper_year": f"eq.{metadata['paper_year']}",
        "session": f"eq.{metadata['session']}",
        "component": f"eq.{metadata['component']}"
    }

    # Filter out None values to prevent query errors
    filtered_params = {k: v for k, v in query_params.items() if v is not None}
    params_string = "&".join([f"{k}={v}" for k, v in filtered_params.items()])

    update_url = f"{SUPABASE_URL}/rest/v1/alevel_math_questions?{params_string}"

    r = requests.patch(
        update_url,
        headers=db_headers,
        json=metadata
    )

    if r.status_code in [200, 204]:
        print(f"✅ Updated mark scheme for Q{metadata['question_number']} in {metadata['component']} {metadata['paper_year']}")
    else:
        print(f"❌ Failed to update mark scheme for Q{metadata['question_number']}: {r.text}")


@app.get("/upload-mark-scheme")
def upload_mark_scheme_pdf():
    """
    Processes a single mark scheme PDF, extracts relevant pages, and updates the database.
    """
    # NOTE: In a production environment, you would iterate through a directory
    # or handle the file dynamically. For this example, we hardcode the filename.
    mark_scheme_file = "9709_m23_ms_32.pdf"
    
    doc = fitz.open(mark_scheme_file)
    print(f"\n📄 Processing mark scheme: {mark_scheme_file}...")

    # Parse filename for metadata
    match = re.match(r"9709_([msw])(\d\d)_ms_(\d)(\d)\.pdf", mark_scheme_file, re.IGNORECASE)
    if not match:
        print(f"❌ Filename format not recognized: {mark_scheme_file}")
        return {"message": "Processing failed due to incorrect filename format."}

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

    print(f"📄 Extracted Details: {component}_{session}_{year}_P{paper_code}")

    question_map = {}
    current_question_number = None

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text()

        # Logic to identify the start of a question and its sub-parts
        # This is a key part of the adaptation and is more complex than for the QPs
        # A simple regex might not be enough for all formats, but we'll use a basic one
        question_match = re.search(r"Question\s*(\d{1,2}(?:\([a-zA-Z]\))?)", text, re.IGNORECASE)
        if question_match:
            current_question_number = question_match.group(1).strip()
            if current_question_number not in question_map:
                question_map[current_question_number] = []
        
        # Check if we are on a page that contains a question and its mark scheme
        # We assume that if a question number has been identified, subsequent pages are part of its mark scheme until a new question is found.
        # This is a simplified approach. A more robust solution might need to check for specific table patterns.
        if current_question_number:
            # Render the page as an image
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")

            # Create a filename for the mark scheme page
            filename = f"MS_{component}_{session}_{year}_{paper_code}_{current_question_number}_page_{page_num+1}.png"
            
            # Upload the image to the mark schemes bucket
            public_url = upload_to_supabase_storage(img_bytes, filename, MARK_SCHEME_BUCKET_NAME)

            if public_url:
                question_map[current_question_number].append(public_url)
    
    # After processing all pages, update the database
    for question_num, img_links in question_map.items():
        metadata = {
            "question_number": question_num,
            "paper_code": paper_code,
            "paper_year": year,
            "session": session,
            "component": component,
            "answer_img": img_links,  # Store the list of mark scheme page images
        }
        update_question_with_mark_scheme(metadata)

    return {"message": "Mark scheme upload process complete"}
