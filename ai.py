import os
import json
import re
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# === Configure Gemini ===
genai.configure(api_key=GEMINI_API_KEY)
COST_PER_IMAGE_USD = 0.00225
total_cost = 0

# === Subject-Specific Prompts ===
component_prompts = {
    "Pure 1": """You are an expert tutor for Cambridge A Level Mathematics, Pure Mathematics 1 (Paper 1).

ONLY use the following list of topics to choose from:
Quadratics  
Functions  
Coordinate geometry  
Circular measure  
Trigonometry  
Series  
Differentiation  
Integration  

Your response MUST follow this exact format — no markdown, no extra notes, no headings:

difficulty = <Easy | Medium | Hard>  
topic = <exact topic name from the list above>
ai_explanation = <step-by-step explanation in plain text>

STRICT RULES:  
- Do NOT include any extra lines, greetings, markdown, or commentary.  
- Do NOT explain what you're doing.  
- DO NOT change the format or add labels or bullets.  
- If unsure about the topic, choose the closest matching topic.
""",

    "Pure 3": """You are an expert tutor for Cambridge A Level Mathematics, Pure Mathematics 3 (Paper 3).

ONLY use the following list of topics to choose from:
Algebra  
Logarithmic and exponential functions  
Trigonometry  
Differentiation  
Integration  
Numerical solution of equations  
Vectors  
Differential equations  
Complex numbers  

Your response MUST follow this exact format — no markdown, no extra notes, no headings:

difficulty = <Easy | Medium | Hard>
topic = <exact topic name from the list above>
ai_explanation = <step-by-step explanation in plain text>

STRICT RULES:  
- Do NOT include any extra lines, greetings, markdown, or commentary.  
- Do NOT explain what you're doing.  
- DO NOT change the format or add labels or bullets.  
- If unsure about the topic, choose the closest matching topic.
""",

    "Mechanics": """You are an expert tutor for Cambridge A Level Mathematics, Mechanics (Paper 4).

ONLY use the following list of topics to choose from:
Forces and equilibrium  
Kinematics of motion in a straight line  
Momentum  
Newton’s laws of motion  
Energy, work and power  

Your response MUST follow this exact format — no markdown, no extra notes, no headings:

difficulty = <Easy | Medium | Hard>  
topic = <exact topic name from the list above>  
ai_explanation = <step-by-step explanation in plain text>

STRICT RULES:  
- Do NOT include any extra lines, greetings, markdown, or commentary.  
- Do NOT explain what you're doing.  
- DO NOT change the format or add labels or bullets.  
- If unsure about the topic, choose the closest matching topic.
""",

    "Stats 1": """You are an expert tutor for Cambridge A Level Mathematics, Statistics 1 (Paper 5).

ONLY use the following list of topics to choose from:
Representation of data  
Permutations and combinations  
Probability  
Discrete random variables  
The normal distribution  

Your response MUST follow this exact format — no markdown, no extra notes, no headings:

difficulty = <Easy | Medium | Hard>  
topic = <exact topic name from the list above>
ai_explanation = <step-by-step explanation in plain text>

STRICT RULES:  
- Do NOT include any extra lines, greetings, markdown, or commentary.  
- Do NOT explain what you're doing.  
- DO NOT change the format or add labels or bullets.  
- If unsure about the topic, choose the closest matching topic.
""",

    "Stats 2": """You are an expert tutor for Cambridge A Level Mathematics, Statistics 2 (Paper 6).

ONLY use the following list of topics to choose from:
The Poisson distribution  
Linear combinations of random variables  
Continuous random variables  
Sampling and estimation  
Hypothesis tests  

Your response MUST follow this exact format — no markdown, no extra notes, no headings:

difficulty = <Easy | Medium | Hard>  
topic = <exact topic name from the list above>  
ai_explanation = <step-by-step explanation in plain text>

STRICT RULES:  
- Do NOT include any extra lines, greetings, markdown, or commentary.  
- Do NOT explain what you're doing.  
- DO NOT change the format or add labels or bullets.  
- If unsure about the topic, choose the closest matching topic.
"""
}


# === Supabase headers ===
db_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def fetch_unprocessed_questions():
    url = f"{SUPABASE_URL}/rest/v1/alevel_math_questions?ai_explanation=is.null"
    r = requests.get(url, headers=db_headers)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"❌ Error fetching questions: {r.text}")
        return []

def get_image_bytes(url):
    r = requests.get(url)
    if r.status_code == 200:
        return r.content
    else:
        print(f"❌ Could not download image: {url}")
        return None

def extract_fields(text):
    print("\n📤 Raw Gemini response:\n", text, "\n")

    difficulty = topic = explanation = None

    # Match: difficulty = Easy/Medium/Hard
    diff_match = re.search(r'difficulty\s*=\s*(Easy|Medium|Hard)', text, re.IGNORECASE)

    # Match: topic = [anything except newline]
    topic_match = re.search(r'topic\s*=\s*(.+)', text, re.IGNORECASE)

    # Match: ai_explanation = [everything until end]
    explain_match = re.search(r'ai_explanation\s*=\s*(.+)', text, re.IGNORECASE | re.DOTALL)

    if diff_match:
        difficulty = diff_match.group(1).strip().capitalize()

    if topic_match:
        topic = topic_match.group(1).strip()

    if explain_match:
        explanation = explain_match.group(1).strip()

    return explanation, topic, difficulty


def update_question(row_id, explanation, topic, difficulty):
    payload = {
        "ai_explanation": explanation,
        "topic": topic,
        "difficulty": difficulty
    }
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/alevel_math_questions?id=eq.{row_id}",
        headers=db_headers,
        json=payload
    )
    if r.status_code in [200, 204]:
        print(f"✅ Updated row {row_id}")
    else:
        print(f"❌ Failed to update row {row_id}: {r.text}")

# === Main Execution ===
questions = fetch_unprocessed_questions()
grouped = defaultdict(list)
for q in questions:
    grouped[q["component"]].append(q)

# === Process each subject ===
for component, subject_questions in grouped.items():
    if component not in component_prompts:
        print(f"⚠️ No prompt defined for: {component}, skipping...")
        continue

    print(f"\n📘 Starting chat session for: {component} ({len(subject_questions)} questions)")
    model = genai.GenerativeModel("gemini-1.5-flash")
    chat = model.start_chat()
    chat.send_message(component_prompts[component])

    for q in subject_questions:
        q_id = q["id"]
        img_urls = json.loads(q["question_img"]) if isinstance(q["question_img"], str) else q["question_img"]
        print(f"\n🔍 Processing Q{q['question_number']} (row {q_id})")

        image_data = []
        for url in img_urls:
            if isinstance(url, str) and url.startswith("http"):
                img = get_image_bytes(url)
                if img:
                    image_data.append({"mime_type": "image/png", "data": img})

        if not image_data:
            print("⚠️ No valid images found, skipping...")
            continue

        try:
            response = chat.send_message(["Here is a question image for analysis:"] + image_data)
            raw_text = response.text
            explanation, topic, difficulty = extract_fields(raw_text)

            if explanation:
                update_question(q_id, explanation, topic, difficulty)
            else:
                print(f"⚠️ Could not extract fields for row {q_id}")

            # Cost tracking
            question_cost = len(image_data) * COST_PER_IMAGE_USD
            total_cost += question_cost
            print(f"💵 Cost for Q{q['question_number']}: ${question_cost:.4f}")
            print(f"💰 Running total: ${total_cost:.4f}")

        except Exception as e:
            print(f"❌ Error processing row {q_id}: {e}")

print(f"\n✅ Done. Total estimated Gemini API cost: ${total_cost:.4f}")
