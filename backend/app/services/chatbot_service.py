import requests
import os

from app.services.weather_services import get_weather_by_coords
from app.services.crop_recommendation import recommend_crop

# 🔹 Hugging Face model
HF_MODEL = "meta-llama/Meta-Llama-3-8B-Instruct"

# 🔹 API Key (from .env)
HF_API_KEY = os.getenv("HF_API_KEY")

# 🔹 Endpoint
HF_URL = "https://router.huggingface.co/v1/chat/completions"


def ask_kisan_ai(message, lat, lon):
    try:
        # ❌ If API key missing → fail early
        if not HF_API_KEY:
            print("ERROR: HF_API_KEY not found in .env")
            return "Server configuration error. Please try later."

        # 🌦️ Get weather data
        weather = get_weather_by_coords(lat, lon)

        # 🌱 Crop recommendation
        crop = recommend_crop(weather)

        # 🤖 System prompt
        system_prompt = f"""
You are an AI agricultural assistant helping Indian farmers.

Current farmer location: {weather.get('city', 'Unknown')}
Temperature: {weather.get('temperature', 'N/A')}°C
Humidity: {weather.get('humidity', 'N/A')}%

Recommended crop based on weather: {crop}

Your job is to give simple, practical farming advice.

RULES:
- Answer in simple English.
- Provide practical suggestions farmers can follow.
- Keep answers concise.
- If the question is unrelated to farming, reply:
  "I can only help with farming and agriculture related questions."
"""

        messages = [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": message}
        ]

        payload = {
            "model": HF_MODEL,
            "messages": messages,
            "max_tokens": 500,
            "temperature": 0.6
        }

        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json"
        }

        # 🚀 API call
        response = requests.post(HF_URL, headers=headers, json=payload, timeout=20)

        # ❌ Handle bad response
        if response.status_code != 200:
            print("HF ERROR:", response.status_code, response.text)
            return "AI service temporarily unavailable."

        data = response.json()

        # ✅ Safe extraction
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]

        return "No response from AI."

    except requests.exceptions.Timeout:
        return "AI service timeout. Please try again."

    except Exception as e:
        print("Chatbot Error:", str(e))
        return "Something went wrong while generating the response."