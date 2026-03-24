import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()
HF_API_KEY = os.getenv("HF_API_KEY")
HF_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"


def get_seed_recommendation(quality):
    try:
        prompt = f"""
You are an agricultural expert.

Seed Quality: {quality}

Give response in JSON:
{{
  "usage": ["..."],
  "storage": ["..."],
  "improvement": ["..."]
}}

Rules:
- Simple language
- Practical advice
- No explanation outside JSON
"""

        response = requests.post(
            HF_URL,
            headers={
                "Authorization": f"Bearer {HF_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": HF_MODEL,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }
        )

        data = response.json()
        content = data["choices"][0]["message"]["content"]

        # Extract JSON
        start = content.find("{")
        end = content.rfind("}") + 1

        if start != -1 and end != -1:
            return json.loads(content[start:end])

        return basic_seed_advice(quality)

    except:
        return basic_seed_advice(quality)


# -----------------------------
# 🔥 Fallback
# -----------------------------
def basic_seed_advice(quality):
    return {
        "message": f"AI recommendation unavailable. Please consult local agricultural experts."
    }