import json
import streamlit as st

def city_to_id(city):
    # Open and read the JSON file
    with open("gyg_cities.json", "r") as f:
        city_ids = json.load(f)

    # Normalise city name (so 'london' and 'London' both work)
    city = city.strip().title()

    # Return the matching ID
    return city_ids.get(city)


def gyg_banner(city):
    location_id = city_to_id(city)
    if location_id:
        partner_id = "PWRQOQM"
        location_id = city_to_id(city)
        widget_html = f"""
                <div
                  data-gyg-href="https://widget.getyourguide.com/default/city.frame"
                  data-gyg-location-id="{location_id}"
                  data-gyg-locale-code="en-US"
                  data-gyg-widget="city"
                  data-gyg-partner-id="{partner_id}">
                </div>
                <script async defer src="https://widget.getyourguide.com/v2/core.js"></script>
                """
        st.components.v1.html(widget_html, height=450)
    else:
        st.warning("City not fully supported yet.")