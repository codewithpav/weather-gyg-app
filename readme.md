# Weather + GetYourGuide (Streamlit)
Type a city → show weather + a GetYourGuide city widget.

## Run locally
pip install -r requirements.txt
streamlit run app.py

#  AI Weather App — Ultra High-Level Steps (No Code)

> **Goal:** Help a beginner go from zero → working app using the *easy path* (PyCharm + GUI).  
> Keep it simple; you can teach the deeper parts later.

---

## 0) Prerequisites
- Install **Python 3.10+**
- Install **PyCharm** (Community or Professional)
- (Optional) Install **Git** — PyCharm can handle most Git tasks anyway

---

## 1) Get Weather Data (OpenWeatherMap)
1. Create a free account on [OpenWeatherMap](https://openweathermap.org/api)
2. Generate your **API key**
3. Explore the **Current Weather API** and look at an example JSON response  
   (notice fields like city, temperature, description, humidity)
4. Understand that your app will call this API and use those details

---

## 2) Get AI Suggestions (OpenAI)
1. Log into [OpenAI](https://platform.openai.com/) and create an **API key**
2. Set up **billing** so your requests work reliably
3. Plan a simple prompt:  
   → Include real weather data (temperature + description)  
   → Ask for 2–3 short, creative activity suggestions

---

## 3) Prepare Your Project
1. **Clone** your GitHub repo in PyCharm (`File → Get from Version Control`)
2. **Sign in to GitHub** inside PyCharm for easy commits and pushes
3. Create a `.env` file and store your keys there:  
   - `OPENAI_API_KEY`  
   - `OPENWEATHER_API_KEY`
4. Make sure `.env` is **ignored** by Git (`.gitignore` should include `.env`)

---

## 4) Install Dependencies
1. Open the project in PyCharm
2. Install dependencies from `requirements.txt`  
   *(or add packages manually: `streamlit`, `python-dotenv`, `requests`, `openai`)*
3. Confirm your **virtual environment** is active in PyCharm

---

## 5) Wire the Flow (Conceptually)
1. **Function A:** Fetch weather from OpenWeatherMap → return temp, description, city  
2. **Function B:** Use that data to craft a short prompt → call OpenAI → return 2–3 activity ideas  
3. **Front End (Streamlit):**  
   - Input a city  
   - Show weather details  
   - Show AI-generated suggestions

*(You’ll teach detailed prompt engineering, structure, and error handling later.)*

---

## 6) Run It Locally
1. In PyCharm, run your Streamlit app (or use the terminal command `streamlit run app.py`)
2. Enter a city → you should see:  
   - Weather info (e.g., “Sunny, 22°C”)  
   - A short list of suggested activities

---

## 7) Make One Tiny Change (Confidence Boost)
1. Edit something visible — a heading, label, or emoji  
2. **Commit & push** in PyCharm with a short message  
3. *(Optional)* Create a new branch and pull request for good Git habits

---

## 8) Deploy the Easy Way (Optional)
1. Go to [Streamlit Community Cloud](https://streamlit.io/cloud)
2. Sign in with GitHub and select your repo + main app file (e.g., `app.py`)
3. Add your API keys under **Secrets / Environment Variables**
4. Click **Deploy** and share your live link 🌍

---

## 9) What to Improve Later (Teaching Hooks)
- Cleaner, structured prompts (JSON output)
- Error handling & rate limiting
- Add 7-day forecast or air quality APIs
- Use caching for faster performance
- PDF export feature
- CI/CD, secrets management, and scaling options

---

### Why This Works
You’re learning **real skills** — APIs, authentication, environment variables, and UI wiring —  
while keeping it simple enough to *finish* and *feel proud*.  
Once it works, you can teach all the “how” and “why” behind the scenes.
