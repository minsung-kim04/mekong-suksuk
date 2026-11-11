const { fetchHistory, HISTORY_CSV } = require("../lib/mrc");

module.exports = async function history(req, res) {
  res.setHeader("cache-control", "no-store, max-age=0");
  res.setHeader("x-content-type-options", "nosniff");
  if (req.method !== "GET") return res.status(405).setHeader("allow", "GET").end("Method not allowed");
  try {
    const readings = await fetchHistory();
    return res.status(200).json({ readings, fetchedAt: new Date().toISOString(), source: HISTORY_CSV });
  } catch {
    return res.status(502).json({ error: "google_sheet_history_unavailable" });
  }
};
