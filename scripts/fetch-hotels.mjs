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
const RATE_TOP = 40;           // Tagespreise für die beliebtesten …
const RATE_NEAR = 25;          // … und die zentralsten Unterkünfte
const ADULTS_PER_ROOM = [2, 1, 3]; // 2 zuerst: die übliche Belegung
const CONCURRENCY = 4;
const TIMEOUT_MS = 20000;      // höchstens so lange auf eine Antwort warten
const RATE_BUDGET_MS = 15 * 60 * 1000; // danach keine weiteren Tagespreise mehr abfragen
const T0 = Date.now();
const secs = () => `${Math.round((Date.now() - T0) / 1000)} s`;

// Reisedaten aus js/data.js lesen
const sandbox = { window: {} };
vm.runInNewContext(await readFile("js/data.js", "utf8"), sandbox);
const TRIP = sandbox.window.TRIP;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function xo(endpoint, params, tries = 3) {
  const url = `${XO}/${endpoint}?${new URLSearchParams(params)}`;
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "suedkorea-reiseplan/1.0", Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      const j = JSON.parse(text);
      if (j.error) throw new Error(`API-Fehler: ${JSON.stringify(j.error).slice(0, 200)}`);
      return j.result || {};
    } catch (e) {
      const msg = e.name === "TimeoutError" ? `keine Antwort nach ${TIMEOUT_MS / 1000} s` : e.message;
      if (i >= tries) throw new Error(`${endpoint} (${url}): ${msg}`);
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

async function pool(jobs, n, stop) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < jobs.length && !stop()) { const job = jobs[i++]; await job(); await sleep(150); }
  }));
}

// Schritt 1: Hotelliste einer Station (schnell, wenige Anfragen)
async function loadStation(s) {
  const loc = await locationKey(s);
  const seen = new Set();
  const hotels = (await loadList(loc))
    .map((h, i) => normalize(h, s, i))
    .filter((h) => h.key && !seen.has(h.key) && seen.add(h.key));
  if (!hotels.length) throw new Error(`Die Hotelliste für ${loc} ist leer.`);
  console.log(`[${secs()}] ${s.id}: ${hotels.length} Unterkünfte geladen (Ort ${loc})`);
  return { locationKey: loc, hotels, rateStats: { ok: 0, failed: 0, skipped: true } };
}

// Schritt 2: Tagespreise für die beliebtesten und zentralsten Häuser
async function loadRates(s, r) {
  const near = r.hotels.filter((h) => h.dist != null).sort((a, b) => a.dist - b.dist).slice(0, RATE_NEAR);
  const pick = [...new Set([...r.hotels.slice(0, RATE_TOP), ...near])];
  let ok = 0, failed = 0, done = 0, lastError = "", reason = "";
  const jobs = [];
  for (const a of ADULTS_PER_ROOM) {
    for (const h of pick) {
      jobs.push(async () => {
        try {
          const rate = await bestRate(h.key, s, a);
          if (rate) { (h.rates = h.rates || {})[a] = rate; ok++; }
        } catch (e) { failed++; lastError = e.message; }
        if (++done % 25 === 0) console.log(`[${secs()}] ${s.id}: Tagespreise ${done}/${jobs.length} (${ok} gefunden, ${failed} Fehler)`);
      });
    }
  }
  const stop = () => {
    if (Date.now() - T0 > RATE_BUDGET_MS) { reason = "Zeitbudget erschöpft"; return true; }
    if (failed >= 12 && ok === 0) { reason = "API liefert keine Tagespreise"; return true; }
    return false;
  };
  await pool(jobs, CONCURRENCY, stop);
  r.rateStats = { ok, failed, requested: done, planned: jobs.length, ...(reason ? { stopped: reason } : {}) };
  console.log(`[${secs()}] ${s.id}: ${ok} Tagespreise, ${failed} Fehler${reason ? `, abgebrochen: ${reason}` : ""}${lastError ? ` – letzter Fehler: ${lastError}` : ""}`);
}

await mkdir(OUT, { recursive: true });
const only = process.argv.slice(2);
const index = { updatedAt: new Date().toISOString(), source: "Xotelo (TripAdvisor)", stations: {} };
try { Object.assign(index.stations, JSON.parse(await readFile(`${OUT}/index.json`, "utf8")).stations || {}); } catch { /* neu */ }

async function write(s, r) {
  await writeFile(`${OUT}/${s.id}.json`, JSON.stringify({
    station: s.id, updatedAt: new Date().toISOString(), checkIn: s.checkIn, checkOut: s.checkOut,
    currency: "EUR", usdToEur: 0.92, ...r,
  }) + "\n");
  index.stations[s.id] = { ok: true, updatedAt: new Date().toISOString(), count: r.hotels.length, locationKey: r.locationKey, rates: r.rateStats };
  await writeFile(`${OUT}/index.json`, JSON.stringify(index, null, 2) + "\n");
}

const stations = TRIP.stations.filter((s) => !only.length || only.includes(s.id));
const loaded = [];
let failures = 0;
let ratesDead = false;

// Erst alle Listen (damit jede Station sicher Hotels hat), dann die Tagespreise.
for (const s of stations) {
  try {
    const r = await loadStation(s);
    await write(s, r);
    loaded.push([s, r]);
  } catch (e) {
    failures++;
    console.error(`[${secs()}] ${s.id}: FEHLER ${e.message}`);
    index.stations[s.id] = { ...(index.stations[s.id] || {}), ok: false, error: e.message.slice(0, 500), failedAt: new Date().toISOString() };
    await writeFile(`${OUT}/index.json`, JSON.stringify(index, null, 2) + "\n");
  }
}
for (const [s, r] of loaded) {
  if (r.rateStats.skipped === false) continue;
  if (ratesDead) { r.rateStats = { ok: 0, failed: 0, stopped: "übersprungen, die API lieferte bei einer früheren Station keine Tagespreise" }; await write(s, r); continue; }
  await loadRates(s, r);
  if (r.rateStats.stopped === "API liefert keine Tagespreise") ratesDead = true;
  await write(s, r);
}
console.log(`[${secs()}] fertig: ${loaded.length} von ${stations.length} Stationen`);
if (failures && failures === stations.length) process.exit(1);
