from fastapi import APIRouter
from app.services.chatbot_service import ask_kisan_ai

router = APIRouter()

@router.post("/ask")
def ask(message: str, lat: float, lon: float):

    answer = ask_kisan_ai(message, lat, lon)

    return {
        "question": message,
        "answer": answer
    }