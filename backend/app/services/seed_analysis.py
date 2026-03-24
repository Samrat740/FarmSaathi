import os
import numpy as np
import joblib
from PIL import Image
import io

from app.services.seed_recommendation import get_seed_recommendation
from app.services.feature_extractor import extract_features

# -----------------------------
# Load Model
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "seed_quality_model.pkl")

model = joblib.load(MODEL_PATH)


# -----------------------------
# 🔥 Human-friendly mapping
# -----------------------------
def simplify_seed_quality(prediction):
    mapping = {
        "Good": {
            "title": "High quality seeds",
            "reason": "Seeds are healthy and suitable for planting",
            "advice": "You can use these seeds for cultivation"
        },
        "Average": {
            "title": "Moderate quality seeds",
            "reason": "Seeds are usable but may not give best yield",
            "advice": "Use with proper care and fertilizers"
        },
        "Bad": {
            "title": "Poor quality seeds",
            "reason": "Seeds may be damaged or unhealthy",
            "advice": "Avoid using these seeds for planting"
        }
    }

    return mapping.get(prediction, {
        "title": "Unknown quality",
        "reason": "Unable to determine seed quality",
        "advice": "Try uploading a clearer image"
    })


# -----------------------------
# 🚀 Main Function
# -----------------------------
def analyze_seed_image(image_bytes):
    try:
        # Save temp image
        temp_path = "temp_seed.png"
        with open(temp_path, "wb") as f:
            f.write(image_bytes)

        # Extract features
        features = extract_features(temp_path).reshape(1, -1)

        # Prediction
        prediction = model.predict(features)[0]

        info = simplify_seed_quality(prediction)

        # 🔥 AI Recommendation
        recommendations = get_seed_recommendation(prediction)

        return {
            "success": True,
            "quality": info["title"],
            "reason": info["reason"],
            "advice": info["advice"],
            "raw_prediction": prediction,
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }