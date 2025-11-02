import streamlit as st

from itinerary import weathercheck, genItinerary
from affiliate import city_to_id, gyg_banner

st.set_page_config(page_title="Trip Planner", page_icon="🗺️", layout="centered")
st.title("AI Trip Planner 🗺️")

st.caption("Type a city, get live weather and an AI-suggested mini itinerary.")

city = st.text_input("Enter a city name:")


if st.button("Get Itinerary"):
    if city:

        weather = weathercheck(city)

        # Example: display weather title + icon side-by-side
        col1, col2 = st.columns([1, 1])  # wider text, smaller image column

        with col1:
            st.subheader(f"Weather in {city}")

        with col2:
            icon_url = f"https://openweathermap.org/img/wn/{weather['icon']}@2x.png"
            st.image(icon_url, width=60)

        st.write(f"It's currently **{weather['temp_c']}°C** in {city}, feeling like **{weather['feels_like']}°C**, "
                 f"with **{weather['conditions']}**.")

        with st.spinner("Thinking of some ideas based on the current forcast..."):
            reply = genItinerary(city, weather)
        # 💬 Format into a nice sentence

        st.write(reply)

        gyg_banner(city)


    else:
        st.warning("Please enter a city name first.")

st.markdown("""
---
<div style='text-align: center; font-size: 0.9em; color: gray;'>
Built by Pav · Made to help others learn Python, APIs, Gen AI, Prompt Engineering & Streamlit
</div>
""", unsafe_allow_html=True)