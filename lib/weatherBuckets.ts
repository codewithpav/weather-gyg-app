// Maps a raw OpenWeather "current weather" response onto the content taxonomy.
import type { Condition, TempBand, TimeOfDay } from "./content/types";

export interface WeatherContext {
  tempBand: TempBand;
  condition: Condition;
  timeOfDay: TimeOfDay;
  localHour: number;
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  description: string;
  humidity: number;
  iconUrl: string;
}

export function tempBandFromFeelsLike(feelsLike: number): TempBand {
  if (feelsLike < 0) return "freezing";
  if (feelsLike < 8) return "cold";
  if (feelsLike < 18) return "mild";
  if (feelsLike < 27) return "warm";
  return "hot";
}

// OpenWeather condition ids: https://openweathermap.org/weather-conditions
// 2xx thunderstorm, 3xx drizzle, 5xx rain, 6xx snow, 7xx atmosphere,
// 800 clear, 801-804 clouds.
export function conditionFromCode(id: number): Condition {
  if (id >= 200 && id < 600) return "rain";
  if (id >= 600 && id < 700) return "snow";
  if (id === 800 || id === 801 || id === 802) return "clear";
  return "clouds";
}

// City-local time of day via the OpenWeather `timezone` UTC offset (seconds).
export function timeOfDayFromOffset(timezoneOffsetSeconds: number, now = new Date()): {
  timeOfDay: TimeOfDay;
  localHour: number;
} {
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60_000;
  const local = new Date(utcMillis + timezoneOffsetSeconds * 1000);
  const hour = local.getHours();
  let timeOfDay: TimeOfDay;
  if (hour >= 5 && hour < 12) timeOfDay = "morning";
  else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
  else if (hour >= 17 && hour < 21) timeOfDay = "evening";
  else timeOfDay = "night";
  return { timeOfDay, localHour: hour };
}

export function deriveContext(owm: any, now = new Date()): WeatherContext {
  const feelsLike = Number(owm?.main?.feels_like ?? owm?.main?.temp ?? 15);
  const conditionId = Number(owm?.weather?.[0]?.id ?? 801);
  const { timeOfDay, localHour } = timeOfDayFromOffset(Number(owm?.timezone ?? 0), now);
  return {
    tempBand: tempBandFromFeelsLike(feelsLike),
    condition: conditionFromCode(conditionId),
    timeOfDay,
    localHour,
    temperature: Number(owm?.main?.temp ?? 0),
    feelsLike,
    windSpeed: Number(owm?.wind?.speed ?? 0),
    description: String(owm?.weather?.[0]?.description ?? "unknown weather"),
    humidity: Number(owm?.main?.humidity ?? 0),
    iconUrl: `https://openweathermap.org/img/wn/${String(owm?.weather?.[0]?.icon ?? "01d")}@2x.png`,
  };
}
