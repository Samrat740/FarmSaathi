from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import farmer, market, lab, chatbot

app = FastAPI(title="FarmSaathi API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(farmer.router, prefix="/farmer")
app.include_router(market.router, prefix="/market")
app.include_router(lab.router, prefix="/lab")
app.include_router(chatbot.router, prefix="/chatbot")

@app.get("/")
def home():
    return {"message": "FarmSaathi Backend Running"}