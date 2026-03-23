import requests

API_KEY = "579b464db66ec23bdd000001dbfa1be0b50c498450095ba892f5d979"

RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"


def get_market_prices(state):

    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 10,
        "filters[state]": state
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return {"error": "Government API not responding"}

    try:
        data = response.json()
    except:
        return {"error": "Invalid response from API"}

    prices = []

    for item in data.get("records", []):

        prices.append({
            "commodity": item.get("commodity"),
            "market": item.get("market"),
            "district": item.get("district"),
            "arrival_date": item.get("arrival_date"),
            "modal_price": item.get("modal_price")
        })

    return prices