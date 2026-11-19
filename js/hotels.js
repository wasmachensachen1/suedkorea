// Hotel-Konfigurator.
// Hotels kommen aus der kostenlosen Xotelo-API (https://xotelo.com, Daten von TripAdvisor),
// vorab geholt von der GitHub Action .github/workflows/hotel-offers.yml. Pro Station kann ein Hotel in den Reiseplan übernommen
// werden; die Auswahl liegt in data/hotels.json und wird wie die To-dos über GitHub gespeichert.
(function () {
  "use strict";

  const GH = window.GitHubStore;
  const T = window.TRIP;
  const PATH = "data/hotels.json";
  const OFFERS = "data/hotel-offers";
  const USD_EUR = 0.92;          // Preisspannen der Hotelliste sind in US-Dollar
  const PAGE_SIZE = 15;          // Treffer pro "Weitere anzeigen"
  const FORM_KEY = "suedkorea-hotel-form";
  const TRIP_MIN = T.stations[0].checkIn;
  const TRIP_MAX = T.stations[T.stations.length - 1].checkOut;

  const U = () => window.TripUtil; // esc, md aus app.js

  // ---------- Auswahl (data/hotels.json) ----------
  const state = { selections: {}, loaded: false, loading: false, saving: false, error: "" };
  const listeners = [];
  function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

  async function load() {
    state.loading = true; notify();
    try {
      const { data } = await GH.readJson(PATH);
      state.selections = (data && data.selections) || {};
      state.loaded = true;
      state.error = "";
    } catch (e) {
      state.error = `Die Hotel-Auswahl konnte nicht geladen werden: ${e.message || e}`;
    } finally {
      state.loading = false; notify();
    }
  }

  async function save(change, message) {
    state.saving = true; state.error = "";
    const before = state.selections;
    state.selections = { ...before };
    change(state.selections);
    notify();
    try {
      const res = await GH.updateJson(PATH, (data) => {
        const selections = (data && data.selections) || {};
        change(selections);
        return { version: 1, selections };
      }, message);
      state.selections = res.data.selections;
      return true;
    } catch (e) {
      state.selections = before;
      state.error = `Nicht gespeichert: ${e.message || e}`;
      return false;
    } finally {
      state.saving = false; notify();
    }
  }

  function select(station, entry) {
    return save((sel) => { sel[station.id] = entry; },
      `Hotel für ${station.name} (${station.area}): ${entry.name}`);
  }
  function reset(station) {
    return save((sel) => { delete sel[station.id]; },
      `Hotel für ${station.name} (${station.area}) auf Planvorschlag zurückgesetzt`);
  }

  // ---------- Werte für Reiseplan und Kosten ----------
  const eur = (n) => `${Math.round(n).toLocaleString("de-DE")} €`;
  const fmtDay = (iso) => { const [, m, d] = iso.split("-").map(Number); return `${d}.${m}.`; };
  function nightsBetween(a, b) {
    const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  }

  // Das Hotel, das für eine Station im Reiseplan steht.
  function effective(s) {
    const sel = state.selections[s.id];
    if (!sel) {
      return {
        selected: false, name: s.hotel.name, url: s.hotel.url, text: s.hotel.text, alt: s.hotel.alt,
        priceText: s.hotel.price, rooms: 1,
      };
    }
    const rooms = sel.rooms || 1;
    return {
      selected: true, name: sel.name, url: sel.url, text: sel.text, image: sel.image, sel,
      rooms,
      priceText: `${sel.estimate ? "ca. " : ""}${eur(sel.pricePerNight)} pro Nacht und Zimmer` +
        (rooms > 1 ? ` · ${rooms} Zimmer` : ""),
      priceNote: sel.priceSource,
    };
  }

  // Hotelkosten einer Station über alle Nächte des Reiseplans (min/max in Euro).
  function costRange(s) {
    const sel = state.selections[s.id];
    if (sel) { const v = sel.pricePerNight * (sel.rooms || 1) * s.nights; return { min: v, max: v, fixed: true }; }
    return { min: s.hotel.priceMin * s.nights, max: s.hotel.priceMax * s.nights, fixed: false };
  }

  // ---------- Hoteldaten (data/hotel-offers/<station>.json) ----------
  // Der Browser darf die Xotelo-API nicht direkt abfragen (keine CORS-Freigabe). Die GitHub Action
  // "Hoteldaten aktualisieren" holt die Daten deshalb täglich und legt sie hier ab.
  const offers = new Map(); // station-id -> Datei-Inhalt

  async function loadHotels(s) {
    if (offers.has(s.id)) return offers.get(s.id);
    let res;
    try {
      res = await fetch(`${OFFERS}/${s.id}.json?t=${Math.floor(Date.now() / 600000)}`, { cache: "no-cache" });
    } catch (e) {
      throw new Error("Die Hoteldaten konnten nicht geladen werden. Bitte Internetverbindung prüfen.");
    }
    if (res.status === 404) {
      let why = "";
      try {
        const idx = await (await fetch(`${OFFERS}/index.json?t=${Date.now()}`, { cache: "no-cache" })).json();
        const st = idx.stations && idx.stations[s.id];
        if (st && st.error) why = ` Letzter Fehler: ${st.error}`;
      } catch (e) { /* noch kein Lauf */ }
      throw new Error(`Für ${s.name} liegen noch keine Hoteldaten vor. Sie werden von der GitHub Action „Hoteldaten aktualisieren“ geholt (täglich, oder im Repository unter Actions → Run workflow).${why}`);
    }
    if (!res.ok) throw new Error(`Die Hoteldaten konnten nicht geladen werden (Fehler ${res.status}).`);
    const data = await res.json();
    const usd = data.usdToEur || USD_EUR;
    data.hotels = (data.hotels || []).map((h) => ({
      ...h,
      rangeMin: h.rangeUsd ? h.rangeUsd[0] * usd : null,
      rangeMax: h.rangeUsd ? h.rangeUsd[1] * usd : null,
      mentions: h.mentions || [],
      labels: h.labels || [],
    }));
    offers.set(s.id, data);
    return data;
  }

  // Tagespreis pro Nacht für EIN Zimmer – nur für den Zeitraum des Reiseplans und
  // bis 3 Erwachsene pro Zimmer vorab geholt. Sonst untere Grenze der Preisspanne.
  function priceOf(h, f) {
    const s = station();
    const apr = Math.ceil(f.adults / f.rooms);
    const planDates = f.checkIn === s.checkIn && f.checkOut === s.checkOut;
    const r = planDates && h.rates ? h.rates[apr] : null;
    if (r && r.price) return { value: r.price, exact: true, r };
    return { value: h.rangeMin, exact: false, r: null, why: !planDates ? "dates" : !h.rates ? "norate" : "none" };
  }

  // ---------- Formular ----------
  const DEFAULT_FILTERS = { priceMin: "", priceMax: "", minRating: "0", maxDist: "", minReviews: "0", type: "", query: "", sort: "popularity" };

  function loadForm() {
    let saved = {};
    try { saved = JSON.parse(GH.lsGet(FORM_KEY) || "{}"); } catch (e) { saved = {}; }
    return {
      stationId: saved.stationId && T.stations.some((s) => s.id === saved.stationId) ? saved.stationId : T.stations[0].id,
      adults: saved.adults || 2,
      rooms: saved.rooms || 1,
      dates: saved.dates || {}, // pro Station abweichender Zeitraum
      filters: { ...DEFAULT_FILTERS, ...(saved.filters || {}) },
    };
  }
  let form = loadForm();
  const persistForm = () => GH.lsSet(FORM_KEY, JSON.stringify(form));

  const station = () => T.stations.find((s) => s.id === form.stationId);
  function query() {
    const s = station();
    const d = form.dates[s.id] || {};
    return { checkIn: d.checkIn || s.checkIn, checkOut: d.checkOut || s.checkOut, adults: form.adults, rooms: form.rooms };
  }

  // ---------- Darstellung ----------
  let mounted = null;
  let hotels = [];           // Hotels der aktuellen Station
  let listFor = "";          // Station, für die hotels geladen sind
  let listState = "idle";    // idle | loading | ok | error
  let listError = "";
  let shown = PAGE_SIZE;

  function stars(r) {
    if (!r) return "";
    const full = Math.round(r * 2) / 2;
    return `<span class="h-stars" aria-label="${r} von 5">${"●".repeat(Math.floor(full))}${full % 1 ? "◐" : ""}${"○".repeat(5 - Math.ceil(full))}</span>`;
  }

  function describe(h, s) {
    const parts = [];
    if (h.type) parts.push(h.type);
    if (h.dist != null) parts.push(`${h.dist.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km bis ${s.hotelSearch.centerName}`);
    if (h.rating) parts.push(`TripAdvisor ${h.rating.toLocaleString("de-DE")}/5 aus ${h.reviews.toLocaleString("de-DE")} Bewertungen`);
    let text = parts.join(" · ") + ".";
    const extra = [...h.labels, ...h.mentions].slice(0, 6);
    if (extra.length) text += ` Gäste erwähnen: ${extra.join(", ")}.`;
    return text;
  }

  function filtered() {
    const f = form.filters, q = query();
    const pMin = parseFloat(f.priceMin), pMax = parseFloat(f.priceMax);
    const minRating = parseFloat(f.minRating) || 0, maxDist = parseFloat(f.maxDist), minReviews = parseInt(f.minReviews, 10) || 0;
    const needle = f.query.trim().toLowerCase();
    let list = hotels.filter((h) => {
      if (minRating && h.rating < minRating) return false;
      if (minReviews && h.reviews < minReviews) return false;
      if (!isNaN(maxDist) && (h.dist == null || h.dist > maxDist)) return false;
      if (f.type && h.type !== f.type) return false;
      if (needle && !h.name.toLowerCase().includes(needle)) return false;
      if (!isNaN(pMin) || !isNaN(pMax)) {
        const p = priceOf(h, q).value;
        if (p == null) return false;
        if (!isNaN(pMin) && p < pMin) return false;
        if (!isNaN(pMax) && p > pMax) return false;
      }
      return true;
    });
    const price = (h) => { const v = priceOf(h, q).value; return v == null ? Infinity : v; };
    const by = {
      popularity: (a, b) => a.rank - b.rank,
      price: (a, b) => price(a) - price(b),
      priceDesc: (a, b) => {
        const pa = price(a), pb = price(b);
        if (pa === Infinity || pb === Infinity) return (pa === Infinity) - (pb === Infinity);
        return pb - pa;
      },
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      distance: (a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity),
    }[f.sort] || ((a, b) => a.rank - b.rank);
    return list.sort(by);
  }

  function priceHtml(h, q) {
    const { esc } = U();
    const p = priceOf(h, q);
    const n = nightsBetween(q.checkIn, q.checkOut);
    if (p.exact) {
      return `<div class="h-price"><strong>${eur(p.value)}</strong><span>pro Nacht und Zimmer</span>
        <small>günstigstes von ${p.r.offers} Angebot${p.r.offers > 1 ? "en" : ""}, bei ${esc(p.r.provider)} · ${fmtDay(q.checkIn)}–${fmtDay(q.checkOut)}, ${n} Nächte</small></div>`;
    }
    const why = {
      dates: "Richtwert ohne Datum. Tagespreise gibt es nur für den Zeitraum laut Reiseplan.",
      norate: "Richtwert ohne Datum. Tagespreise werden für die beliebtesten und zentralsten Häuser geholt.",
      none: q.adults / q.rooms > 3 ? "Richtwert ohne Datum. Tagespreise gibt es für bis zu 3 Personen pro Zimmer." : "Richtwert ohne Datum, für den Zeitraum kein Tagespreis verfügbar.",
    }[p.why];
    const range = h.rangeMin ? `ca. ${eur(h.rangeMin)}${h.rangeMax && h.rangeMax > h.rangeMin ? `–${eur(h.rangeMax)}` : ""}` : "";
    if (range) {
      return `<div class="h-price"><strong>${range}</strong><span>pro Nacht und Zimmer</span><small>${why}</small></div>`;
    }
    return `<div class="h-price"><strong>–</strong><small>kein Preis verfügbar</small></div>`;
  }

  function itemHtml(h, s, q) {
    const { esc } = U();
    const cur = state.selections[s.id];
    const isSel = cur && cur.hotelKey === h.key;
    const p = priceOf(h, q);
    const canSave = !!GH.token() && !state.saving && p.value != null;
    const why = !GH.token() ? "Zum Übernehmen GitHub-Token hinterlegen (To-dos → Bearbeiten aktivieren)"
      : p.value == null ? "Ohne Preis kann das Hotel nicht übernommen werden" : "";
    return `
      <article class="h-item${isSel ? " selected" : ""}" data-key="${esc(h.key)}">
        ${h.image ? `<img class="h-img" src="${esc(h.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<div class="h-img h-img-empty">🏨</div>`}
        <div class="h-body">
          <h3><a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.name)} <span aria-hidden="true">↗</span></a></h3>
          <div class="h-meta">
            ${h.rating ? `${stars(h.rating)} <span>${h.rating.toLocaleString("de-DE")}</span> <span class="muted">(${h.reviews.toLocaleString("de-DE")})</span>` : `<span class="muted">noch keine Bewertung</span>`}
            ${h.dist != null ? `<span class="chip">📍 ${h.dist.toLocaleString("de-DE", { maximumFractionDigits: 1 })} km</span>` : ""}
          </div>
          <p class="small h-desc">${esc(describe(h, s))}</p>
          <a class="small" href="${esc(h.url)}" target="_blank" rel="noopener">Details, Fotos und Bewertungen ansehen ↗</a>
        </div>
        <div class="h-side">
          ${priceHtml(h, q)}
          ${isSel
            ? `<span class="h-chosen">✓ Im Reiseplan</span>`
            : `<button type="button" class="btn primary" data-act="choose" ${canSave ? "" : `disabled title="${esc(why)}"`}>In Reiseplan übernehmen</button>`}
        </div>
      </article>`;
  }

  function currentHtml(s) {
    const { esc, md } = U();
    const e = effective(s);
    const n = s.nights;
    const c = costRange(s);
    return `
      <div class="card h-current">
        <div>
          <div class="muted small">Im Reiseplan für ${esc(s.name)} (${esc(s.area)}) · ${n} Nächte</div>
          <h3 style="margin:.15rem 0 .2rem"><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.name)}</a>
            ${e.selected ? `<span class="badge sel">gewählt</span>` : `<span class="badge">Planvorschlag</span>`}</h3>
          <div class="small">${esc(e.priceText)} · gesamt ${c.fixed ? eur(c.min) : `${eur(c.min)}–${eur(c.max)}`}</div>
          ${e.selected && e.priceNote ? `<div class="small muted">${md(e.priceNote)}</div>` : ""}
        </div>
        ${e.selected ? `<button type="button" class="btn" data-act="reset" ${GH.token() && !state.saving ? "" : "disabled"}>Auf Planvorschlag zurücksetzen</button>` : ""}
      </div>`;
  }

  function syncHtml() {
    const { esc } = U();
    if (state.saving) return `<div class="todo-sync small"><span class="sync-dot busy"></span> Speichere Auswahl auf GitHub …</div>`;
    if (state.error) return `<div class="card todo-error" role="alert">${esc(state.error)}</div>`;
    if (!GH.token()) return `<div class="todo-sync small"><span class="sync-dot"></span> Nur ansehen. Zum Übernehmen in den Reiseplan einmalig unter <a href="#todos">To-dos → Bearbeiten aktivieren</a> den GitHub-Token hinterlegen.</div>`;
    return `<div class="todo-sync small"><span class="sync-dot ok"></span> Übernahme aktiv · Auswahl wird im Repository gespeichert</div>`;
  }

  function opt(v, label, cur) { return `<option value="${v}"${String(cur) === String(v) ? " selected" : ""}>${label}</option>`; }

  function shellHtml() {
    const { esc } = U();
    const s = station(), q = query(), f = form.filters;
    const n = nightsBetween(q.checkIn, q.checkOut);
    const types = [...new Set(hotels.map((h) => h.type).filter(Boolean))].sort();
    const custom = form.dates[s.id];
    const data = offers.get(s.id);
    const updated = data && data.updatedAt ? new Date(data.updatedAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" }) : "";
    return `
      <h1>🏨 Hotel-Konfigurator</h1>
      <p class="muted" style="max-width:72ch">Hotels für eine Station suchen, filtern und eines davon in den Reiseplan übernehmen. Pro Station gilt immer genau ein Hotel; eine neue Wahl ersetzt die bisherige. Stationsseiten, Transfers und Kosten passen sich automatisch an.</p>

      <form class="card h-form" id="hForm" onsubmit="return false">
        <div class="h-grid">
          <label class="span2">Station
            <select name="stationId">${T.stations.map((x) => opt(x.id, `${x.nr} · ${esc(x.name)} (${esc(x.area)}) · ${esc(x.dates)}`, s.id)).join("")}</select>
          </label>
          <label>Anreise<input type="date" name="checkIn" value="${q.checkIn}" min="${TRIP_MIN}" max="${TRIP_MAX}"></label>
          <label>Abreise<input type="date" name="checkOut" value="${q.checkOut}" min="${TRIP_MIN}" max="${TRIP_MAX}"></label>
          <label>Erwachsene<select name="adults">${[1, 2, 3, 4, 5, 6].map((v) => opt(v, v, form.adults)).join("")}</select></label>
          <label>Zimmer<select name="rooms">${[1, 2, 3].map((v) => opt(v, v, form.rooms)).join("")}</select></label>
        </div>
        <p class="small muted" style="margin:.6rem 0 0">${n > 0 ? `${n} Nächte` : "Abreise muss nach der Anreise liegen"}${custom ? ` · abweichend vom Reiseplan (${esc(s.dates)}) · <button type="button" class="btn-link" data-act="plan-dates">Zeitraum aus Reiseplan</button>` : " · Zeitraum laut Reiseplan"}</p>
      </form>

      <div id="hSync">${syncHtml()}</div>
      <div id="hCurrent">${currentHtml(s)}</div>

      <div class="card h-filters" id="hFilters">
        <div class="h-grid">
          <label>Preis ab (€/Nacht)<input type="number" name="priceMin" min="0" step="10" inputmode="numeric" placeholder="beliebig" value="${esc(f.priceMin)}"></label>
          <label>Preis bis (€/Nacht)<input type="number" name="priceMax" min="0" step="10" inputmode="numeric" placeholder="beliebig" value="${esc(f.priceMax)}"></label>
          <label>Bewertung ab
            <select name="minRating">${[["0", "alle"], ["3.5", "3,5 ★"], ["4", "4,0 ★"], ["4.5", "4,5 ★"], ["5", "5,0 ★"]].map(([v, l]) => opt(v, l, f.minRating)).join("")}</select>
          </label>
          <label>Lage: höchstens
            <select name="maxDist">${[["", "egal"], ["0.5", "500 m"], ["1", "1 km"], ["2", "2 km"], ["3", "3 km"], ["5", "5 km"], ["10", "10 km"]].map(([v, l]) => opt(v, l, f.maxDist)).join("")}</select>
          </label>
          <label>Anzahl Bewertungen
            <select name="minReviews">${[["0", "egal"], ["50", "ab 50"], ["200", "ab 200"], ["500", "ab 500"], ["1000", "ab 1.000"]].map(([v, l]) => opt(v, l, f.minReviews)).join("")}</select>
          </label>
          <label>Unterkunftsart
            <select name="type">${opt("", "alle", f.type)}${types.map((t) => opt(esc(t), esc(t), f.type)).join("")}</select>
          </label>
          <label>Name enthält<input type="search" name="query" placeholder="z. B. Shilla" value="${esc(f.query)}"></label>
          <label>Sortieren nach
            <select name="sort">${[["popularity", "Beliebtheit"], ["price", "Preis aufsteigend"], ["priceDesc", "Preis absteigend"], ["rating", "Bewertung"], ["distance", "Nähe zum Zentrum"]].map(([v, l]) => opt(v, l, f.sort)).join("")}</select>
          </label>
        </div>
        <p class="small muted" style="margin:.6rem 0 0">Lage = Luftlinie zum Bezugspunkt <strong>${esc(s.hotelSearch.centerName)}</strong>. Preise pro Nacht und Zimmer inkl. Steuern, soweit der Anbieter sie nennt. <button type="button" class="btn-link" data-act="clear">Filter zurücksetzen</button></p>
      </div>

      <div id="hResults"></div>
      <p class="small muted">Hoteldaten und Preise: <a href="https://xotelo.com" target="_blank" rel="noopener">Xotelo</a> (TripAdvisor)${updated ? `, Stand ${updated}` : ""}. Preisspannen ohne Datum sind aus US-Dollar umgerechnet (1 $ ≈ ${USD_EUR.toLocaleString("de-DE")} €). Vor der Buchung den Preis beim Anbieter prüfen.</p>
      <dialog class="todo-dialog" id="hDialog"></dialog>`;
  }

  function renderResults() {
    if (!alive()) return;
    const el = mounted.querySelector("#hResults");
    const { esc } = U();
    const s = station(), q = query();
    if (listState === "loading") { el.innerHTML = `<p class="muted">Lade Hotels für ${esc(s.name)} …</p>`; return; }
    if (listState === "error") {
      el.innerHTML = `<div class="card todo-error" role="alert">${esc(listError)} <button type="button" class="btn-link" data-act="retry">Erneut versuchen</button></div>`;
      return;
    }
    if (nightsBetween(q.checkIn, q.checkOut) <= 0) { el.innerHTML = `<div class="card todo-error">Bitte einen gültigen Zeitraum wählen.</div>`; return; }
    const list = filtered();
    const page = list.slice(0, shown);
    el.innerHTML = `
      <div class="h-count"><strong>${list.length}</strong> von ${hotels.length} Unterkünften passen</div>
      ${page.length ? `<div class="h-list">${page.map((h) => itemHtml(h, s, q)).join("")}</div>`
        : `<div class="card soon-card"><p style="margin:0">Keine Unterkunft passt zu den Filtern. Filter lockern oder <button type="button" class="btn-link" data-act="clear">zurücksetzen</button>.</p></div>`}
      ${list.length > shown ? `<div style="text-align:center;margin-top:1rem"><button type="button" class="btn" data-act="more">Weitere ${Math.min(PAGE_SIZE, list.length - shown)} anzeigen</button></div>` : ""}`;
  }

  function renderStatus() {
    if (!alive()) return;
    mounted.querySelector("#hSync").innerHTML = syncHtml();
    mounted.querySelector("#hCurrent").innerHTML = currentHtml(station());
    renderResults();
  }

  function renderAll() {
    if (!alive()) return;
    mounted.innerHTML = shellHtml();
    renderResults();
  }

  const alive = () => mounted && document.body.contains(mounted);

  async function ensureList() {
    const s = station();
    if (listFor === s.id && listState !== "error") return;
    listFor = s.id; listState = "loading"; hotels = []; shown = PAGE_SIZE;
    renderAll();
    try {
      const h = await loadHotels(s);
      if (listFor !== s.id) return;
      hotels = h.hotels; listState = "ok";
    } catch (e) {
      if (listFor !== s.id) return;
      listState = "error"; listError = e.message || String(e);
    }
    renderAll(); // Unterkunftsarten im Filter aktualisieren
  }

  // ---------- Übernehmen ----------
  function confirmChoose(h) {
    const { esc } = U();
    const s = station(), q = query();
    const p = priceOf(h, q);
    const cur = effective(s);
    const total = p.value * form.rooms * s.nights;
    const dlg = mounted.querySelector("#hDialog");
    dlg.innerHTML = `
      <form method="dialog" class="todo-form">
        <h2>Hotel übernehmen</h2>
        <p style="margin:0"><strong>${esc(h.name)}</strong> wird das Hotel für <strong>${esc(s.name)} (${esc(s.area)})</strong> und ersetzt <em>${esc(cur.name)}</em>.</p>
        <p class="small" style="margin:0">${p.exact ? "" : "ca. "}${eur(p.value)} pro Nacht und Zimmer × ${form.rooms} Zimmer × ${s.nights} Nächte = <strong>${p.exact ? "" : "ca. "}${eur(total)}</strong></p>
        ${nightsBetween(q.checkIn, q.checkOut) !== s.nights ? `<p class="small muted" style="margin:0">Der gesuchte Zeitraum weicht vom Reiseplan ab; die Kosten werden mit den ${s.nights} Nächten des Reiseplans gerechnet.</p>` : ""}
        <div class="form-actions">
          <button type="button" class="btn" data-close>Abbrechen</button>
          <button type="submit" class="btn primary">Übernehmen</button>
        </div>
      </form>`;
    dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
    dlg.querySelector("form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      dlg.close();
      const today = new Date().toLocaleDateString("de-DE");
      select(s, {
        hotelKey: h.key,
        name: h.name,
        url: h.url,
        image: h.image,
        text: describe(h, s),
        pricePerNight: Math.round(p.value),
        estimate: !p.exact,
        priceSource: p.exact
          ? `Tagespreis bei ${p.r.provider} für ${fmtDay(q.checkIn)}–${fmtDay(q.checkOut)}, abgerufen am ${today}`
          : `Richtwert ohne Datum (TripAdvisor), abgerufen am ${today}`,
        rooms: form.rooms,
        adults: form.adults,
        checkIn: q.checkIn,
        checkOut: q.checkOut,
        rating: h.rating,
        reviews: h.reviews,
        distanceKm: h.dist != null ? Math.round(h.dist * 10) / 10 : null,
        selectedAt: new Date().toISOString(),
      });
    });
    dlg.showModal();
  }

  // ---------- Ereignisse ----------
  function onInput(ev) {
    const t = ev.target;
    if (!t.name) return;
    if (t.closest("#hFilters")) {
      form.filters[t.name] = t.value;
      shown = PAGE_SIZE;
      persistForm();
      renderResults();
    }
  }

  function onChange(ev) {
    const t = ev.target;
    if (!t.name) return;
    if (!t.closest("#hForm")) return;
    const s = station();
    if (t.name === "stationId") {
      form.stationId = t.value;
      persistForm();
      if (location.hash !== `#hotels/${t.value}`) history.replaceState(null, "", `#hotels/${t.value}`);
      ensureList();
      return;
    }
    if (t.name === "adults" || t.name === "rooms") {
      form[t.name] = parseInt(t.value, 10) || 1;
      if (form.rooms > form.adults) form.rooms = form.adults;
    }
    if (t.name === "checkIn" || t.name === "checkOut") {
      const q = query();
      const d = { checkIn: q.checkIn, checkOut: q.checkOut, [t.name]: t.value };
      if (!d.checkIn || !d.checkOut) return;
      form.dates[s.id] = d.checkIn === s.checkIn && d.checkOut === s.checkOut ? undefined : d;
      if (!form.dates[s.id]) delete form.dates[s.id];
    }
    persistForm();
    shown = PAGE_SIZE;
    renderAll();
  }

  function onClick(ev) {
    const b = ev.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "more") { shown += PAGE_SIZE; renderResults(); }
    else if (act === "retry") { offers.delete(station().id); listFor = ""; ensureList(); }
    else if (act === "clear") { form.filters = { ...DEFAULT_FILTERS }; persistForm(); shown = PAGE_SIZE; renderAll(); }
    else if (act === "plan-dates") { delete form.dates[station().id]; persistForm(); renderAll(); }
    else if (act === "reset") {
      const s = station();
      if (confirm(`Für ${s.name} (${s.area}) wieder den Planvorschlag „${s.hotel.name}“ verwenden?`)) reset(s);
    } else if (act === "choose") {
      const key = b.closest(".h-item").dataset.key;
      const h = hotels.find((x) => x.key === key);
      if (h) confirmChoose(h);
    }
  }

  // ---------- Öffentliche Schnittstelle ----------
  window.Hotels = {
    state,
    load,
    effective,
    costRange,
    eur,
    subscribe(fn) { listeners.push(fn); },
    mount(el, stationId) {
      if (stationId && T.stations.some((s) => s.id === stationId)) { form.stationId = stationId; persistForm(); }
      mounted = document.createElement("div");
      mounted.className = "hotels";
      el.innerHTML = "";
      el.appendChild(mounted);
      mounted.addEventListener("input", onInput);
      mounted.addEventListener("change", onChange);
      mounted.addEventListener("click", onClick);
      if (listFor !== form.stationId) ensureList(); else renderAll();
    },
  };

  listeners.push(renderStatus);
  GH.onTokenChange(load);
  load();
})();
