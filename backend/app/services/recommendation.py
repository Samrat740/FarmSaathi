import requests
import os
import json
from dotenv import load_dotenv
load_dotenv()

# 🔹 API Config
HF_API_KEY = os.getenv("HF_API_KEY")
HF_URL = "https://router.huggingface.co/v1/chat/completions"
HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"


def get_recommendations(disease):
    try:
        prompt = f"""
You are an agricultural expert helping farmers.

Disease: {disease}

Give response in STRICT JSON format:
{{
  "prevention": ["point1", "point2"],
  "treatment": ["point1", "point2"],
  "fertilizers": ["point1", "point2"],
  "pesticides": ["point1", "point2"]
}}

Rules:
- Always fill all fields
- If plant is healthy, give maintenance advice
- Keep it simple
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

        # ❌ If API fails
        if response.status_code != 200:
            print("API ERROR:", response.status_code, response.text)
            print("HF KEY:", HF_API_KEY)
            return basic_recommendation(disease)

        data = response.json()

        # 🔹 Extract AI text safely
        content = data["choices"][0]["message"]["content"]


        # 🔥 Extract JSON from messy text
        start = content.find("{")
        end = content.rfind("}") + 1

        if start != -1 and end != -1:
            json_text = content[start:end]

            try:
                return json.loads(json_text)
            except Exception as e:
                print("JSON PARSE ERROR:", e)
                return basic_recommendation(disease)

        # If no JSON found
        return basic_recommendation(disease)

    except Exception as e:
        print("FINAL ERROR:", e)
        return basic_recommendation(disease)


# -----------------------------
# 🔥 Fallback (Always works)
# -----------------------------
def basic_recommendation(disease):
    return {
        "message": f"AI recommendation unavailable. Please consult local agricultural experts."
    }