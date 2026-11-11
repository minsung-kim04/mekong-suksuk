const STATIONS = new Set(["039801", "019803", "980601"]);
const LATEST_CSV = "https://docs.google.com/spreadsheets/d/1BYUCBE2eevme8pUW0s4_3lXFHFSCiN03JMMoeWcDmvM/export?format=csv&gid=164180063";
const HISTORY_CSV = "https://docs.google.com/spreadsheets/d/1BYUCBE2eevme8pUW0s4_3lXFHFSCiN03JMMoeWcDmvM/export?format=csv&gid=723550581";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const headers = (rows.shift() || []).map((value) => value.replace(/^\uFEFF/, "").trim());
  if (!headers.includes("stationId") || !headers.includes("waterLevel_m")) {
    throw new Error("Unexpected Google Sheets CSV format");
  }
  return rows
    .filter((values) => values.some((value) => value.trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function readSheet(url) {
  const response = await fetch(url, {
    headers: { accept: "text/csv,text/plain;q=0.9,*/*;q=0.8", "cache-control": "no-cache" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error("Google Sheets returned " + response.status);
  return parseCsv(await response.text());
}

async function fetchLatest() {
  const rows = (await readSheet(LATEST_CSV))
    .filter((row) => STATIONS.has(String(row.stationId || "").trim()))
    .map((row) => ({
      stationId: String(row.stationId || "").trim(),
      name: row.name || "",
      latitude: row.latitude || "",
      longitude: row.longitude || "",
      river: row.river || "",
      waterLevel_m: row.waterLevel_m || "",
      rainFall1H_mm: row.rainFall1H_mm || "",
      rainFall6H_mm: row.rainFall6H_mm || "",
      rainFall12H_mm: row.rainFall12H_mm || "",
      rainFall24H_mm: row.rainFall24H_mm || "",
      rainFall7to7_mm: row.rainFall7to7_mm || "",
      lastStatus: row.lastStatus || "",
      lastMeasurement_local: row.lastMeasurement_local || "",
      sourceRetrievedAt_local: row.sourceRetrievedAt_local || "",
      source: row.source || "",
    }));
  if (!rows.some((row) => row.stationId === "039801")) throw new Error("Châu Đốc row is missing from MRC_latest");
  return rows;
}

async function fetchHistory() {
  return (await readSheet(HISTORY_CSV))
    .filter((row) => STATIONS.has(String(row.stationId || "").trim()))
    .map((row) => ({
      stationId: String(row.stationId || "").trim(),
      name: row.name || "",
      waterLevel_m: row.waterLevel_m || "",
      rainFall1H_mm: row.rainFall1H_mm || "",
      rainFall6H_mm: row.rainFall6H_mm || "",
      rainFall12H_mm: row.rainFall12H_mm || "",
      rainFall24H_mm: row.rainFall24H_mm || "",
      rainFall7to7_mm: row.rainFall7to7_mm || "",
      lastStatus: row.lastStatus || "",
      sourceRetrievedAt_local: row.sourceRetrievedAt_local || "",
    }));
}

module.exports = { fetchLatest, fetchHistory, LATEST_CSV, HISTORY_CSV };
