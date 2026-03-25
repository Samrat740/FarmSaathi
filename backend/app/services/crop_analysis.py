import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
from app.services.recommendation import get_recommendations
# from keras.models import load_model
from tensorflow.keras.models import load_model
# -----------------------------
# Load Model (once)
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.h5")
model = tf.keras.models.load_model(MODEL_PATH)

IMG_SIZE = 224

# ⚠️ MUST match training class order
class_names = [
    "Corn_(maize)___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___healthy"
]

# -----------------------------
# 🔥 Human-friendly mapping
# -----------------------------
def simplify_disease(disease):
    mapping = {
        "Tomato___Early_blight": {
            "title": "Leaf infection (fungus)",
            "cause": "Fungal infection in warm and humid conditions",
            "reason": "Happens due to moisture and poor airflow"
        },
        "Tomato___Late_blight": {
            "title": "Severe leaf rot (fungus)",
            "cause": "Fast-spreading fungal disease in wet conditions",
            "reason": "Often caused by excess water or rainy weather"
        },
        "Tomato___healthy": {
            "title": "Plant is healthy",
            "cause": "No disease detected",
            "reason": "Plant growth is normal"
        },
        "Potato___Early_blight": {
            "title": "Brown leaf spots (fungus)",
            "cause": "Fungal infection in warm weather",
            "reason": "Occurs due to moisture and aging leaves"
        },
        "Potato___Late_blight": {
            "title": "Leaf rotting disease",
            "cause": "Fungal infection in very wet conditions",
            "reason": "Caused by overwatering or heavy rain"
        },
        "Corn_(maize)___healthy": {
            "title": "Crop is healthy",
            "cause": "No infection detected",
            "reason": "Growth is normal"
        }
    }

    return mapping.get(disease, {
        "title": "Plant issue detected",
        "cause": "Unknown cause",
        "reason": "Please monitor plant condition"
    })


# -----------------------------
# Main Function
# -----------------------------
def analyze_crop_image(image_bytes):
    try:
        # Convert image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = image.resize((IMG_SIZE, IMG_SIZE))
        image = np.array(image) / 255.0
        image = np.expand_dims(image, axis=0)

        # Prediction
        preds = model.predict(image)
        class_index = int(np.argmax(preds))
        confidence = float(np.max(preds))

        raw_disease = class_names[class_index]
        info = simplify_disease(raw_disease)

        # ⚠️ Low confidence handling
        if confidence < 0.60:
            return {
                "success": True,
                "disease": info["title"],
                "cause": info["cause"],
                "reason": info["reason"],
                "raw_disease": raw_disease,
                "confidence": round(confidence * 100, 2),
                "message": "Low confidence prediction. Please upload a clearer leaf image."
            }

        # -----------------------------
        # Get AI Recommendations
        # -----------------------------
        recommendations = get_recommendations(raw_disease)

        return {
            "success": True,
            "disease": info["title"],        # ✅ user-friendly
            "cause": info["cause"],          # ✅ why it happened
            "reason": info["reason"],        # ✅ simple explanation
            "raw_disease": raw_disease,      # ✅ for system use
            "confidence": round(confidence * 100, 2),
            "recommendations": recommendations
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }