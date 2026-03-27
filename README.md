<div align="center">

# 🌾 FarmSaathi

### *Your Smart Companion in Farming*

**AI crop insights · Live mandi prices · Smart market tools · Farming lab — all in one place, built for every farmer.**

[![Live App](https://img.shields.io/badge/Live%20App-myfarmsaathi.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://myfarmsaathi.vercel.app/)
[![API](https://img.shields.io/badge/API-farmsaathi.onrender.com-blue?style=for-the-badge&logo=render)](https://farmsaathi.onrender.com)
[![Swagger Docs](https://img.shields.io/badge/Swagger-API%20Docs-85EA2D?style=for-the-badge&logo=swagger)](https://farmsaathi.onrender.com/docs)
[![TypeScript](https://img.shields.io/badge/TypeScript-89.7%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-9.8%25-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)

</div>

---

## 📖 Overview

FarmSaathi is an AI-powered smart farming platform designed to empower Indian farmers with actionable insights at their fingertips. From diagnosing crop diseases with a photo, to buying farm supplies, simulating crop growth, and chatting with an AI farming expert — FarmSaathi brings modern technology to every farmer in a format they can actually use.

---

## ✨ Features

FarmSaathi is organized into three core modules: **Farm**, **Market**, and **Lab**.

---

### 🌿 Farm

#### Crop Disease Analysis
Upload a photo of a diseased crop leaf and get an instant AI-powered diagnosis. The deep learning model — trained on the **PlantVillage dataset** from Kaggle — identifies the crop, detects the disease, and recommends a course of action.

#### Seed Quality Analysis
Evaluate seed quality before sowing using a hybrid computer vision pipeline combining classical image processing with a trained ML classifier (see [AI & ML Models](#-ai--ml-models) for details).

#### Government Schemes
Browse and discover relevant agricultural government schemes, subsidies, and programs — fetched live from the **[Open Government Data (OGD) Platform India](https://data.gov.in/)** — helping farmers easily access financial support and resources they're entitled to.

#### 🤖 Your Kisan (AI Chatbot)
Chat with *Your Kisan*, an AI farming assistant powered by **[Hugging Face](https://huggingface.co/)** that answers questions about crop care, pest control, best practices, weather-based advice, and more — available anytime, in a conversational and farmer-friendly format.

---

### 🛒 Market

#### Live Mandi Prices
Access real-time market (mandi) prices for crops across regions — sourced directly from the **[Open Government Data (OGD) Platform India](https://data.gov.in/)** — so farmers can make informed decisions about when and where to sell their produce.

#### Buy Supplies
- **AI-Recommended Products** — Get personalised recommendations for seeds, fertilizers, pesticides, and farm tools based on your crop and needs.
- **Search & Buy** — Browse and purchase farm supplies on your own using a built-in product search and marketplace.

#### Sell Produce *(Future Scope)*
Farmers will be able to list their produce directly on the platform, connecting them to buyers and reducing dependence on middlemen. This feature is currently under development.

---

### 🔬 Lab

#### Crop Simulator *(Gamified)*
A gamified crop simulation experience where farmers can virtually grow crops, experiment with different conditions, and learn best practices — all without any real-world risk. Makes agricultural learning engaging and intuitive.

#### Soil Health Analyzer
Enter your soil parameters and get a detailed health analysis — including nutrient levels, pH assessment, and actionable recommendations for improving soil quality before planting.

#### Fertilizer Calculator
Input your crop type, field area, and soil data to get precise fertilizer recommendations — reducing wastage, cutting costs, and improving yield through optimal nutrient management.

---

## 🤖 AI & ML Models

### Crop Disease Detection

| Detail | Info |
|--------|------|
| **Model Type** | Deep Learning (CNN-based) |
| **Training Dataset** | [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) (Kaggle) |
| **Capability** | Multi-class crop disease classification from leaf images |
| **Input** | Image of a crop leaf |
| **Output** | Crop type, disease name, confidence score, and recommended action |

The PlantVillage dataset contains 54,000+ images across 38 plant disease classes covering crops like tomato, potato, corn, pepper, apple, and more.

---

### Seed Quality Analysis

A hybrid pipeline combining classical computer vision techniques with a trained ML classifier to evaluate seed viability and quality.

| Technique | Purpose |
|-----------|---------|
| **Laplacian Variance** | Measures image sharpness to detect damaged or deformed seeds |
| **HSV Color Analysis** | Evaluates seed color in Hue-Saturation-Value space to detect discolouration, mold, or immaturity |
| **Contour Feature Extraction** | Analyses seed shape, size, area, perimeter, and aspect ratio for morphological quality assessment |
| **Trained ML Classifier** | Final quality classification trained on a manually curated and labelled seed dataset |

> The seed analysis model was trained on a **manually collected and annotated dataset**, making it well-adapted to real-world seed varieties commonly used in Indian agriculture.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | TypeScript, React |
| **Backend** | Python (FastAPI) |
| **ML / CV** | TensorFlow / PyTorch, OpenCV |
| **AI Chatbot** | Hugging Face |
| **Data Sources** | Open Government Data (OGD) Platform India |
| **Frontend Deployment** | Vercel — [myfarmsaathi.vercel.app](https://myfarmsaathi.vercel.app/) |
| **Backend Deployment** | Render — [farmsaathi.onrender.com](https://farmsaathi.onrender.com) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.9
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/Samrat740/FarmSaathi.git
cd FarmSaathi
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

> Configure your environment variables (API keys, etc.) in a `.env` file before running.

---

## 🌐 Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [myfarmsaathi.vercel.app](https://myfarmsaathi.vercel.app/) |
| **Backend API** | [farmsaathi.onrender.com](https://farmsaathi.onrender.com) |
| **API Docs (Swagger)** | [farmsaathi.onrender.com/docs](https://farmsaathi.onrender.com/docs) |

The backend exposes a fully documented REST API. You can explore and test all endpoints interactively via the Swagger UI at `/docs`.

---

## 📁 Project Structure

```
FarmSaathi/
├── frontend/          # TypeScript/React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── backend/           # Python backend + ML models
│   ├── models/        # Trained ML models
│   ├── routes/        # API endpoints
│   ├── utils/         # CV pipelines (seed analysis)
│   └── app.py
└── .gitignore
```

---

## 🗺️ Roadmap

- [x] Crop disease analysis (PlantVillage deep learning model)
- [x] Seed quality analysis (CV pipeline + trained model)
- [x] Live mandi prices (OGD Platform India)
- [x] Buy supplies (AI-recommended + search)
- [x] Government schemes browser (OGD Platform India)
- [x] Your Kisan AI chatbot (Hugging Face)
- [x] Soil health analyzer
- [x] Fertilizer calculator
- [x] Gamified crop simulator
- [x] Mobile app
- [ ] Sell produce marketplace *(in progress)*
- [ ] Multilingual support

---

<div align="center">

Made with ❤️ for Indian farmers

*FarmSaathi — because every farmer deserves smart tools.*

</div>