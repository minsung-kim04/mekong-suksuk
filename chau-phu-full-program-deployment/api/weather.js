const { getJson, makeWeatherUrl } = require("../lib/weather");

module.exports = async function weather(req, res) {
  res.setHeader("cache-control", "no-store, max-age=0");
  res.setHeader("x-content-type-options", "nosniff");
  if (req.method !== "GET") return res.status(405).setHeader("allow", "GET").end("Method not allowed");
  try {
    return res.status(200).json(await getJson(makeWeatherUrl()));
  } catch {
    return res.status(502).json({ error: "weather_connection_failed" });
  }
};
