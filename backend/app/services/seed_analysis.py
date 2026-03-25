import os
import numpy as np
import joblib
import tempfile

from app.services.seed_recommendation import get_seed_recommendation
from app.services.feature_extractor import extract_features

# -----------------------------
# Load Model (FIXED PATH)
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
# 🚀 Main Function (UPDATED)
# -----------------------------
def analyze_seed_image(image_bytes):
    try:
        # ✅ Use temp file (better than fixed file name)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(image_bytes)
            temp_path = tmp.name

        # Extract features
        features = extract_features(temp_path)

        # Clean up temp file
        os.remove(temp_path)

        # ❌ Safety check
        if features is None:
            return {
                "success": False,
                "error": "Invalid or unreadable image"
            }

        features = features.reshape(1, -1)

        # Prediction
        prediction = model.predict(features)[0]

        info = simplify_seed_quality(prediction)

        # 🔥 AI Recommendation
        try:
            recommendations = get_seed_recommendation(prediction)
        except Exception:
            recommendations = {
                "message": f"Basic advice for {prediction}",
                "tips": ["Use good quality seeds", "Ensure proper soil conditions"]
            }

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