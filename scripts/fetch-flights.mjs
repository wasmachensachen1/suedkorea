// Holt Flugdaten für die Flugsuche (js/flights.js) und legt sie als JSON im Repository ab.
// Läuft in der GitHub Action .github/workflows/flight-offers.yml, weil der Browser die APIs
// nicht direkt abfragen darf (keine CORS-Freigabe) und der API-Schlüssel geheim bleiben muss.
//
// Quellen:
//   1. SerpApi, Google-Flights-Daten (https://serpapi.com/google-flights-api). Kostenloser Plan mit
//      250 Abfragen pro Monat; der Schlüssel steht im Repository-Secret SERPAPI_KEY.
//   2. Ersatz, wenn SerpApi nicht geht (kein Schlüssel, Kontingent leer, Fehler): die Open-Source-
//      Bibliothek fli (scripts/fli_search.py), ebenfalls Google-Flights-Daten, ohne Kontingent.
// Gesucht wird immer für eine Person; die Seite rechnet mit der Zahl der Reisenden (TRIP.travellers).
//
// Aufruf: node scripts/fetch-flights.mjs <modus>
//   grid      wöchentliches Raster: Langstrecke Business, Abflug laut Plan ±3 Tage, alle Stopps,
//             alle Flughäfen der Suchmaske → data/flight-offers/longhaul.json; dazu die Inlandsflüge
//   domestic  Inlandsflüge am Reisetag laut (ggf. verschobenem) Plan → data/flight-offers/domestic.json
//   requests  offene Suchaufträge der Seite (data/flight-search/requests.json) abarbeiten
//             → data/flight-search/results/<id>.json
//   auto      requests, dazu domestic, falls sich der Plan seit dem letzten Lauf verschoben hat
import { readFile, writeFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import vm from "node:vm";
import { createHash } from "node:crypto";

const OFFERS = "data/flight-offers";
const SEARCH = "data/flight-search";
const MAX_PER_DATE = 40;            // so viele Angebote pro Tag speichern (günstigste zuerst)
const REQUEST_MAX_AGE_DAYS = 2;     // ältere, unbeantwortete Aufträge verfallen
const RESULT_KEEP_DAYS = 14;        // so lange bleiben Suchergebnisse liegen
const KEY = process.env.SERPAPI_KEY || "";
const T0 = Date.now();
const secs = () => `${Math.round((Date.now() - T0) / 1000)} s`;
const log = (...a) => console.log(`[${secs()}]`, ...a);

// ---------- Reiseplan ----------
const sandbox = { window: {} };
vm.runInNewContext(await readFile("js/data.js", "utf8"), sandbox);
vm.runInNewContext(await readFile("js/plan.js", "utf8"), sandbox);
const TRIP = sandbox.window.TRIP;
const Plan = sandbox.window.Plan;
const readJson = async (p) => { try { return JSON.parse(await readFile(p, "utf8")); } catch { return null; } };
const writeJson = (p, d, pretty) => writeFile(p, JSON.stringify(d, null, pretty ? 2 : 0) + "\n");
const selection = (await readJson("data/flights.json")) || {};
if (selection.plan) Plan.configure(selection.plan);
const planKey = JSON.stringify(Plan.state);

const CLASS = { economy: 1, premium: 2, business: 3, first: 4 };
const STOPS = { any: 0, 0: 1, 1: 2, 2: 3 }; // SerpApi: 0 beliebig, 1 nonstop, 2 max. 1 Stopp, 3 max. 2 Stopps

// ---------- SerpApi ----------
class QuotaError extends Error {}
let serpCalls = 0;
let serpDisabled = !KEY ? "Kein SerpApi-Schlüssel (Repository-Secret SERPAPI_KEY fehlt)." : "";

async function serpAccount() {
  if (!KEY) return null;
  try {
    const r = await fetch(`https://serpapi.com/account.json?api_key=${encodeURIComponent(KEY)}`);
    if (!r.ok) return null;
    const j = await r.json();
    return { left: j.total_searches_left ?? j.plan_searches_left ?? null, perMonth: j.searches_per_month ?? null, checkedAt: new Date().toISOString() };
  } catch { return null; }
}

async function serp(params) {
  if (serpDisabled) throw new QuotaError(serpDisabled);
  const q = new URLSearchParams({ engine: "google_flights", currency: "EUR", hl: "de", gl: "de", adults: "1", ...params, api_key: KEY });
  let res, j;
  try {
    res = await fetch(`https://serpapi.com/search.json?${q}`, { signal: AbortSignal.timeout(60000) });
    j = await res.json();
  } catch (e) {
    throw new Error(`SerpApi nicht erreichbar: ${e.message}`);
  }
  serpCalls++;
  const err = j && j.error ? String(j.error) : "";
  if (/run out of searches|exceeded|limit/i.test(err) || res.status === 429) { serpDisabled = `SerpApi-Kontingent aufgebraucht (${err || res.status}).`; throw new QuotaError(serpDisabled); }
  if (res.status === 401 || /invalid api key/i.test(err)) { serpDisabled = `SerpApi-Schlüssel ungültig (${err || res.status}).`; throw new QuotaError(serpDisabled); }
  if (err && /hasn't returned any results|no results/i.test(err)) return { items: [], url: j.search_metadata && j.search_metadata.google_flights_url };
  if (err || !res.ok) throw new Error(`SerpApi: ${err || res.status}`);
  return { items: [...(j.best_flights || []), ...(j.other_flights || [])], url: j.search_metadata && j.search_metadata.google_flights_url };
}

function serpSeg(item) {
  const fl = item.flights || [];
  const legs = fl.map((f) => ({
    airline: f.airline,
    code: String(f.flight_number || "").replace(/\s+/g, ""),
    from: f.departure_airport.id, to: f.arrival_airport.id,
    dep: f.departure_airport.time, arr: f.arrival_airport.time,
    duration: f.duration, aircraft: f.airplane || null,
  }));
  return {
    from: legs[0].from, to: legs[legs.length - 1].to,
    dep: legs[0].dep, arr: legs[legs.length - 1].arr,
    duration: item.total_duration, stops: Math.max(0, legs.length - 1),
    airlines: [...new Set(legs.map((l) => l.airline))],
    codes: legs.map((l) => l.code),
    legs,
    layovers: (item.layovers || []).map((l) => ({ airport: l.id, name: l.name || "", duration: l.duration, overnight: !!l.overnight })),
  };
}

const idOf = (o) => "s" + createHash("sha1").update(JSON.stringify([o.outbound.codes, o.outbound.dep, o.return && o.return.codes, o.return && o.return.dep, o.pricePP])).digest("hex").slice(0, 12);

// ---------- fli (Ersatz) ----------
let fliPython = "";
function ensureFli() {
  if (fliPython) return fliPython;
  const venv = process.env.FLI_VENV || "/tmp/fli-venv";
  if (!existsSync(`${venv}/bin/python`)) {
    spawnSync("rm", ["-rf", venv]);
    log("fli wird installiert …");
    let r = spawnSync("python3", ["-m", "venv", venv], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("Python-Umgebung für fli konnte nicht angelegt werden.");
    r = spawnSync(`${venv}/bin/pip`, ["install", "--quiet", "flights==0.9.0"], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("fli (PyPI-Paket flights) konnte nicht installiert werden.");
  }
  fliPython = `${venv}/bin/python`;
  return fliPython;
}

async function fli(req) {
  const py = ensureFli();
  const file = `/tmp/fli-req-${Date.now()}.json`;
  await writeFile(file, JSON.stringify(req));
  const r = spawnSync(py, ["-I", "scripts/fli_search.py", file], { encoding: "utf8", timeout: 180000, maxBuffer: 50 * 1024 * 1024 });
  await rm(file, { force: true });
  let j;
  try { j = JSON.parse(r.stdout); } catch { throw new Error(`fli: keine Antwort (${(r.stderr || "").slice(-300)})`); }
  if (!j.ok) throw new Error(`fli: ${j.error}`);
  return j.offers;
}

// ---------- Eine Suche (ein Abflugtag) ----------
// p: { origins, destinations, date, returnDate|null, cls, stops, airlines, depFrom, depTo, maxDuration }
function serpParams(p) {
  const q = {
    departure_id: p.origins.join(","), arrival_id: p.destinations.join(","),
    outbound_date: p.date, type: p.returnDate ? "1" : "2",
    travel_class: String(CLASS[p.cls] || 3), stops: String(STOPS[p.stops] ?? 0),
  };
  if (p.returnDate) q.return_date = p.returnDate;
  if (p.airlines && p.airlines.length) q.include_airlines = p.airlines.join(",");
  if ((p.depFrom ?? 0) > 0 || (p.depTo ?? 23) < 23) q.outbound_times = `${p.depFrom ?? 0},${p.depTo ?? 23}`;
  if (p.maxDuration) q.max_duration = String(p.maxDuration);
  return q;
}

const byPrice = (a, b) => (a.pricePP ?? Infinity) - (b.pricePP ?? Infinity);

async function searchOne(p, preferFli) {
  if (!preferFli) {
    try {
      const { items, url } = await serp(serpParams(p));
      const offers = items.map((it) => {
        const o = { source: "serpapi", pricePP: it.price ?? null, outbound: serpSeg(it), return: null };
        if (it.departure_token) o.departureToken = it.departure_token;
        if (!p.returnDate) o.return = null;
        o.id = idOf(o);
        return o;
      }).sort(byPrice).slice(0, MAX_PER_DATE);
      return { source: "serpapi", url, offers };
    } catch (e) {
      log(`SerpApi ${p.date}: ${e.message} → Ersatz fli`);
      const offers = (await fli(p)).sort(byPrice).slice(0, MAX_PER_DATE);
      return { source: "fli", offers, note: e.message };
    }
  }
  const offers = (await fli(p)).sort(byPrice).slice(0, MAX_PER_DATE);
  return { source: "fli", offers };
}

// Rückflüge zu einem Hinflug (nur SerpApi braucht dafür eine eigene Abfrage)
async function returnsFor(p, outbound, token) {
  try {
    if (!token) throw new Error("ohne departure_token");
    const { items, url } = await serp({ ...serpParams(p), departure_token: token });
    return {
      source: "serpapi", url,
      offers: items.map((it) => {
        const o = { source: "serpapi", pricePP: it.price ?? null, outbound, return: serpSeg(it) };
        o.id = idOf(o);
        return o;
      }).sort(byPrice),
    };
  } catch (e) {
    log(`Rückflüge über SerpApi: ${e.message} → Ersatz fli`);
    const all = await fli(p);
    const same = all.filter((o) => o.return && o.outbound.dep === outbound.dep && o.outbound.codes.join() === outbound.codes.join());
    return { source: "fli", offers: same.sort(byPrice), note: e.message };
  }
}

const datesAround = (iso, flex) => { const out = []; for (let i = -flex; i <= flex; i++) out.push(Plan.add(iso, i)); return out; };

// ---------- Modi ----------
async function grid() {
  const base = Plan.BASE.dep;
  const S = TRIP.flights.search;
  const p0 = {
    origins: S.origins.map((x) => x[0]), destinations: S.destinations.map((x) => x[0]),
    cls: "business", stops: "any", airlines: [], depFrom: 0, depTo: 23, maxDuration: null,
  };
  const prev = (await readJson(`${OFFERS}/longhaul.json`)) || {};
  const out = { updatedAt: new Date().toISOString(), tripDays: Plan.BASE.days, params: p0, dates: {} };
  for (const date of datesAround(base, 3)) {
    const p = { ...p0, date, returnDate: Plan.add(date, Plan.BASE.days) };
    try {
      const r = await searchOne(p);
      out.dates[date] = { returnDate: p.returnDate, fetchedAt: new Date().toISOString(), ...r };
      log(`Raster ${date}: ${r.offers.length} Angebote (${r.source})`);
    } catch (e) {
      log(`Raster ${date}: FEHLER ${e.message}`);
      const old = prev.dates && prev.dates[date];
      out.dates[date] = old ? { ...old, error: `Aktualisierung fehlgeschlagen: ${e.message}`, stale: true } : { returnDate: p.returnDate, offers: [], error: e.message };
    }
  }
  await writeJson(`${OFFERS}/longhaul.json`, out);
  return Object.values(out.dates).every((d) => d.error && !d.offers.length) ? "Raster: keine Daten" : "";
}

async function domestic() {
  const prev = (await readJson(`${OFFERS}/domestic.json`)) || {};
  const out = { updatedAt: new Date().toISOString(), planKey, routes: {} };
  let failed = 0;
  for (const r of TRIP.flights.domesticRoutes) {
    const st = TRIP.stations.find((s) => s.id === r.after);
    const date = st.checkOut;
    const p = { origins: [r.from], destinations: [r.to], date, returnDate: null, cls: "economy", stops: "any", airlines: [], depFrom: 0, depTo: 23, maxDuration: null };
    try {
      const res = await searchOne(p);
      out.routes[r.id] = { date, fetchedAt: new Date().toISOString(), ...res };
      log(`Inland ${r.id} ${date}: ${res.offers.length} Angebote (${res.source})`);
    } catch (e) {
      failed++;
      log(`Inland ${r.id}: FEHLER ${e.message}`);
      const old = prev.routes && prev.routes[r.id];
      out.routes[r.id] = old && old.date === date ? { ...old, error: `Aktualisierung fehlgeschlagen: ${e.message}`, stale: true } : { date, offers: [], error: e.message };
    }
  }
  await writeJson(`${OFFERS}/domestic.json`, out);
  return failed === TRIP.flights.domesticRoutes.length ? "Inlandsflüge: keine Daten" : "";
}

function sanitize(p) {
  const codes = (a) => (Array.isArray(a) ? a : []).map((x) => String(x).toUpperCase()).filter((x) => /^[A-Z0-9]{2,3}$/.test(x)).slice(0, 10);
  const num = (v, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : null; };
  const out = {
    origins: codes(p.origins), destinations: codes(p.destinations),
    date: /^\d{4}-\d\d-\d\d$/.test(p.date || "") ? p.date : null,
    flex: p.flex ? 3 : 0,
    tripDays: p.tripDays == null ? null : num(p.tripDays, 1, 60),
    cls: CLASS[p.cls] ? p.cls : "business",
    stops: ["any", "0", "1", "2"].includes(String(p.stops)) ? String(p.stops) : "any",
    airlines: codes(p.airlines),
    depFrom: num(p.depFrom, 0, 23) ?? 0, depTo: num(p.depTo, 0, 23) ?? 23,
    maxDuration: num(p.maxDuration, 60, 3000),
  };
  if (!out.origins.length || !out.destinations.length || !out.date) throw new Error("Unvollständiger Suchauftrag.");
  return out;
}

async function requests() {
  await mkdir(`${SEARCH}/results`, { recursive: true });
  const file = (await readJson(`${SEARCH}/requests.json`)) || { requests: [] };
  const now = Date.now();
  let done = 0;
  for (const rq of file.requests || []) {
    if (!/^[a-z0-9-]{6,40}$/i.test(rq.id || "")) continue;
    const resFile = `${SEARCH}/results/${rq.id}.json`;
    if (existsSync(resFile)) continue;
    if (now - new Date(rq.createdAt).getTime() > REQUEST_MAX_AGE_DAYS * 86400000) continue;
    const result = { id: rq.id, kind: rq.kind, createdAt: rq.createdAt, startedAt: new Date().toISOString(), params: rq.params };
    try {
      const p = sanitize(rq.params || {});
      result.params = p;
      if (rq.kind === "return") {
        const outbound = rq.outbound;
        if (!outbound || !outbound.dep) throw new Error("Hinflug fehlt im Auftrag.");
        const date = outbound.dep.slice(0, 10);
        const q = { ...p, date, returnDate: Plan.add(date, p.tripDays) };
        const r = await returnsFor(q, outbound, rq.departureToken);
        Object.assign(result, { status: "ok", source: r.source, url: r.url, note: r.note, offers: r.offers });
      } else {
        // Bei mehreren Tagen reicht das Kontingent vielleicht nicht für alle: dann gleich fli nehmen
        const dates = datesAround(p.date, p.flex);
        let preferFli = false;
        if (!serpDisabled) {
          const acc = await serpAccount();
          if (acc && acc.left != null && acc.left < dates.length) { preferFli = true; result.note = `SerpApi: nur noch ${acc.left} Abfragen übrig, Suche über fli.`; }
        }
        result.dates = {};
        let errors = 0;
        for (const date of dates) {
          const q = { ...p, date, returnDate: p.tripDays ? Plan.add(date, p.tripDays) : null };
          try {
            const r = await searchOne(q, preferFli);
            result.dates[date] = { returnDate: q.returnDate, source: r.source, url: r.url, note: r.note, offers: r.offers };
          } catch (e) {
            errors++;
            result.dates[date] = { returnDate: q.returnDate, offers: [], error: e.message };
          }
        }
        result.status = errors === dates.length ? "error" : "ok";
        if (result.status === "error") result.error = Object.values(result.dates).map((d) => d.error).find(Boolean);
      }
    } catch (e) {
      result.status = "error";
      result.error = e.message;
    }
    result.finishedAt = new Date().toISOString();
    await writeJson(resFile, result);
    done++;
    log(`Auftrag ${rq.id} (${rq.kind || "search"}): ${result.status}${result.error ? " – " + result.error : ""}`);
  }
  // Aufräumen: alte Ergebnisse löschen
  try {
    for (const f of await readdir(`${SEARCH}/results`)) {
      const st = await stat(`${SEARCH}/results/${f}`);
      if (now - st.mtimeMs > RESULT_KEEP_DAYS * 86400000) await rm(`${SEARCH}/results/${f}`, { force: true });
    }
  } catch { /* egal */ }
  return done;
}

// ---------- Ablauf ----------
await mkdir(OFFERS, { recursive: true });
const mode = process.argv[2] || "auto";
const index = (await readJson(`${OFFERS}/index.json`)) || {};
const problems = [];
log(`Modus ${mode}, SerpApi ${serpDisabled || "aktiv"}`);

if (mode === "grid") {
  const e1 = await grid(); if (e1) problems.push(e1);
  const e2 = await domestic(); if (e2) problems.push(e2);
  index.grid = { updatedAt: new Date().toISOString(), problems: [...problems] };
} else if (mode === "domestic") {
  const e = await domestic(); if (e) problems.push(e);
} else {
  await requests();
  const dom = await readJson(`${OFFERS}/domestic.json`);
  if (mode === "auto" && (!dom || dom.planKey !== planKey)) {
    log("Plan geändert oder noch keine Inlandsflüge: Inlandsflüge neu holen");
    const e = await domestic(); if (e) problems.push(e);
  }
}

const acc = await serpAccount();
index.updatedAt = new Date().toISOString();
index.serpapi = { active: !serpDisabled, problem: serpDisabled || null, callsLastRun: serpCalls, ...(acc ? { left: acc.left, perMonth: acc.perMonth, checkedAt: acc.checkedAt } : {}) };
index.lastRun = { mode, at: new Date().toISOString(), problems };
await writeJson(`${OFFERS}/index.json`, index, true);
log(`fertig, ${serpCalls} SerpApi-Abfragen${problems.length ? ", Probleme: " + problems.join("; ") : ""}`);
