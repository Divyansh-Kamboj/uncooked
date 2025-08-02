import re

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

# === SAMPLE GEMINI RESPONSE ===
sample_response = """
difficulty = Medium
topic = Algebra
ai_explanation = (b) To solve 2x - 3a < |x - 2a|, consider two cases: Case 1: x - 2a ≥ 0, which means x ≥ 2a.  The inequality becomes 2x - 3a < x - 2a, simplifying to x < a. Since x must also be ≥ 2a, there are no solutions in this case. Case 2: x - 2a < 0, meaning x < 2a. The inequality becomes 2x - 3a < -(x - 2a), which simplifies to 3x < 5a, or x < (5/3)a. Combining this with x < 2a, the solution is x < (5/3)a. Therefore, the solution to the inequality is x < (5/3)a.
"""

# === TEST ===
explanation, topic, difficulty = extract_fields(sample_response)

print("✅ Extracted Fields:")
print("Difficulty:", difficulty)
print("Topic:", topic)
print("Explanation:", explanation)
