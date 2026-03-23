from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import farmer, market, lab, chatbot

app = FastAPI(title="FarmSaathi API")

# ✅ CORS configuration (UPDATED for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",              # local frontend
        "https://myfarmsaathi.vercel.app"    # 🔥 replace with your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Routers
app.include_router(farmer.router, prefix="/farmer")
app.include_router(market.router, prefix="/market")
app.include_router(lab.router, prefix="/lab")
app.include_router(chatbot.router, prefix="/chatbot")

# ✅ Root (allow HEAD for UptimeRobot)
@app.api_route("/", methods=["GET", "HEAD"])
def home():
    return {"message": "FarmSaathi Backend Running"}

# ✅ Health endpoint (BEST PRACTICE 🔥)
@app.get("/health")
def health():
    return {"status": "ok"}