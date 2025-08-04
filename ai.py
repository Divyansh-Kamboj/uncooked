import os
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
    "Pure 1": """You're an expert tutor for Cambridge A Level Mathematics, Pure Mathematics 1 (Paper 1). Use the following topics:

1.1 Quadratics
1.2 Functions
1.3 Coordinate geometry
1.4 Circular measure
1.5 Trigonometry
1.6 Series
1.7 Differentiation
1.8 Integration

Respond in this exact format:
difficulty = "Easy" or "Medium" or "Hard"
topic = "<topic from the syllabus above>"
ai_explanation = "<step-by-step explanation in a single string>"
""",

    "Pure 3": """You're an expert tutor for Cambridge A Level Mathematics, Pure Mathematics 3 (Paper 3). Use the following topics:

3.1 Algebra
3.2 Logarithmic and exponential functions
3.3 Trigonometry
3.4 Differentiation
3.5 Integration
3.6 Numerical solution of equations
3.7 Vectors
3.8 Differential equations
3.9 Complex numbers

Respond in this exact format:
difficulty = "Easy" or "Medium" or "Hard"
topic = "<topic from the syllabus above>"
ai_explanation = "<step-by-step explanation in a single string>"
""",

    "Mechanics": """You're an expert tutor for Cambridge A Level Mathematics, Mechanics (Paper 4). Use the following topics:

4.1 Forces and equilibrium
4.2 Kinematics of motion in a straight line
4.3 Momentum
4.4 Newton’s laws of motion
4.5 Energy, work and power

Respond in this exact format:
difficulty = "Easy" or "Medium" or "Hard"
topic = "<topic from the syllabus above>"
ai_explanation = "<step-by-step explanation in a single string>"
""",

    "Stats 1": """You're an expert tutor for Cambridge A Level Mathematics, Statistics 1 (Paper 5). Use the following topics:

5.1 Representation of data
5.2 Permutations and combinations
5.3 Probability
5.4 Discrete random variables
5.5 The normal distribution

Respond in this exact format:
difficulty = "Easy" or "Medium" or "Hard"
topic = "<topic from the syllabus above>"
ai_explanation = "<step-by-step explanation in a single string>"
""",

    "Stats 2": """You're an expert tutor for Cambridge A Level Mathematics, Statistics 2 (Paper 6). Use the following topics:

6.1 The Poisson distribution
6.2 Linear combinations of random variables
6.3 Continuous random variables
6.4 Sampling and estimation
6.5 Hypothesis tests

Respond in this exact format:
difficulty = "Easy" or "Medium" or "Hard"
topic = "<topic from the syllabus above>"
ai_explanation = "<step-by-step explanation in a single string>"
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
    difficulty = topic = explanation = None
    for line in text.strip().splitlines():
        if line.lower().startswith("difficulty"):
            difficulty = line.split("=", 1)[-1].strip().strip('"')
        elif line.lower().startswith("topic"):
            topic = line.split("=", 1)[-1].strip().strip('"')
        elif line.lower().startswith("ai_explanation"):
            explanation = line.split("=", 1)[-1].strip().strip('"')
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
    model = genai.GenerativeModel("gemini-1.5-pro")
    chat = model.start_chat()
    chat.send_message(component_prompts[component])

    for q in subject_questions:
        q_id = q["id"]
        img_urls = q["question_img"]
        print(f"\n🔍 Processing Q{q['question_number']} (row {q_id})")

        image_data = []
        for url in img_urls:
            img = get_image_bytes(url)
            if img:
                image_data.append({"mime_type": "image/png", "data": img})

        if not image_data:
            print("⚠️ No image found, skipping")
            continue

        try:
            response = chat.send_message(["Here is a question image for analysis:"] + image_data)
            text = response.text
            explanation, topic, difficulty = extract_fields(text)

            if explanation:
                update_question(q_id, explanation, topic, difficulty)
            else:
                print(f"⚠️ Could not extract explanation for row {q_id}")

            # Cost tracking
            question_cost = len(image_data) * COST_PER_IMAGE_USD
            total_cost += question_cost
            print(f"💵 Cost for Q{q['question_number']}: ${question_cost:.4f}")
            print(f"💰 Running total: ${total_cost:.4f}")

        except Exception as e:
            print(f"❌ Error processing row {q_id}: {e}")

print(f"\n✅ Done. Total estimated Gemini API cost: ${total_cost:.4f}")
