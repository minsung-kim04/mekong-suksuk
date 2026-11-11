function makeWeatherUrl() {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: "10.475",
    longitude: "105.158",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation_probability,precipitation,rain",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max",
    forecast_days: "7",
    timezone: "Asia/Ho_Chi_Minh",
  }).toString();
  return url.toString();
}

function makeHistoryUrl(days) {
  const localNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const endDate = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), localNow.getUTCDate() - 1));
  const startDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() - (days - 1)));
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.search = new URLSearchParams({
    latitude: "10.475",
    longitude: "105.158",
    start_date: startDate.toISOString().slice(0, 10),
    end_date: endDate.toISOString().slice(0, 10),
    hourly: "temperature_2m,relative_humidity_2m,precipitation,weather_code",
    timezone: "Asia/Ho_Chi_Minh",
  }).toString();
  return { url: url.toString(), start: startDate.toISOString().slice(0, 10), end: endDate.toISOString().slice(0, 10) };
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "cache-control": "no-cache", "user-agent": "ChauPhuFarmerDashboard/1.0" },
    redirect: "follow",
  });
  const body = await response.text();
  if (!response.ok) throw new Error("Weather provider returned " + response.status);
  return JSON.parse(body);
}

module.exports = { makeWeatherUrl, makeHistoryUrl, getJson };
