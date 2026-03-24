from fastapi import APIRouter, UploadFile, File
from app.services.crop_analysis import analyze_crop_image

router = APIRouter()

@router.post("/analyze-crop")
async def analyze_crop(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = analyze_crop_image(image_bytes)
    return result