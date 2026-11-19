// Holt Hoteldaten für alle Stationen des Reiseplans von der kostenlosen Xotelo-API
// (TripAdvisor-Daten) und legt sie als JSON unter data/hotel-offers/ ab.
// Läuft in der GitHub Action .github/workflows/hotel-offers.yml, weil der Browser die API
// wegen fehlender CORS-Freigabe nicht direkt abfragen darf.
//
// Preise pro Nacht und Zimmer, in dieser Reihenfolge:
//   1. Tagespreis für den Zeitraum laut Reiseplan (für 2027 oft noch nicht verfügbar)
//   2. aktueller Referenzpreis (Termin in ca. 30 Tagen) × Saisonfaktor; der Faktor wird aus
//      den Hotels berechnet, für die beide Preise vorliegen
//   3. Schätzung aus vergleichbaren Häusern derselben Station (Bewertung, Beliebtheit, Lage,
//      Kategorie)
// Abgefragte Preise werden in den Dateien gespeichert und bei späteren Läufen wiederverwendet,
// so füllt sich die Liste über mehrere Tage auf.
//
// Aufruf: node scripts/fetch-hotels.mjs [station-id ...]
import { readFile, writeFile, mkdir } from "node:fs/promises";
import vm from "node:vm";

const XO = "https://data.xotelo.com/api";
const OUT = "data/hotel-offers";
const COUNTRY = "g294196";     // Südkorea – zum Ermitteln fehlender Orts-IDs
const LIST_PAGE = 100;
const LIST_PAGES = 3;          // bis zu 300 Unterkünfte pro Ort
const PLAN_TOP = 40;           // Tagespreise (Reisezeitraum) für die beliebtesten …
const PLAN_NEAR = 25;          // … und die zentralsten Häuser
const OCC_SAMPLE = 10;         // so viele Häuser zusätzlich mit 1 und 3 Personen abfragen
const REF_PER_RUN = 150;       // Referenzpreise pro Station und Lauf
const PLAN_MAX_AGE = 2;        // Tage, bis ein Tagespreis neu abgefragt wird
const REF_MAX_AGE = 14;        // Tage, bis ein Referenzpreis neu abgefragt wird
const REF_LEAD_DAYS = 30;      // Referenztermin: so viele Tage ab heute
const CONCURRENCY = 6;
const TIMEOUT_MS = 20000;
const BUDGET_MS = 17 * 60 * 1000; // danach keine weiteren Preise mehr abfragen
const DEFAULT_OCC = { 1: 0.93, 3: 1.2 };
const T0 = Date.now();
const secs = () => `${Math.round((Date.now() - T0) / 1000)} s`;
const today = new Date().toISOString().slice(0, 10);

// Reisedaten aus js/data.js lesen
const sandbox = { window: {} };
vm.runInNewContext(await readFile("js/data.js", "utf8"), sandbox);
const TRIP = sandbox.window.TRIP;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const ageDays = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / 86400000 : Infinity);
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const nights = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

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

const listCache = new Map();
async function loadList(loc, pages = LIST_PAGES) {
  const ck = `${loc}|${pages}`;
  if (listCache.has(ck)) return listCache.get(ck);
  const all = [];
  for (let p = 0; p < pages; p++) {
    const r = await xo("list", { location_key: loc, offset: p * LIST_PAGE, limit: LIST_PAGE, sort: "popularity" });
    const list = r.list || [];
    if (p === 0 && list[0]) console.log(`[${secs()}] Felder der Hotelliste (${loc}): ${Object.keys(list[0]).join(", ")}`);
    all.push(...list);
    if (list.length < LIST_PAGE || (r.total_count && all.length >= r.total_count)) break;
  }
  listCache.set(ck, all);
  return all;
}

// Orts-ID: aus data.js, aus dem letzten Lauf, sonst über die Landesliste ermitteln
// (die Suche der API ist inzwischen nur noch über RapidAPI nutzbar).
async function locationKey(s, prevIndex) {
  if (s.hotelSearch.locationKey) return s.hotelSearch.locationKey;
  const prev = prevIndex.stations && prevIndex.stations[s.id];
  if (prev && prev.locationKey) return prev.locationKey;
  const match = s.hotelSearch.urlMatch;
  if (!match) throw new Error(`Für ${s.id} fehlt hotelSearch.locationKey oder hotelSearch.urlMatch in js/data.js.`);
  const list = await loadList(COUNTRY, 5);
  const counts = {};
  for (const h of list) {
    const key = String(h.key || h.hotel_key || "");
    if (String(h.url || "").includes(`-${match}`) && /^g\d+-/.test(key)) {
      const g = key.split("-")[0];
      counts[g] = (counts[g] || 0) + 1;
    }
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!best) throw new Error(`Keine Orts-ID für „${match}“ in der Landesliste gefunden. Bitte hotelSearch.locationKey in js/data.js eintragen.`);
  console.log(`[${secs()}] ${s.id}: Orts-ID ${best[0]} ermittelt (über „${match}“). Kann in js/data.js als locationKey eingetragen werden.`);
  return best[0];
}

// Grobe Kategorie aus Name und Art: 2 = Luxus/Marke, 1 = normal, 0 = einfach
const LUX = /four seasons|shilla|signiel|lotte hotel|josun|marriott|ritz|hyatt|hilton|conrad|intercontinental|westin|sheraton|sofitel|fairmont|banyan|andaz|mondrian|park hyatt|paradise|kempinski|ananti|naru|mgallery|luxury collection|grand hyatt|walkerhill|vista|raffles|rosewood|peninsula|mandarin|st\. regis|w seoul|lahan|hanok hotel|ragung/i;
const BUDGET = /hostel|guest ?house|guesthouse|motel|backpack|capsule|dorm|homestay|pension|minbak/i;
function tier(h) {
  if (LUX.test(h.name)) return 2;
  if (BUDGET.test(h.name) || /hostel|guest|b&b|bed and breakfast|motel/i.test(h.type)) return 0;
  return 1;
}

function normalize(h, s, rank) {
  const geo = h.geo || {}, pr = h.price_ranges || {}, rs = h.review_summary || {};
  const lat = Number(geo.latitude), lon = Number(geo.longitude);
  const hasGeo = isFinite(lat) && isFinite(lon) && (lat || lon);
  const n = {
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
  n.tier = tier(n);
  return n;
}

// Günstigstes Angebot pro Nacht für EIN Zimmer
async function bestRate(key, chkIn, chkOut, adults) {
  const r = await xo("rates", { hotel_key: key, chk_in: chkIn, chk_out: chkOut, currency: "EUR", rooms: 1, adults }, 2);
  const offers = (r.rates || [])
    .map((o) => ({ name: o.name || o.code || "Anbieter", price: Number(o.rate) + (Number(o.tax) || 0) }))
    .filter((o) => o.price > 0)
    .sort((a, b) => a.price - b.price);
  return offers.length
    ? { price: Math.round(offers[0].price), provider: offers[0].name, offers: offers.length, at: today }
    : { price: null, at: today };
}

async function pool(jobs, n, stop) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < jobs.length && !stop()) { const job = jobs[i++]; await job(); await sleep(100); }
  }));
}

async function readJson(path) { try { return JSON.parse(await readFile(path, "utf8")); } catch { return null; } }

// Schritt 1: Hotelliste (gespeicherte Preise aus dem letzten Lauf übernehmen)
async function loadStation(s, prevIndex) {
  const loc = await locationKey(s, prevIndex);
  const prev = await readJson(`${OUT}/${s.id}.json`);
  const prevBy = new Map(((prev && prev.locationKey === loc && prev.hotels) || []).map((h) => [h.key, h]));
  const seen = new Set();
  const hotels = (await loadList(loc))
    .map((h, i) => normalize(h, s, i))
    .filter((h) => h.key && !seen.has(h.key) && seen.add(h.key));
  if (!hotels.length) throw new Error(`Die Hotelliste für ${loc} ist leer.`);
  for (const h of hotels) {
    const p = prevBy.get(h.key);
    if (!p) continue;
    if (p.rates && prev.checkIn === s.checkIn && prev.checkOut === s.checkOut) h.rates = p.rates;
    if (p.ref) h.ref = p.ref;
  }
  console.log(`[${secs()}] ${s.id}: ${hotels.length} Unterkünfte geladen (Ort ${loc}), ${prevBy.size ? "Preise aus dem letzten Lauf übernommen" : "noch keine gespeicherten Preise"}`);
  return { locationKey: loc, hotels };
}

// Referenztermin: gleicher Wochentag wie die Anreise laut Plan, ca. 30 Tage ab heute
// Feiertagszeiten mit untypischen Preisen meiden (Weihnachten/Neujahr, Seollal, Chuseok)
const HOLIDAYS = [["12-20", "01-04"], ["2027-02-04", "2027-02-10"], ["2027-09-12", "2027-09-18"], ["2028-01-24", "2028-01-29"]];
function inHoliday(a, b) {
  return HOLIDAYS.some(([x, y]) => {
    if (x.length === 5) { // jährlich, über den Jahreswechsel
      const days = []; for (let d = a; d < b; d = addDays(d, 1)) days.push(d.slice(5));
      return days.some((d) => d >= x || d <= y);
    }
    return a <= y && b > x;
  });
}
function refWindow(s) {
  let ci = addDays(today, REF_LEAD_DAYS);
  const want = new Date(s.checkIn + "T00:00:00Z").getUTCDay();
  while (new Date(ci + "T00:00:00Z").getUTCDay() !== want) ci = addDays(ci, 1);
  const n = nights(s.checkIn, s.checkOut);
  for (let i = 0; i < 10 && inHoliday(ci, addDays(ci, n)); i++) ci = addDays(ci, 7);
  return { checkIn: ci, checkOut: addDays(ci, n) };
}

// Schritt 2: Preise abfragen (nur was fehlt oder veraltet ist)
async function loadRates(s, r, deadline) {
  const H = r.hotels;
  const near = H.filter((h) => h.dist != null).sort((a, b) => a.dist - b.dist).slice(0, PLAN_NEAR);
  const pick = [...new Set([...H.slice(0, PLAN_TOP), ...near])];
  const rw = refWindow(s);
  r.refWindow = rw;
  const stale = (x, days) => !x || ageDays(x.at) > days;
  const st = { plan: 0, ref: 0, occ: 0, failed: 0, requested: 0 };
  let lastError = "";
  const job = (fn) => async () => {
    st.requested++;
    try { await fn(); } catch (e) { st.failed++; lastError = e.message; }
    if (st.requested % 50 === 0) console.log(`[${secs()}] ${s.id}: ${st.requested} Preisabfragen (${st.plan} Reisezeitraum, ${st.ref} Referenz, ${st.failed} Fehler)`);
  };
  const jobs = [];
  // a) Tagespreise im Reisezeitraum, 2 Personen
  for (const h of pick) {
    if (!stale(h.rates && h.rates[2], PLAN_MAX_AGE)) continue;
    jobs.push(job(async () => { const x = await bestRate(h.key, s.checkIn, s.checkOut, 2); (h.rates = h.rates || {})[2] = x; if (x.price) st.plan++; }));
  }
  // b) Referenzpreise (fehlend zuerst, dann die ältesten), 2 Personen
  const refTodo = H.filter((h) => stale(h.ref, REF_MAX_AGE))
    .sort((a, b) => (a.ref ? 1 : 0) - (b.ref ? 1 : 0) || a.rank - b.rank)
    .slice(0, REF_PER_RUN);
  for (const h of refTodo) {
    jobs.push(job(async () => { const x = await bestRate(h.key, rw.checkIn, rw.checkOut, 2); h.ref = { ...x, checkIn: rw.checkIn, checkOut: rw.checkOut }; if (x.price) st.ref++; }));
  }
  let reason = "";
  const stop = () => {
    if (Date.now() > deadline) { reason = "Zeitbudget für diese Station erschöpft"; return true; }
    if (st.failed >= 15 && st.plan + st.ref + st.occ === 0) { reason = "API liefert keine Preise"; return true; }
    return false;
  };
  await pool(jobs, CONCURRENCY, stop);
  // c) Stichprobe für 1 und 3 Personen pro Zimmer (braucht die Tagespreise aus a)
  const occJobs = [];
  const occTodo = pick.filter((h) => h.rates && h.rates[2] && h.rates[2].price).slice(0, OCC_SAMPLE);
  for (const h of occTodo) {
    for (const a of [1, 3]) {
      if (!stale(h.rates[a], PLAN_MAX_AGE)) continue;
      occJobs.push(job(async () => { const x = await bestRate(h.key, s.checkIn, s.checkOut, a); h.rates[a] = x; if (x.price) st.occ++; }));
    }
  }
  if (!reason) await pool(occJobs, CONCURRENCY, stop);
  jobs.push(...occJobs);
  r.rateStats = { ...st, planned: jobs.length, ...(reason ? { stopped: reason } : {}) };
  console.log(`[${secs()}] ${s.id}: ${jobs.length} Abfragen geplant, ${st.requested} erledigt – ${st.plan} Tagespreise, ${st.ref} Referenzpreise, ${st.occ} Belegungspreise, ${st.failed} Fehler${reason ? `, abgebrochen: ${reason}` : ""}${lastError ? ` – letzter Fehler: ${lastError}` : ""}`);
  return reason === "API liefert keine Preise";
}

// Schritt 3: Faktoren und Schätzungen
const planPrice = (h, a = 2) => (h.rates && h.rates[a] && h.rates[a].price) || null;
const refPrice = (h) => (h.ref && h.ref.price) || null;

function factors(results) {
  const seasonPairs = {}, all = [];
  const occ = { 1: [], 3: [] };
  for (const [s, r] of results) {
    seasonPairs[s.id] = [];
    for (const h of r.hotels) {
      const p = planPrice(h), q = refPrice(h);
      if (p && q) { seasonPairs[s.id].push(p / q); all.push(p / q); }
      for (const a of [1, 3]) { const x = planPrice(h, a); if (p && x) occ[a].push(x / p); }
    }
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const globalSeason = all.length >= 5 ? clamp(median(all), 0.6, 2.5) : null;
  const season = {};
  for (const [s] of results) {
    const pairs = seasonPairs[s.id];
    if (pairs.length >= 5) season[s.id] = { value: clamp(median(pairs), 0.6, 2.5), pairs: pairs.length, source: "Station" };
    else if (globalSeason) season[s.id] = { value: globalSeason, pairs: all.length, source: "alle Stationen" };
    else season[s.id] = { value: 1, pairs: 0, source: "Standard (noch keine Vergleichswerte)" };
  }
  const occFactor = {};
  for (const a of [1, 3]) occFactor[a] = occ[a].length >= 4 ? Math.round(clamp(median(occ[a]), 0.6, 1.8) * 100) / 100 : DEFAULT_OCC[a];
  return { season, occFactor, occSamples: { 1: occ[1].length, 3: occ[3].length } };
}

function estimate(r, season) {
  const H = r.hotels;
  const f = season.value;
  for (const h of H) {
    const p = planPrice(h), q = refPrice(h);
    if (p) h.est = { price: p, method: "rate" };
    else if (q) h.est = { price: Math.round(q * f), method: "ref", ref: q, factor: Math.round(f * 100) / 100 };
    else delete h.est;
  }
  // Ähnlichkeit: Kategorie, Bewertung, Beliebtheit (Bewertungsanzahl), Lage
  const known = H.filter((h) => h.est);
  const feat = (h) => [h.tier, h.rating || 3.5, Math.log10((h.reviews || 0) + 1), Math.min(h.dist ?? 10, 20)];
  const W = [1.6, 1.4, 0.8, 0.08];
  for (const h of H) {
    if (h.est || known.length < 3) continue;
    const a = feat(h);
    const nn = known
      .map((k) => { const b = feat(k); return { k, d: W.reduce((sum, w, i) => sum + w * Math.abs(a[i] - b[i]), 0) }; })
      .sort((x, y) => x.d - y.d)
      .slice(0, 7);
    const logs = nn.map((x) => Math.log(x.k.est.price));
    h.est = { price: Math.round(Math.exp(median(logs))), method: "similar", n: nn.length };
  }
  const by = { rate: 0, ref: 0, similar: 0, none: 0 };
  H.forEach((h) => by[h.est ? h.est.method : "none"]++);
  return by;
}

// ---------- Ablauf ----------
await mkdir(OUT, { recursive: true });
const only = process.argv.slice(2);
const prevIndex = (await readJson(`${OUT}/index.json`)) || {};
const index = { updatedAt: new Date().toISOString(), source: "Xotelo (TripAdvisor)", stations: { ...(prevIndex.stations || {}) } };

const stations = TRIP.stations.filter((s) => !only.length || only.includes(s.id));
const results = [];
let failures = 0;

for (const s of stations) {
  try {
    results.push([s, await loadStation(s, prevIndex)]);
  } catch (e) {
    failures++;
    console.error(`[${secs()}] ${s.id}: FEHLER ${e.message}`);
    index.stations[s.id] = { ...(index.stations[s.id] || {}), ok: false, error: e.message.slice(0, 500), failedAt: new Date().toISOString() };
  }
}

let dead = false;
for (let i = 0; i < results.length; i++) {
  const [s, r] = results[i];
  if (dead) { r.rateStats = { stopped: "übersprungen, die API lieferte zuvor keine Preise" }; continue; }
  // Zeitbudget gleichmäßig auf die verbleibenden Stationen verteilen
  const deadline = Date.now() + (T0 + BUDGET_MS - Date.now()) / (results.length - i);
  dead = await loadRates(s, r, deadline);
}

const F = factors(results);
for (const [s, r] of results) {
  const by = estimate(r, F.season[s.id]);
  await writeFile(`${OUT}/${s.id}.json`, JSON.stringify({
    station: s.id, updatedAt: new Date().toISOString(), checkIn: s.checkIn, checkOut: s.checkOut,
    currency: "EUR", usdToEur: 0.92, locationKey: r.locationKey, refWindow: r.refWindow,
    seasonFactor: F.season[s.id], occFactor: F.occFactor, rateStats: r.rateStats, prices: by,
    hotels: r.hotels,
  }) + "\n");
  index.stations[s.id] = {
    ok: true, updatedAt: new Date().toISOString(), count: r.hotels.length, locationKey: r.locationKey,
    prices: by, seasonFactor: F.season[s.id], rates: r.rateStats,
  };
  console.log(`[${secs()}] ${s.id}: Preise – ${by.rate} Tagespreise, ${by.ref} aus Referenzpreis × ${F.season[s.id].value.toFixed(2)}, ${by.similar} aus Vergleichshäusern, ${by.none} ohne`);
}
index.occFactor = F.occFactor;
await writeFile(`${OUT}/index.json`, JSON.stringify(index, null, 2) + "\n");
console.log(`[${secs()}] fertig: ${results.length} von ${stations.length} Stationen, Belegungsfaktoren 1 Person ${F.occFactor[1]}, 3 Personen ${F.occFactor[3]}`);
if (failures && failures === stations.length) process.exit(1);
