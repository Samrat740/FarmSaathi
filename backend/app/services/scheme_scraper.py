import requests
import os

GOV_API_KEY = os.getenv("GOV_API_KEY")
RESOURCE_ID = "9afdf346-16d7-4f17-a2e3-684540c59a77"

def get_schemes():
    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"

    params = {
        "api-key": GOV_API_KEY,
        "format": "json",
        "limit": 10
    }

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)

        # Raise error for bad status (4xx, 5xx)
        response.raise_for_status()

        data = response.json()

        schemes = []

        for item in data.get("records", []):
            schemes.append({
                "scheme_name": item.get("name_of_mission___scheme"),
                "serial_number": item.get("s_no_"),
                "document_id": item.get("document_id")
            })

        return schemes

    except requests.exceptions.RequestException as e:
        print("API Error:", e)
        return {"error": "Failed to fetch schemes"}