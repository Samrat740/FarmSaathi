from fastapi import APIRouter
from app.services.weather_services import get_weather_by_coords, get_forecast_by_coords
from app.services.crop_recommendation import recommend_crop
from app.services.scheme_scraper import get_schemes

router = APIRouter()


@router.get("/")
def farmer_home():
    return {"message": "Farmer API working"}


# Common dashboard data
@router.get("/dashboard")
def dashboard(lat: float, lon: float):

    weather = get_weather_by_coords(lat, lon)

    forecast = get_forecast_by_coords(lat, lon)

    crop = recommend_crop(weather)

    return {
        "location": weather["city"],
        "weather": weather,
        "forecast": forecast,
        "recommended_crop": crop
    }


# Schemes loaded only when needed
@router.get("/schemes")
def schemes():
    return get_schemes()