import requests
from openai import OpenAI
import os

API_KEY = "8b395440ffba6932d07551d39b17eeb1"
city = ("London")
url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
data = requests.get(url).json()
print(f"{data['name']}: {data['main']['temp']}°C, {data['weather'][0]['description']}")

# ✅ The client automatically reads your OPENAI_API_KEY from the environment
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Example static weather data (you can replace this with API output later)
weather_data = {
    "city": "London",
    "temp_c": 18,
    "conditions": "light rain",
    "aqi": "Moderate"
}

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
"""

# 🚀 Send to OpenAI
response = client.chat.completions.create(
    model="gpt-4o-mini",    # fast and cost-effective model
    messages=[
        {"role": "system", "content": "You are a helpful travel assistant."},
        {"role": "user", "content": prompt}
    ],
    temperature=0.6         # adds variety but keeps it stable
)

# 🖨️ Display result
reply = response.choices[0].message.content
print("\n=== AI Travel Suggestions ===\n")
print(reply)