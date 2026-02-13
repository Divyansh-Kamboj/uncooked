import fitz  # PyMuPDF
import os

PAPER_DIR = "answers"
FILENAME = "9709_S24_ms_32.pdf"
OUTPUT_FILE = "ms_text_dump.txt"

def dump_pdf_text(filepath, output_file):
    doc = fitz.open(filepath)
    with open(output_file, "w", encoding="utf-8") as f:
        for page_num in range(5, doc.page_count):  # skip first 5 pages
            page = doc.load_page(page_num)
            text = page.get_text("text")

            f.write("\n" + "="*40 + "\n")
            f.write(f"📄 Page {page_num+1}\n")
            f.write("="*40 + "\n")
            f.write(text)
            f.write("\n")

if __name__ == "__main__":
    filepath = os.path.join(PAPER_DIR, FILENAME)
    dump_pdf_text(filepath, OUTPUT_FILE)
    print(f"✅ Text dump written to {OUTPUT_FILE}")
