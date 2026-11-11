const { getJson, makeHistoryUrl } = require("../lib/weather");

module.exports = async function weatherHistory(req, res) {
  res.setHeader("cache-control", "no-store, max-age=0");
  res.setHeader("x-content-type-options", "nosniff");
  if (req.method !== "GET") return res.status(405).setHeader("allow", "GET").end("Method not allowed");
  const days = Number(req.query && req.query.days) === 30 ? 30 : 7;
  const archive = makeHistoryUrl(days);
  try {
    const result = await getJson(archive.url);
    return res.status(200).json({
      ...result,
      requestedDays: days,
      archiveStart: archive.start,
      archiveEnd: archive.end,
      source: "Open-Meteo Historical Weather API",
    });
  } catch {
    return res.status(502).json({ error: "historical_weather_connection_failed" });
  }
};
