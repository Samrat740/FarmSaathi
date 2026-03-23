from fastapi import APIRouter
from app.services.market_prices import get_market_prices
from app.services.product_recommendation import router as supplies_router

router = APIRouter()

# Adds GET /market/supplies?crop=Rice
router.include_router(supplies_router)

@router.get("/prices/{state}")
def prices(state: str):
    return get_market_prices(state)