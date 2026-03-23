from fastapi import APIRouter

# No prefix here — main.py already mounts this under /market
# Final endpoint: GET /market/supplies?crop=Rice
router = APIRouter(tags=["market"])

# ── Product catalogue ─────────────────────────────────────────────────────────
# Matches the 3 crops your recommend_crop() returns: Wheat, Rice, Millet
# Each crop has Seeds → Fertilizer → Pesticide

PRODUCTS: dict[str, list[dict]] = {
    "wheat": [
        {
            "name": "HD-2967 Wheat Seeds",
            "category": "Seeds",
            "price": "₹280",
            "emoji": "🌾",
            "flipkart": "https://www.flipkart.com/search?q=HD2967+wheat+seeds",
            "amazon": "https://www.amazon.in/s?k=HD2967+wheat+seeds",
        },
        {
            "name": "Urea Fertilizer 50 kg",
            "category": "Fertilizer",
            "price": "₹900",
            "emoji": "🧪",
            "flipkart": "https://www.flipkart.com/search?q=urea+fertilizer+50kg",
            "amazon": "https://www.amazon.in/s?k=urea+fertilizer+50kg",
        },
        {
            "name": "Mancozeb Fungicide",
            "category": "Pesticide",
            "price": "₹380",
            "emoji": "🛡️",
            "flipkart": "https://www.flipkart.com/search?q=mancozeb+fungicide+wheat",
            "amazon": "https://www.amazon.in/s?k=mancozeb+fungicide",
        },
    ],
    "rice": [
        {
            "name": "IR64 Rice Seeds",
            "category": "Seeds",
            "price": "₹320",
            "emoji": "🌾",
            "flipkart": "https://www.flipkart.com/search?q=IR64+rice+seeds",
            "amazon": "https://www.amazon.in/s?k=IR64+rice+seeds",
        },
        {
            "name": "DAP Fertilizer 50 kg",
            "category": "Fertilizer",
            "price": "₹1,200",
            "emoji": "🧪",
            "flipkart": "https://www.flipkart.com/search?q=DAP+fertilizer+50kg",
            "amazon": "https://www.amazon.in/s?k=DAP+fertilizer",
        },
        {
            "name": "Chlorpyrifos Pesticide",
            "category": "Pesticide",
            "price": "₹540",
            "emoji": "🛡️",
            "flipkart": "https://www.flipkart.com/search?q=chlorpyrifos+pesticide+rice",
            "amazon": "https://www.amazon.in/s?k=chlorpyrifos+pesticide",
        },
    ],
    "millet": [
        {
            "name": "HHB-67 Pearl Millet Seeds",
            "category": "Seeds",
            "price": "₹240",
            "emoji": "🌿",
            "flipkart": "https://www.flipkart.com/search?q=pearl+millet+seeds+HHB67",
            "amazon": "https://www.amazon.in/s?k=pearl+millet+seeds",
        },
        {
            "name": "NPK 10-26-26 Fertilizer",
            "category": "Fertilizer",
            "price": "₹980",
            "emoji": "🧪",
            "flipkart": "https://www.flipkart.com/search?q=NPK+10+26+26+fertilizer",
            "amazon": "https://www.amazon.in/s?k=NPK+10-26-26+fertilizer",
        },
        {
            "name": "Carbendazim Fungicide",
            "category": "Pesticide",
            "price": "₹310",
            "emoji": "🛡️",
            "flipkart": "https://www.flipkart.com/search?q=carbendazim+fungicide+millet",
            "amazon": "https://www.amazon.in/s?k=carbendazim+fungicide",
        },
    ],
}


# ── Endpoint ──────────────────────────────────────────────────────────────────
# Receives the crop name already decided by recommend_crop() on the weather service.
# Frontend passes ?crop=Rice (case-insensitive).

@router.get("/supplies")
def get_supplies(crop: str):
    """
    GET /market/supplies?crop=Rice

    Returns 3 curated product cards (seeds, fertilizer, pesticide)
    for the crop already recommended by the weather/farm service.
    """
    key = crop.strip().lower()
    products = PRODUCTS.get(key, [])
    return {
        "crop": crop,
        "products": products,
    }