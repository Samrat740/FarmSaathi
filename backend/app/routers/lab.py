from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def lab_home():
    return {"message": "Lab API working"}