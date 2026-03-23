def recommend_crop(weather):

    temp = weather.get("temperature", 25)

    if temp < 20:
        return "Wheat"

    elif temp < 30:
        return "Rice"

    else:
        return "Millet"