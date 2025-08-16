import fitz
import os

PAPER_DIR = "answers"

def inspect_mark_scheme(filename):
    filepath = os.path.join(PAPER_DIR, filename)
    doc = fitz.open(filepath)
    print(f"📄 Inspecting: {filename} | Total pages: {doc.page_count}")

    # Skip first 5 pages (0-based), start from page 6
    for page_num in range(5, doc.page_count):
        page = doc.load_page(page_num)
        text = page.get_text("text")  # plain text
        lines = text.splitlines()
        
        print("\n" + "="*40)
        print(f"📄 Page {page_num+1}")
        print("="*40)
        
        # Print first 25 lines (to avoid overwhelming output)
        for i, line in enumerate(lines[:25]):
            print(f"{i+1:02d}: {line.strip()}")
        
        if len(lines) > 25:
            print("... [truncated] ...")

if __name__ == "__main__":
    inspect_mark_scheme("9709_S24_ms_32.pdf")  # change filename if needed