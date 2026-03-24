from fastapi import APIRouter, UploadFile, File
from app.services.seed_analysis import analyze_seed_image

router = APIRouter()

@router.post("/analyze-seed")
async def analyze_seed(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = analyze_seed_image(image_bytes)
    return result