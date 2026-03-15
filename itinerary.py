import os
import requests
from openai import OpenAI, OpenAIError


def weathercheck(city):
    """Fetch current weather for a city from OpenWeatherMap."""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        raise RuntimeError("OPENWEATHER_API_KEY is not set. Please add it to your environment or .env file.")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": api_key, "units": "metric"}

    try:
        response = requests.get(url, params=params, timeout=10)
    except requests.RequestException as exc:
        raise RuntimeError(f"Unable to reach the weather service right now. Please try again.") from exc

    # If OpenWeather returns an error JSON (e.g. city not found), surface that to the user
    if response.status_code != 200:
        try:
            payload = response.json()
            msg = payload.get("message") or "Unknown error from weather service."
        except ValueError:
            msg = f"HTTP {response.status_code} from weather service."
        raise RuntimeError(f"Unable to fetch weather for '{city}': {msg}")

    data = response.json()

    try:
        weather_data = {
            "city": city,
            "temp_c": data["main"]["temp"],
            "conditions": data["weather"][0]["description"],
            "aqi": "moderate",
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "icon": data["weather"][0]["icon"],
        }
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError("Weather data from the API was in an unexpected format.") from exc

    return weather_data


def genItinerary(city, weather):
    """Generate activity ideas from OpenAI using weather data."""

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set. Please add it to your environment or .env file.")

    client = OpenAI(api_key=api_key)

    # Example static weather data (you can replace this with API output later)
    weather_data = weather

    # 💬 Prompt template
    prompt = f"""
    You are a friendly travel assistant.
    
    Based on this weather data:
    City: {weather_data['city']}
    Temperature: {weather_data['temp_c']}°C
    Condition: {weather_data['conditions']}
    Air Quality: {weather_data['aqi']}
    
    Suggest 3 short activities suitable for the day.
    Format as a numbered list.
    Start immediately with "1." — do not include any introductions or summaries.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful travel assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.6,
        )
    except OpenAIError as exc:
        raise RuntimeError("There was a problem generating AI suggestions. Please try again.") from exc

    reply = response.choices[0].message.content
    return reply
