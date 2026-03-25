import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from app.services.feature_extractor import extract_features

# -----------------------------
# Dataset Path (FIXED)
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

X = []
y = []

# -----------------------------
# Load Dataset
# -----------------------------
for label in os.listdir(DATASET_DIR):
    class_dir = os.path.join(DATASET_DIR, label)

    if not os.path.isdir(class_dir):
        continue

    for img_file in os.listdir(class_dir):
        img_path = os.path.join(class_dir, img_file)

        try:
            features = extract_features(img_path)

            if features is not None:
                X.append(features)
                y.append(label)

        except Exception as e:
            print(f"❌ Error processing {img_file}: {e}")

X = np.array(X)
y = np.array(y)

print(f"✅ Dataset shape: {X.shape}, Labels: {set(y)}")

# -----------------------------
# Train Model
# -----------------------------
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X, y)

# -----------------------------
# Save Model
# -----------------------------
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "seed_quality_model.pkl")

joblib.dump(clf, MODEL_PATH, compress=3)

print(f"🎉 Model saved at {MODEL_PATH}")