// Holt Hoteldaten für alle Stationen des Reiseplans von der kostenlosen Xotelo-API
// (TripAdvisor-Daten) und legt sie als JSON unter data/hotel-offers/ ab.
// Läuft in der GitHub Action .github/workflows/hotel-offers.yml, weil der Browser die API
// wegen fehlender CORS-Freigabe nicht direkt abfragen darf.
//
// Aufruf: node scripts/fetch-hotels.mjs [station-id ...]
import { readFile, writeFile, mkdir } from "node:fs/promises";
import vm from "node:vm";

const XO = "https://data.xotelo.com/api";
const OUT = "data/hotel-offers";
const LIST_PAGE = 100;
const LIST_PAGES = 3;          // bis zu 300 Unterkünfte pro Ort
const RATE_TOP = 70;           // Tagespreise für die beliebtesten …
const RATE_NEAR = 40;          // … und die zentralsten Unterkünfte
const ADULTS_PER_ROOM = [1, 2, 3];
const CONCURRENCY = 3;

// Reisedaten aus js/data.js lesen
const sandbox = { window: {} };
vm.runInNewContext(await readFile("js/data.js", "utf8"), sandbox);
const TRIP = sandbox.window.TRIP;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function xo(endpoint, params, tries = 3) {
  const url = `${XO}/${endpoint}?${new URLSearchParams(params)}`;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "suedkorea-reiseplan/1.0", Accept: "application/json" } });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      const j = JSON.parse(text);
      if (j.error) throw new Error(`API-Fehler: ${JSON.stringify(j.error).slice(0, 200)}`);
      return j.result || {};
    } catch (e) {
      if (i >= tries) throw new Error(`${endpoint} (${url}): ${e.message}`);
      await sleep(1500 * i);
    }
  }
}

function distKm(a, b) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLon = (b[1] - a[1]) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

async function locationKey(s) {
  if (s.hotelSearch.locationKey) return s.hotelSearch.locationKey;
  const r = await xo("search", { query: s.hotelSearch.query || s.hotel.name });
  const first = (r.list || [])[0];
  const key = first && (first.location_key || String(first.hotel_key || first.key || "").split("-")[0]);
  if (!key || !/^g\d+$/.test(key)) throw new Error(`Kein Ort für „${s.hotelSearch.query}“ gefunden: ${JSON.stringify(r).slice(0, 300)}`);
  return key;
}

const listCache = new Map();
async function loadList(loc) {
  if (listCache.has(loc)) return listCache.get(loc);
  const all = [];
  for (let p = 0; p < LIST_PAGES; p++) {
    const r = await xo("list", { location_key: loc, offset: p * LIST_PAGE, limit: LIST_PAGE, sort: "popularity" });
    const list = r.list || [];
    all.push(...list);
    if (list.length < LIST_PAGE || (r.total_count && all.length >= r.total_count)) break;
  }
  listCache.set(loc, all);
  return all;
}

function normalize(h, s, rank) {
  const geo = h.geo || {}, pr = h.price_ranges || {}, rs = h.review_summary || {};
  const lat = Number(geo.latitude), lon = Number(geo.longitude);
  const hasGeo = isFinite(lat) && isFinite(lon) && (lat || lon);
  return {
    key: h.key || h.hotel_key,
    rank,
    name: h.name || "Unbenannt",
    type: h.accommodation_type || "",
    url: h.url || "",
    image: h.image || "",
    rating: Number(rs.rating) || 0,
    reviews: Number(rs.count) || 0,
    dist: hasGeo ? Math.round(distKm(s.hotelSearch.center, [lat, lon]) * 100) / 100 : null,
    rangeUsd: pr.minimum ? [pr.minimum, pr.maximum || pr.minimum] : null,
    mentions: (h.mentions || []).filter((m) => typeof m === "string").slice(0, 8),
    labels: (h.merchandising_labels || []).filter((m) => typeof m === "string").slice(0, 4),
  };
}

// Günstigstes Angebot pro Nacht für EIN Zimmer
async function bestRate(key, s, adults) {
  const r = await xo("rates", { hotel_key: key, chk_in: s.checkIn, chk_out: s.checkOut, currency: "EUR", rooms: 1, adults }, 2);
  const offers = (r.rates || [])
    .map((o) => ({ name: o.name || o.code || "Anbieter", price: Number(o.rate) + (Number(o.tax) || 0) }))
    .filter((o) => o.price > 0)
    .sort((a, b) => a.price - b.price);
  return offers.length ? { price: Math.round(offers[0].price), provider: offers[0].name, offers: offers.length } : null;
}

async function pool(jobs, n) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < jobs.length) { const job = jobs[i++]; await job(); await sleep(150); }
  }));
}

async function station(s) {
  const loc = await locationKey(s);
  const seen = new Set();
  const hotels = (await loadList(loc))
    .map((h, i) => normalize(h, s, i))
    .filter((h) => h.key && !seen.has(h.key) && seen.add(h.key));
  if (!hotels.length) throw new Error(`Die Hotelliste für ${loc} ist leer.`);

  const near = hotels.filter((h) => h.dist != null).sort((a, b) => a.dist - b.dist).slice(0, RATE_NEAR);
  const pick = [...new Set([...hotels.slice(0, RATE_TOP), ...near])];
  let ok = 0, failed = 0, lastError = "";
  const jobs = [];
  for (const h of pick) {
    h.rates = {};
    for (const a of ADULTS_PER_ROOM) {
      jobs.push(async () => {
        try { h.rates[a] = await bestRate(h.key, s, a); if (h.rates[a]) ok++; } catch (e) { failed++; lastError = e.message; }
      });
    }
  }
  await pool(jobs, CONCURRENCY);
  console.log(`${s.id}: ${hotels.length} Unterkünfte (Ort ${loc}), ${ok} Tagespreise, ${failed} Fehler${lastError ? ` – zuletzt: ${lastError}` : ""}`);
  return { locationKey: loc, hotels, rateStats: { ok, failed } };
}

await mkdir(OUT, { recursive: true });
const only = process.argv.slice(2);
const index = { updatedAt: new Date().toISOString(), source: "Xotelo (TripAdvisor)", stations: {} };
try { Object.assign(index.stations, JSON.parse(await readFile(`${OUT}/index.json`, "utf8")).stations || {}); } catch { /* neu */ }

let failures = 0;
for (const s of TRIP.stations) {
  if (only.length && !only.includes(s.id)) continue;
  try {
    const r = await station(s);
    await writeFile(`${OUT}/${s.id}.json`, JSON.stringify({
      station: s.id, updatedAt: new Date().toISOString(), checkIn: s.checkIn, checkOut: s.checkOut,
      currency: "EUR", usdToEur: 0.92, ...r,
    }) + "\n");
    index.stations[s.id] = { ok: true, updatedAt: new Date().toISOString(), count: r.hotels.length, locationKey: r.locationKey };
  } catch (e) {
    failures++;
    console.error(`${s.id}: FEHLER ${e.message}`);
    index.stations[s.id] = { ...(index.stations[s.id] || {}), ok: false, error: e.message.slice(0, 500), failedAt: new Date().toISOString() };
  }
}
await writeFile(`${OUT}/index.json`, JSON.stringify(index, null, 2) + "\n");
if (failures && failures === (only.length || TRIP.stations.length)) process.exit(1);
