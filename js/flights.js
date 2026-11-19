// Flugsuche.
// Flugdaten kommen von der GitHub Action "Flugdaten aktualisieren" (.github/workflows/flight-offers.yml):
//   data/flight-offers/longhaul.json   wöchentliches Raster Langstrecke (Business, Abflug laut Plan ±3 Tage)
//   data/flight-offers/domestic.json   Inlandsflüge am Reisetag laut Plan
//   data/flight-search/results/<id>.json  Ergebnisse von Suchen, die die Seite in Auftrag gibt
// Suchaufträge schreibt die Seite in data/flight-search/requests.json; das startet die Action.
// Die Auswahl liegt in data/flights.json (Langstrecke, Inlandsflüge und die Verschiebung des Plans)
// und wird wie To-dos und Hotels über GitHub gespeichert.
(function () {
  "use strict";

  const GH = window.GitHubStore;
  const T = window.TRIP;
  const Plan = window.Plan;
  const PATH = "data/flights.json";
  const REQ = "data/flight-search/requests.json";
  const RESULTS = "data/flight-search/results";
  const OFFERS = "data/flight-offers";
  const FORM_KEY = "suedkorea-flight-form";
  const SEARCHES_KEY = "suedkorea-flight-searches";
  const POLL_MS = 10000;
  const POLL_MAX_MS = 8 * 60 * 1000;
  const TRAV = T.travellers || 2;
  const S = T.flights.search;
  const ROUTES = T.flights.domesticRoutes || [];

  const U = () => window.TripUtil; // esc, md aus app.js
  const L = (hd, kp) => window.Theme.t(hd, kp);
  const eur = (n) => `${Math.round(n).toLocaleString("de-DE")} €`;

  // ---------- Namen und Formate ----------
  const AIRPORTS = {
    FRA: "Frankfurt", DUS: "Düsseldorf", CGN: "Köln/Bonn", MUC: "München", ICN: "Incheon", GMP: "Gimpo",
    CJU: "Jeju", PUS: "Busan-Gimhae", HEL: "Helsinki", IST: "Istanbul", DOH: "Doha", DXB: "Dubai",
    AMS: "Amsterdam", CDG: "Paris", LHR: "London", WAW: "Warschau", VIE: "Wien", ZRH: "Zürich",
    PEK: "Peking", PVG: "Shanghai", HND: "Tokio-Haneda", NRT: "Tokio-Narita", AUH: "Abu Dhabi",
  };
  const apName = (c) => AIRPORTS[c] || c;
  const CLASSES = () => [["economy", "Economy"], ["premium", "Premium Economy"], ["business", "Business"], ["first", "First"]];
  const clsName = (c) => (CLASSES().find((x) => x[0] === c) || [c, c])[1];
  const STOPS = () => [["any", L("beliebig", "egal")], ["0", "nonstop"], ["1", L("höchstens 1 Stopp", "hechschdens 1 Stopp")], ["2", L("höchstens 2 Stopps", "hechschdens 2 Stopps")]];
  const hm = (dt) => String(dt || "").slice(11, 16);
  const dateOf = (dt) => String(dt || "").slice(0, 10);
  const dur = (min) => { if (!min) return ""; const h = Math.floor(min / 60), m = min % 60; return `${h} Std.${m ? ` ${m} Min.` : ""}`; };
  const stopsText = (n) => (n === 0 ? "nonstop" : L(`${n} Stopp${n > 1 ? "s" : ""}`, `${n} Stopp${n > 1 ? "s" : ""}`));
  const stopsTextHd = (n) => (n === 0 ? "nonstop" : `${n} Stopp${n > 1 ? "s" : ""}`);
  const plusDays = (seg) => Plan.diff(dateOf(seg.dep), dateOf(seg.arr));
  const codeOf = (seg) => (seg.codes || []).join(" + ");
  const total = (o) => (o && o.pricePP != null ? o.pricePP * TRAV : null);
  const signed = (n) => (n > 0 ? `+${n}` : String(n));

  // ---------- Auswahl (data/flights.json) ----------
  const EMPTY = { version: 1, plan: { shift: 0, late: 0, mode: "first" }, longhaul: null, domestic: {} };
  const state = { sel: JSON.parse(JSON.stringify(EMPTY)), loaded: false, saving: false, error: "" };
  const listeners = [];
  function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

  function normalize(d) {
    const x = { ...JSON.parse(JSON.stringify(EMPTY)), ...(d || {}) };
    x.plan = Plan.clean(x.plan);
    x.domestic = x.domestic || {};
    return x;
  }

  // Angaben zum gewählten Flug für die Platzhalter {flight:…} in den Texten
  function flightInfo(o) {
    if (!o || !o.outbound || !o.return) return null;
    const out = o.outbound, ret = o.return;
    return {
      outCode: codeOf(out), retCode: codeOf(ret), codes: `${codeOf(out)} / ${codeOf(ret)}`,
      outDep: hm(out.dep), outArr: hm(out.arr), retDep: hm(ret.dep), retArr: hm(ret.arr),
      outFromName: apName(out.from), outToName: apName(out.to), retFromName: apName(ret.from), retToName: apName(ret.to),
      outStops: () => stopsText(out.stops),
    };
  }

  function apply() {
    Plan.setFlightInfo(flightInfo(state.sel.longhaul));
    Plan.configure(state.sel.plan);
  }

  async function load() {
    try {
      const { data } = await GH.readJson(PATH);
      state.sel = normalize(data);
      state.loaded = true;
      state.error = "";
    } catch (e) {
      state.error = `${L("Die Flugauswahl konnte nicht geladen werden", "Die Fliegerauswahl hot net gelade werre kenne")}: ${e.message || e}`;
    }
    apply();
    notify();
  }

  async function save(change, message) {
    state.saving = true; state.error = "";
    const before = state.sel;
    state.sel = normalize(JSON.parse(JSON.stringify(before)));
    change(state.sel);
    apply(); notify();
    try {
      const res = await GH.updateJson(PATH, (data) => { const x = normalize(data); change(x); return x; }, message);
      state.sel = normalize(res.data);
      return true;
    } catch (e) {
      state.sel = before;
      state.error = `${L("Nicht gespeichert", "Net gspeichert")}: ${e.message || e}`;
      return false;
    } finally {
      state.saving = false; apply(); notify();
    }
  }

  // Gewählter Inlandsflug, solange er zum Reisetag laut Plan passt
  function routeDate(r) { const st = T.stations.find((s) => s.id === r.after); return st ? st.checkOut : null; }
  function domesticSel(r) { return state.sel.domestic[r.id] || null; }
  function domesticValid(r) { const d = domesticSel(r); return d && dateOf(d.outbound.dep) === routeDate(r) ? d : null; }

  // ---------- Kosten (für app.js) ----------
  function costFlights(row) {
    const o = state.sel.longhaul;
    if (o && o.pricePP != null) {
      const v = total(o);
      return { ...row, min: v, max: v, fixed: true,
        label: `${L("Flüge", "Flieg")} ${clsName(o.cls || "business")} ${o.outbound.from}–${o.outbound.to} ${L("hin/zurück", "hie un zurick")} (${codeOf(o.outbound)} / ${codeOf(o.return)}, ${L("gewählt", "ausgsucht")})` };
    }
    return row;
  }
  function costTransport(row) {
    let min = row.min, max = row.max, chosen = 0;
    ROUTES.forEach((r) => {
      const d = domesticValid(r);
      if (d && d.pricePP != null) chosen++;
    });
    if (!chosen) return row;
    const sum = ROUTES.reduce((n, r) => { const d = domesticValid(r); return n + (d && d.pricePP != null ? total(d) : 0); }, 0);
    // Anteil der Inlandsflüge im Richtwert nur für die gewählten Flüge ersetzen
    const share = chosen / ROUTES.length;
    min = min - (row.domesticMin || 0) * share + sum;
    max = max - (row.domesticMax || 0) * share + sum;
    return { ...row, min, max, label: `${row.label} (${L(`${chosen} von ${ROUTES.length} Inlandsflügen gewählt`, `${chosen} vun ${ROUTES.length} Inlandsflieg ausgsucht`)})` };
  }

  // ---------- Formular ----------
  const DEFAULTS = {
    tab: "longhaul", date: "", flex: true, origins: ["FRA"], destinations: ["ICN"], cls: "business",
    stops: "any", airlines: "", maxPrice: "", depFrom: "0", depTo: "23", maxDur: "", sort: "price",
    source: "grid", day: "", dcls: "economy",
  };
  function loadForm() {
    let saved = {};
    try { saved = JSON.parse(GH.lsGet(FORM_KEY) || "{}"); } catch (e) { saved = {}; }
    return { ...DEFAULTS, ...saved };
  }
  let form = loadForm();
  const persist = () => GH.lsSet(FORM_KEY, JSON.stringify(form));
  const formDate = () => form.date || Plan.dates().dep;

  function searches() { try { return JSON.parse(GH.lsGet(SEARCHES_KEY) || "[]"); } catch (e) { return []; } }
  function remember(entry) { GH.lsSet(SEARCHES_KEY, JSON.stringify([entry, ...searches().filter((x) => x.id !== entry.id)].slice(0, 12))); }

  // ---------- Daten laden ----------
  let grid = null, gridState = "idle", gridError = "";
  let domData = null;
  let index = null;
  const results = new Map();  // Auftrags-ID → Ergebnis
  const pending = new Map();  // Auftrags-ID → { kind, started, offerId?, routeId? }
  const returnReq = new Map(); // Angebots-ID → Auftrags-ID (Rückflüge)

  async function fetchJson(path) {
    const res = await fetch(`${path}?t=${Math.floor(Date.now() / 60000)}`, { cache: "no-cache" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  }
  async function loadData() {
    gridState = "loading"; render();
    try {
      [grid, domData, index] = await Promise.all([fetchJson(`${OFFERS}/longhaul.json`), fetchJson(`${OFFERS}/domestic.json`), fetchJson(`${OFFERS}/index.json`)]);
      gridState = "ok";
    } catch (e) {
      gridState = "error"; gridError = e.message || String(e);
    }
    render();
  }

  async function readResult(id) {
    try {
      const { data } = await GH.readJson(`${RESULTS}/${id}.json`);
      return data;
    } catch (e) {
      if (e.status === 404 || /404|nicht gefunden|net zu finne/i.test(e.message || "")) return null;
      throw e;
    }
  }

  function poll(id) {
    const p = pending.get(id);
    if (!p) return;
    setTimeout(async () => {
      try {
        const r = await readResult(id);
        if (r) { results.set(id, r); pending.delete(id); render(); return; }
      } catch (e) { /* weiter versuchen */ }
      if (Date.now() - p.started > POLL_MAX_MS) {
        pending.delete(id);
        results.set(id, { id, status: "error", error: L("Keine Antwort von der GitHub Action. Unter Actions → „Flugdaten aktualisieren“ nachsehen, ob sie läuft.", "Kää Antwort vun de GitHub Action. Gugg unner Actions → „Flugdaten aktualisieren“, ob se lafft.") });
        render(); return;
      }
      render();
      poll(id);
    }, POLL_MS);
  }

  async function ensureResult(id) {
    if (results.has(id) || pending.has(id)) return;
    try {
      const r = await readResult(id);
      if (r) { results.set(id, r); render(); }
      else { pending.set(id, { kind: "search", started: Date.now() }); poll(id); render(); }
    } catch (e) { results.set(id, { id, status: "error", error: e.message || String(e) }); render(); }
  }

  // Suchauftrag speichern (startet die Action)
  async function request(kind, params, extra) {
    const id = `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = new Date().toISOString();
    const label = kind === "return" ? "Rückflüge" : `${params.origins.join("/")} → ${params.destinations.join("/")} ${Plan.fmt.d(params.date)}${params.flex ? " ±3" : ""}, ${clsName(params.cls)}`;
    state.error = "";
    try {
      await GH.updateJson(REQ, (data) => {
        const list = ((data && data.requests) || []).filter((r) => Date.now() - new Date(r.createdAt).getTime() < 7 * 86400000);
        list.push({ id, kind, createdAt, params, ...(extra || {}) });
        return { version: 1, requests: list };
      }, `Flugsuche: ${label}`);
    } catch (e) {
      state.error = `${L("Suche konnte nicht gestartet werden", "Die Such hot net gstartet werre kenne")}: ${e.message || e}`;
      render();
      return null;
    }
    pending.set(id, { kind, started: Date.now() });
    if (kind === "search") remember({ id, label, createdAt, scope: params.tripDays ? "longhaul" : "domestic" });
    poll(id);
    return id;
  }

  // ---------- Filtern ----------
  const codesFrom = (txt) => String(txt || "").toUpperCase().split(/[\s,;]+/).filter((x) => /^[A-Z0-9]{2}$/.test(x));
  function legOk(seg, f, air) {
    if (!seg) return true;
    if (f.stops !== "any" && seg.stops > Number(f.stops)) return false;
    if (air.length && !seg.codes.every((c) => air.some((a) => c.startsWith(a)))) return false;
    if (f.maxDur && seg.duration > parseFloat(f.maxDur) * 60) return false;
    return true;
  }
  function filterOffers(list, opts) {
    const f = form, air = codesFrom(f.airlines);
    const maxP = parseFloat(f.maxPrice);
    const from = parseInt(f.depFrom, 10) || 0, to = parseInt(f.depTo, 10); const toH = isNaN(to) ? 23 : to;
    let out = list.filter((o) => {
      if (opts.longhaul) {
        if (f.origins.length && !f.origins.includes(o.outbound.from)) return false;
        if (f.destinations.length && !f.destinations.includes(o.outbound.to)) return false;
      }
      if (!legOk(o.outbound, f, air) || !legOk(o.return, f, air)) return false;
      const h = parseInt(hm(o.outbound.dep), 10);
      if (h < from || h > toH) return false;
      if (!isNaN(maxP)) { const t = total(o); if (t == null || t > maxP) return false; }
      return true;
    });
    const price = (o) => (o.pricePP == null ? Infinity : o.pricePP);
    const by = {
      price: (a, b) => price(a) - price(b),
      duration: (a, b) => (a.outbound.duration + (a.return ? a.return.duration : 0)) - (b.outbound.duration + (b.return ? b.return.duration : 0)),
      departure: (a, b) => a.outbound.dep.localeCompare(b.outbound.dep),
      stops: (a, b) => a.outbound.stops - b.outbound.stops || price(a) - price(b),
    }[f.sort] || ((a, b) => price(a) - price(b));
    return out.sort(by);
  }

  // Angebote der gewählten Quelle (Raster oder Suchergebnis) als { date: { offers, meta } }
  function sourceDates() {
    if (form.source === "grid") {
      if (!grid) return { dates: {}, meta: null };
      return { dates: grid.dates || {}, meta: { tripDays: grid.tripDays, params: grid.params, updatedAt: grid.updatedAt, kind: "grid" } };
    }
    const r = results.get(form.source);
    if (!r) return { dates: {}, meta: null };
    return { dates: r.dates || {}, meta: { tripDays: r.params && r.params.tripDays, params: r.params, updatedAt: r.finishedAt, kind: "search", result: r } };
  }

  // ---------- Darstellung ----------
  let mounted = null;
  const alive = () => mounted && document.body.contains(mounted);

  function opt(v, label, cur) { return `<option value="${v}"${String(cur) === String(v) ? " selected" : ""}>${label}</option>`; }

  function segHtml(seg, label) {
    const { esc } = U();
    const p = plusDays(seg);
    const lay = (seg.layovers || []).map((l) => `${apName(l.airport)} ${dur(l.duration)}${l.overnight ? L(" über Nacht", " iwwer Nacht") : ""}`).join(", ");
    return `
      <div class="f-seg">
        <div class="f-seg-label">${esc(label)} · ${esc(Plan.fmt.wd(dateOf(seg.dep)))}</div>
        <div class="flight">
          <div class="end"><strong>${esc(hm(seg.dep))}</strong><span>${esc(seg.from)} · ${esc(apName(seg.from))}</span></div>
          <div class="mid">${esc(dur(seg.duration))}<div class="line"></div>${esc(stopsText(seg.stops))}</div>
          <div class="end r"><strong>${esc(hm(seg.arr))}${p > 0 ? `<sup>+${p}</sup>` : ""}</strong><span>${esc(seg.to)} · ${esc(apName(seg.to))}</span></div>
        </div>
        <div class="small muted">${esc(seg.airlines.join(", "))} · ${esc(codeOf(seg))}${lay ? ` · ${L("Umstieg", "Umschdeische")}: ${esc(lay)}` : ""}</div>
      </div>`;
  }

  // Wie sich der Plan mit diesem Angebot verschieben würde
  function planEffect(o) {
    const shift = Plan.diff(Plan.BASE.dep, dateOf(o.outbound.dep));
    const late = Math.max(0, Plan.diff(Plan.add(dateOf(o.outbound.dep), 1), dateOf(o.outbound.arr)));
    const cur = state.sel.plan;
    return { shift, late, changes: shift !== cur.shift || late !== cur.late };
  }

  function priceBlock(o, note) {
    const t = total(o);
    if (t == null) return `<div class="h-price"><strong>–</strong><small>${L("Preis erst auf der Buchungsseite", "Breis erschd uff de Buchungsseit")}</small></div>`;
    return `<div class="h-price"><strong>${eur(t)}</strong><span>${L(`für ${TRAV} Personen`, `fer ${TRAV} Leit`)}${note ? ` · ${note}` : ""}</span><small>${eur(o.pricePP)} ${L("pro Person", "pro Persoon")}</small></div>`;
  }

  function offerHtml(o, meta) {
    const { esc } = U();
    const cur = state.sel.longhaul;
    const isSel = cur && cur.id === o.id;
    const eff = planEffect(o);
    const chips = [];
    if (eff.shift) chips.push(`<span class="chip f-shift">📅 ${L(`Plan ${signed(eff.shift)} Tag${Math.abs(eff.shift) > 1 ? "e" : ""}`, `Blan ${signed(eff.shift)} Daach`)}</span>`);
    if (eff.late) chips.push(`<span class="chip f-late">⏱ ${L(`Ankunft ${eff.late} Tag${eff.late > 1 ? "e" : ""} später`, `Ookunft ${eff.late} Daach schbäder`)}</span>`);
    const canSave = !!GH.token() && !state.saving;
    const why = L("Zum Übernehmen GitHub-Token hinterlegen (To-dos → Bearbeiten aktivieren)", "Zum Iwwernemme GitHub-Token hinnerlege (To-dos → Bearbeide oschalde)");
    let action;
    if (isSel) action = `<span class="h-chosen">✓ ${L("Im Reiseplan", "Im Reiseblan")}</span>`;
    else if (o.return) action = `<button type="button" class="btn primary" data-act="choose" ${canSave && o.pricePP != null ? "" : `disabled title="${esc(o.pricePP == null ? L("Ohne Preis kann der Flug nicht übernommen werden", "Ohne Breis kann mer de Flug net iwwernemme") : why)}"`}>${L("In Reiseplan übernehmen", "In de Reiseblan iwwernemme")}</button>`;
    else if (o.departureToken) {
      const rid = returnReq.get(o.id);
      const busy = rid && pending.has(rid);
      action = `<button type="button" class="btn" data-act="returns" ${canSave && !busy ? "" : `disabled title="${esc(busy ? L("Wird gesucht …", "Werd gsucht …") : why)}"`}>${busy ? L("Rückflüge werden gesucht …", "Rickflieg werre gsucht …") : L("Rückflüge anzeigen", "Rickflieg zeige")}</button>
        <small class="muted">${L("braucht 1 Abfrage", "braucht 1 Abfrog")}</small>`;
    } else action = "";
    const rid = returnReq.get(o.id);
    const rr = rid && results.get(rid);
    return `
      <article class="h-item f-item${isSel ? " selected" : ""}" data-id="${esc(o.id)}">
        <div class="h-body">
          ${segHtml(o.outbound, L("Hinflug", "Hieflug"))}
          ${o.return ? segHtml(o.return, L("Rückflug", "Rickflug")) : `<p class="small muted" style="margin:.4rem 0 0">${L(`Rückflug am ${Plan.fmt.wd(Plan.add(dateOf(o.outbound.dep), meta.tripDays || Plan.BASE.days))}; Preis gilt für Hin- und Rückflug.`, `Rickflug am ${Plan.fmt.wd(Plan.add(dateOf(o.outbound.dep), meta.tripDays || Plan.BASE.days))}; de Breis gilt fer hie un zurick.`)}</p>`}
          ${chips.length ? `<div class="chips" style="margin-top:.5rem">${chips.join("")}</div>` : ""}
        </div>
        <div class="h-side">
          ${priceBlock(o, L("hin und zurück", "hie un zurick"))}
          ${action}
        </div>
        ${rr ? returnsHtml(o, rr, meta) : ""}
      </article>`;
  }

  function returnsHtml(o, r, meta) {
    const { esc } = U();
    if (r.status !== "ok") return `<div class="f-returns"><div class="card todo-error">${esc(r.error || L("Fehler", "Fehler"))}</div></div>`;
    const list = filterOffers(r.offers || [], { longhaul: false });
    if (!list.length) return `<div class="f-returns"><p class="small muted">${L("Keine passenden Rückflüge gefunden.", "Kää bassende Rickflieg gfunne.")}</p></div>`;
    return `<div class="f-returns"><h4>${L("Rückflüge zu diesem Hinflug", "Rickflieg zu dem Hieflug")}</h4>${list.slice(0, 12).map((x) => offerHtml(x, meta)).join("")}</div>`;
  }

  function currentHtml() {
    const { esc } = U();
    const o = state.sel.longhaul;
    const pl = state.sel.plan;
    const d = Plan.dates();
    if (!o) {
      return `
        <div class="card h-current"><div>
          <div class="muted small">${L("Im Reiseplan", "Im Reiseblan")} · ${esc(Plan.fmt.wd(d.dep))} – ${esc(Plan.fmt.wd(d.ret))}</div>
          <h3 style="margin:.15rem 0 .2rem">${esc(T.flights.planInfo.codes)} <span class="badge">${L("Planvorschlag", "Blanvorschlach")}</span></h3>
          <div class="small">${L("Richtwert", "So ungefähr")}: ${esc(T.flights.longhaul[0][4])} ${L("pro Person", "pro Persoon")}</div>
        </div></div>`;
    }
    return `
      <div class="card h-current">
        <div>
          <div class="muted small">${L("Im Reiseplan", "Im Reiseblan")} · ${esc(Plan.fmt.wd(d.dep))} – ${esc(Plan.fmt.wd(d.ret))}${pl.shift ? ` · ${L(`Plan um ${signed(pl.shift)} Tage verschoben`, `Blan um ${signed(pl.shift)} Dääch verschowe`)}` : ""}</div>
          <h3 style="margin:.15rem 0 .2rem">${esc(codeOf(o.outbound))} / ${esc(codeOf(o.return))} <span class="badge sel">${L("gewählt", "ausgsucht")}</span></h3>
          <div class="small">${esc(clsName(o.cls || "business"))} · ${esc(o.outbound.airlines.join(", "))} · ${eur(total(o))} ${L(`für ${TRAV} Personen`, `fer ${TRAV} Leit`)} (${eur(o.pricePP)} p. P.)</div>
          ${o.priceSource ? `<div class="small muted">${esc(o.priceSource)}</div>` : ""}
        </div>
        <button type="button" class="btn" data-act="reset" ${GH.token() && !state.saving ? "" : "disabled"}>${L("Auf Planvorschlag zurücksetzen", "Zurück uff de Blanvorschlach")}</button>
      </div>`;
  }

  function syncHtml() {
    const { esc } = U();
    if (state.saving) return `<div class="todo-sync small"><span class="sync-dot busy"></span> ${L("Speichere Auswahl auf GitHub …", "Schbeicher die Auswahl uff GitHub …")}</div>`;
    if (state.error) return `<div class="card todo-error" role="alert">${esc(state.error)}</div>`;
    if (!GH.token()) return `<div class="todo-sync small"><span class="sync-dot"></span> ${L(`Nur ansehen. Für neue Suchen und zum Übernehmen einmalig unter <a href="#todos">To-dos → Bearbeiten aktivieren</a> den GitHub-Token hinterlegen.`, `Nur gugge. Fer neie Suche un zum Iwwernemme ämol unner <a href="#todos">To-dos → Bearbeide oschalde</a> de GitHub-Token hinnerlege.`)}</div>`;
    return `<div class="todo-sync small"><span class="sync-dot ok"></span> ${L("Suche und Übernahme aktiv · Auswahl wird im Repository gespeichert", "Suche un Iwwernemme geht · die Auswahl landet im Repository")}</div>`;
  }

  function quotaHtml() {
    const { esc } = U();
    if (!index || !index.serpapi) return "";
    const s = index.serpapi;
    if (!s.active) return `<span>SerpApi: ${esc(s.problem || L("nicht aktiv", "net aktiv"))} ${L("Ersatzquelle fli wird verwendet.", "Ersatzquell fli werd gnumme.")}</span>`;
    return s.left != null ? `<span>SerpApi: ${L(`noch ${s.left} Abfragen`, `noch ${s.left} Abfroge`)}${s.perMonth ? ` ${L(`von ${s.perMonth} im Monat`, `vun ${s.perMonth} im Monat`)}` : ""}</span>` : "";
  }

  function tabsHtml() {
    return `<div class="tabs" role="tablist">
      <button class="tab" role="tab" data-tabsel="longhaul" aria-selected="${form.tab === "longhaul"}">✈️ ${L("Langstrecke", "Langstreck")}</button>
      <button class="tab" role="tab" data-tabsel="domestic" aria-selected="${form.tab === "domestic"}">🛫 ${L("Inlandsflüge", "Inlandsflieg")}</button>
    </div>`;
  }

  function filtersHtml(longhaul) {
    const { esc } = U();
    const f = form;
    return `
      <div class="card h-filters" id="fFilters">
        <div class="h-grid">
          <label>Stopps<select name="stops">${STOPS().map(([v, l]) => opt(v, l, f.stops)).join("")}</select></label>
          <label>Airlines <span class="muted small">(IATA, z. B. LH, KE)</span><input name="airlines" placeholder="${L("alle", "all")}" value="${esc(f.airlines)}"></label>
          <label>${L("Höchstpreis gesamt (€)", "Hechschdbreis alles zamme (€)")}<input type="number" name="maxPrice" min="0" step="100" inputmode="numeric" placeholder="${L("beliebig", "egal")}" value="${esc(f.maxPrice)}"></label>
          <label>${L("Abflug ab", "Abflug ab")}<select name="depFrom">${Array.from({ length: 24 }, (_, h) => opt(h, `${h}:00`, f.depFrom)).join("")}</select></label>
          <label>${L("Abflug bis", "Abflug bis")}<select name="depTo">${Array.from({ length: 24 }, (_, h) => opt(h, `${h}:59`, f.depTo)).join("")}</select></label>
          <label>${L("Reisedauer höchstens", "Reisedauer hechschdens")}<select name="maxDur">${(longhaul ? [["", L("egal", "egal")], ["12", "12 Std."], ["14", "14 Std."], ["16", "16 Std."], ["20", "20 Std."], ["24", "24 Std."]] : [["", L("egal", "egal")], ["2", "2 Std."], ["4", "4 Std."]]).map(([v, l]) => opt(v, l, f.maxDur)).join("")}</select></label>
          <label>${L("Sortieren nach", "Sordiere nach")}<select name="sort">${[["price", L("Preis", "Breis")], ["duration", L("Reisedauer", "Reisedauer")], ["departure", L("Abflugzeit", "Abflugzeit")], ["stops", L("Stopps", "Stopps")]].map(([v, l]) => opt(v, l, f.sort)).join("")}</select></label>
        </div>
        <p class="small muted" style="margin:.6rem 0 0">${L("Die Filter wirken sofort auf die angezeigten Ergebnisse.", "Die Filter wirke glei uff die Ergebnisse.")} <button type="button" class="btn-link" data-act="clear">${L("Filter zurücksetzen", "Filter zurücksetze")}</button></p>
      </div>`;
  }

  function longhaulFormHtml() {
    const { esc } = U();
    const f = form, d = Plan.dates();
    const date = formDate();
    const ret = Plan.add(date, Plan.BASE.days);
    const recent = searches().filter((x) => x.scope !== "domestic");
    return `
      <form class="card h-form" id="fForm" onsubmit="return false">
        <div class="h-grid">
          <label>${L("Hinflug am", "Hieflug am")}<input type="date" name="date" value="${date}"></label>
          <label class="f-check"><input type="checkbox" name="flex" ${f.flex ? "checked" : ""}> ${L("± 3 Tage", "± 3 Dääch")}</label>
          <label>${L("Rückflug am", "Rickflug am")}<input type="date" value="${ret}" disabled title="${L("ergibt sich aus der Reiselänge", "kummt aus de Reiselänge")}"></label>
          <label>${L("Reiseklasse", "Klass")}<select name="cls">${CLASSES().map(([v, l]) => opt(v, l, f.cls)).join("")}</select></label>
          <fieldset class="f-airports"><legend>${L("Abflug von", "Abflug vun")}</legend>${S.origins.map(([c, n]) => `<label><input type="checkbox" name="origins" value="${c}" ${f.origins.includes(c) ? "checked" : ""}> ${esc(n)} (${c})</label>`).join("")}</fieldset>
          <fieldset class="f-airports"><legend>${L("Ankunft in", "Ookunft in")}</legend>${S.destinations.map(([c, n]) => `<label><input type="checkbox" name="destinations" value="${c}" ${f.destinations.includes(c) ? "checked" : ""}> ${esc(n)} (${c})</label>`).join("")}</fieldset>
        </div>
        <p class="small muted" style="margin:.6rem 0 0">${L(`Reiselänge laut Plan: ${Plan.BASE.days} Tage (Abflug bis Rückflug). Plan zurzeit: ${Plan.fmt.wd(d.dep)} – ${Plan.fmt.wd(d.ret)}; gesucht wird pro Person, angezeigt für ${TRAV} Personen.`, `Reiselänge laut Blan: ${Plan.BASE.days} Dääch (Abflug bis Rickflug). Blan im Moment: ${Plan.fmt.wd(d.dep)} – ${Plan.fmt.wd(d.ret)}; gsucht werd pro Persoon, ogezeigt fer ${TRAV} Leit.`)}</p>
        <div class="f-source">
          <label>${L("Ergebnisse aus", "Ergebnisse aus")}
            <select name="source">
              ${opt("grid", `${L("Wöchentliches Raster", "Wöchentliches Raster")} (Business, ${Plan.fmt.d(Plan.add(Plan.BASE.dep, -3))}–${Plan.fmt.d(Plan.add(Plan.BASE.dep, 3))})${grid && grid.updatedAt ? `, ${L("Stand", "Schdand")} ${new Date(grid.updatedAt).toLocaleDateString("de-DE")}` : ""}`, f.source)}
              ${recent.map((x) => opt(esc(x.id), `${L("Suche", "Such")}: ${esc(x.label)} (${new Date(x.createdAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })})`, f.source)).join("")}
            </select>
          </label>
          <button type="button" class="btn primary" data-act="search" ${GH.token() && f.origins.length && f.destinations.length ? "" : "disabled"}>🔎 ${L("Neue Suche starten", "Nei suche")}</button>
          <span class="small muted">${L(`braucht ${f.flex ? 7 : 1} ${f.flex ? "Abfragen" : "Abfrage"}, Ergebnis nach ca. 1–3 Min.`, `braucht ${f.flex ? 7 : 1} Abfroge, Ergebnis nach so 1–3 Min.`)}</span>
        </div>
      </form>`;
  }

  function dayChips(dates, list) {
    const { esc } = U();
    const days = Object.keys(dates).sort();
    if (days.length < 2) return "";
    const best = {};
    list.forEach((o) => { const d = dateOf(o.outbound.dep); const t = total(o); if (t != null && (best[d] == null || t < best[d])) best[d] = t; });
    const min = Math.min(...Object.values(best));
    return `<div class="f-days" role="group" aria-label="${L("Abflugtag", "Abflugdaach")}">
      <button type="button" class="f-day${!form.day ? " on" : ""}" data-day="">${L("Alle Tage", "All Dääch")}</button>
      ${days.map((d) => `<button type="button" class="f-day${form.day === d ? " on" : ""}${best[d] === min ? " cheapest" : ""}" data-day="${d}">
        <strong>${esc(Plan.fmt.wd(d))}</strong><span>${best[d] != null ? `${L("ab", "ab")} ${eur(best[d])}` : "–"}</span>${d === Plan.dates().dep ? `<small>${L("Plan", "Blan")}</small>` : ""}</button>`).join("")}
    </div>`;
  }

  function longhaulResultsHtml() {
    const { esc } = U();
    if (form.source === "grid") {
      if (gridState === "loading") return `<p class="muted">${L("Lade Flugdaten …", "Lad Flugdaten …")}</p>`;
      if (gridState === "error") return `<div class="card todo-error">${esc(gridError)}</div>`;
      if (!grid) return `<div class="card soon-card"><p style="margin:0">${L("Das wöchentliche Raster wurde noch nicht geholt. Es kommt von der GitHub Action „Flugdaten aktualisieren“ (montags, oder im Repository unter Actions → Run workflow). Oder gleich eine neue Suche starten.", "Des wöchentliche Raster is noch net gholt worre. Des holt die GitHub Action „Flugdaten aktualisieren“ (mondaachs, odder im Repository unner Actions → Run workflow). Odder glei nei suche.")}</p></div>`;
      if (form.cls !== "business") return `<div class="card soon-card"><p style="margin:0">${L(`Das Raster enthält nur Business Class. Für ${clsName(form.cls)} bitte eine neue Suche starten.`, `Im Raster is nur Business Class. Fer ${clsName(form.cls)} bitte nei suche.`)}</p></div>`;
    } else {
      const id = form.source;
      if (pending.has(id)) {
        const secs = Math.round((Date.now() - pending.get(id).started) / 1000);
        return `<div class="card f-wait"><span class="sync-dot busy"></span> ${L(`Die Suche läuft bei GitHub (seit ${secs} s). Das dauert meist 1–3 Minuten; die Seite schaut alle 10 Sekunden nach.`, `Die Such lafft bei GitHub (seit ${secs} s). Des dauert meischdens 1–3 Minudde; die Seit guckt alle 10 Sekunne nach.`)}</div>`;
      }
      const r = results.get(id);
      if (!r) return `<p class="muted">${L("Lade Suchergebnis …", "Lad Suchergebnis …")}</p>`;
      if (r.status !== "ok") return `<div class="card todo-error">${esc(r.error || "Fehler")}</div>`;
    }
    const { dates, meta } = sourceDates();
    const all = Object.values(dates).flatMap((d) => d.offers || []);
    const center = formDate();
    const inWindow = (d) => (form.flex ? Math.abs(Plan.diff(center, d)) <= 3 : d === center);
    const winDates = Object.fromEntries(Object.entries(dates).filter(([d]) => form.source !== "grid" || inWindow(d)));
    let list = filterOffers(all.filter((o) => form.source !== "grid" || inWindow(dateOf(o.outbound.dep))), { longhaul: true });
    const chips = dayChips(winDates, list);
    if (form.day) list = list.filter((o) => dateOf(o.outbound.dep) === form.day);
    const errs = Object.entries(dates).filter(([, d]) => d.error).map(([d, x]) => `${Plan.fmt.d(d)}: ${x.error}`);
    const srcs = [...new Set(Object.values(dates).map((d) => d.source).filter(Boolean))];
    return `
      ${chips}
      <div class="h-count"><strong>${list.length}</strong> ${L(`von ${all.length} Angeboten passen`, `vun ${all.length} Ogebote basse`)}${srcs.length ? ` · ${L("Quelle", "Quell")}: ${srcs.map((s) => (s === "serpapi" ? "Google Flights (SerpApi)" : "Google Flights (fli)")).join(", ")}` : ""}${meta && meta.updatedAt ? ` · ${L("Stand", "Schdand")} ${new Date(meta.updatedAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}` : ""}</div>
      ${errs.length ? `<p class="small muted">⚠️ ${esc(errs.join(" · "))}</p>` : ""}
      ${list.length ? `<div class="h-list">${list.slice(0, 40).map((o) => offerHtml(o, meta || {})).join("")}</div>`
        : `<div class="card soon-card"><p style="margin:0">${L("Kein Flug passt zu Suche und Filtern. Filter lockern oder", "Kää Flug basst zu Such un Filter. Filter e bissel locker mache odder")} <button type="button" class="btn-link" data-act="clear">${L("zurücksetzen", "zurücksetze")}</button>.</p></div>`}`;
  }

  function domesticHtml() {
    const { esc } = U();
    const recentFor = (rid) => searches().filter((x) => x.scope === "domestic" && x.route === rid);
    return `
      <p class="muted small" style="max-width:72ch">${L("Inlandsflüge werden am Reisetag laut Plan gesucht. Die Wahl ändert keine Daten im Reiseplan, nur Kosten, Transfers und das To-do.", "Inlandsflieg werre am Reisedaach laut Blan gsucht. Die Wahl ännert kää Date im Reiseblan, nur Koschde, Fahrerei un's To-do.")}</p>
      <form class="card h-form" id="fForm" onsubmit="return false"><div class="h-grid">
        <label>${L("Reiseklasse", "Klass")}<select name="dcls">${CLASSES().filter((c) => c[0] !== "first").map(([v, l]) => opt(v, v === "business" ? "Business/Prestige" : l, form.dcls)).join("")}</select></label>
      </div></form>
      ${ROUTES.map((r) => {
        const date = routeDate(r);
        const sel = domesticSel(r), valid = domesticValid(r);
        const rec = recentFor(r.id)[0];
        let offers = [], src = null, info = "";
        const res = rec && results.get(rec.id);
        if (rec && pending.has(rec.id)) info = `<div class="card f-wait"><span class="sync-dot busy"></span> ${L("Suche läuft bei GitHub …", "Such lafft bei GitHub …")}</div>`;
        else if (res && res.status === "ok" && res.dates && res.dates[date]) { offers = res.dates[date].offers || []; src = res.dates[date].source; }
        else if (domData && domData.routes && domData.routes[r.id] && domData.routes[r.id].date === date && (form.dcls === "economy")) { offers = domData.routes[r.id].offers || []; src = domData.routes[r.id].source; }
        else if (res && res.status !== "ok") info = `<div class="card todo-error">${esc(res.error || "Fehler")}</div>`;
        else info = `<p class="small muted">${L("Für diesen Tag und diese Klasse liegen noch keine Daten vor.", "Fer de Daach un die Klass gebbt's noch kää Date.")}</p>`;
        const list = filterOffers(offers, { longhaul: false }).slice(0, 15);
        return `
          <section class="card f-route" data-route="${r.id}">
            <h3 style="margin:0 0 .3rem">${esc(r.fromName)} → ${esc(r.toName)} · ${esc(Plan.fmt.wd(date))}</h3>
            <div class="small">${sel
              ? `${valid ? "✓" : "⚠️"} ${L("Gewählt", "Ausgsucht")}: <strong>${esc(codeOf(sel.outbound))}</strong> ${esc(hm(sel.outbound.dep))} → ${esc(hm(sel.outbound.arr))}, ${esc(sel.outbound.airlines.join(", "))}, ${eur(total(sel))} ${L(`für ${TRAV} Personen`, `fer ${TRAV} Leit`)}${valid ? "" : ` · <strong>${L(`gilt für ${Plan.fmt.wd(dateOf(sel.outbound.dep))}, passt nicht mehr zum Plan – bitte neu wählen`, `gilt fer ${Plan.fmt.wd(dateOf(sel.outbound.dep))}, basst nimmi zum Blan – bitte nei aussuche`)}</strong>`}
                 <button type="button" class="btn-link" data-act="dreset" ${GH.token() && !state.saving ? "" : "disabled"}>${L("Auswahl entfernen", "Auswahl wegmache")}</button>`
              : `${L("Noch kein Flug gewählt; in den Kosten steht der Richtwert.", "Noch kään Flug ausgsucht; in de Koschde steht de Richtwert.")}`}</div>
            <p style="margin:.6rem 0"><button type="button" class="btn" data-act="dsearch" ${GH.token() ? "" : "disabled"}>🔎 ${L("Für diesen Tag neu suchen", "Fer de Daach nei suche")}</button> <span class="small muted">${L("1 Abfrage", "1 Abfrog")}${src ? ` · ${L("Quelle", "Quell")}: ${src === "serpapi" ? "SerpApi" : "fli"}` : ""}</span></p>
            ${info}
            ${list.length ? `<div class="h-list">${list.map((o) => `
              <article class="h-item f-item${sel && sel.id === o.id && valid ? " selected" : ""}" data-id="${esc(o.id)}">
                <div class="h-body">${segHtml(o.outbound, L("Flug", "Flug"))}</div>
                <div class="h-side">${priceBlock(o, L("einfach", "ääfach"))}
                  ${sel && sel.id === o.id && valid ? `<span class="h-chosen">✓ ${L("Im Reiseplan", "Im Reiseblan")}</span>` : `<button type="button" class="btn primary" data-act="dchoose" ${GH.token() && !state.saving && o.pricePP != null ? "" : "disabled"}>${L("Übernehmen", "Iwwernemme")}</button>`}</div>
              </article>`).join("")}</div>` : (offers.length ? `<p class="small muted">${L("Kein Flug passt zu den Filtern.", "Kään Flug basst zu de Filter.")}</p>` : "")}
          </section>`;
      }).join("")}`;
  }

  function render() {
    if (!alive()) return;
    const long = form.tab === "longhaul";
    mounted.innerHTML = `
      <h1>🔎 ${L("Flugsuche", "Fliegersuch")}</h1>
      <p class="muted" style="max-width:72ch">${L("Flüge suchen, filtern und in den Reiseplan übernehmen. Ein Flug an einem anderen Tag verschiebt nach einer Sicherheitsabfrage den ganzen Plan: Stationen, Hotels, Touren, Transfers, To-dos und Fristen.", "Flieg suche, filtere un in de Reiseblan iwwernemme. En Flug an ääm annere Daach verschiebt – nach ännere Sicherheitsabfrog – de ganze Blan: Schdatione, Hodels, Touren, Fahrerei, To-dos un Frischde.")}</p>
      <div id="fSync">${syncHtml()}</div>
      ${tabsHtml()}
      ${long ? `${currentHtml()}${longhaulFormHtml()}${filtersHtml(true)}<div id="fResults">${longhaulResultsHtml()}</div>` : `${domesticHtml()}${filtersHtml(false)}`}
      <p class="small muted">${L("Flugdaten", "Flugdaten")}: Google Flights ${L("über", "iwwer")} <a href="https://serpapi.com/google-flights-api" target="_blank" rel="noopener">SerpApi</a>, ${L("ersatzweise über", "ersatzweis iwwer")} <a href="https://github.com/punitarani/fli" target="_blank" rel="noopener">fli</a>. ${quotaHtml()} ${L("Preise in Euro inkl. Steuern und Gebühren, vor der Buchung beim Anbieter prüfen.", "Breise in Euro mit Schdeiern un Gebühre, vor'm Buche beim Anbieder nochmol brife.")}</p>
      <dialog class="todo-dialog" id="fDialog"></dialog>`;
    if (!long) return;
    if (form.source !== "grid") ensureResult(form.source);
    // Rückflug-Aufträge zu angezeigten Angeboten nachladen
    returnReq.forEach((rid) => { if (!results.has(rid) && !pending.has(rid)) ensureResult(rid); });
  }

  // ---------- Auswählen: Sicherheitsabfrage ----------
  function findOffer(id) {
    const pools = [];
    const { dates } = sourceDates();
    Object.values(dates).forEach((d) => pools.push(...(d.offers || [])));
    results.forEach((r) => { if (r.kind === "return") pools.push(...(r.offers || [])); if (r.dates) Object.values(r.dates).forEach((d) => pools.push(...(d.offers || []))); });
    if (domData && domData.routes) Object.values(domData.routes).forEach((r) => pools.push(...(r.offers || [])));
    return pools.find((o) => o.id === id);
  }

  const hotelSelected = (sid) => !!(window.Hotels && window.Hotels.state.selections[sid]);

  function confirmChoose(o, meta) {
    const { esc } = U();
    const dlg = mounted.querySelector("#fDialog");
    const eff = planEffect(o);
    const cur = state.sel.longhaul;
    const curName = cur ? `${codeOf(cur.outbound)} / ${codeOf(cur.return)}` : `${T.flights.planInfo.codes} (${L("Planvorschlag", "Blanvorschlach")})`;
    const retExpected = Plan.add(Plan.BASE.ret, eff.shift);
    if (dateOf(o.return.dep) !== retExpected) {
      alert(L(`Dieser Rückflug (${Plan.fmt.wd(dateOf(o.return.dep))}) passt nicht zur Reiselänge des Plans (${Plan.fmt.wd(retExpected)}).`, `Der Rickflug (${Plan.fmt.wd(dateOf(o.return.dep))}) basst net zur Reiselänge vum Blan (${Plan.fmt.wd(retExpected)}).`));
      return;
    }
    let mode = state.sel.plan.mode || "first";
    const build = () => {
      const next = Plan.clean({ shift: eff.shift, late: eff.late, mode });
      const before = Plan.stationsWith(Plan.state), after = Plan.stationsWith(next);
      const warn = Plan.warningsWith(next, hotelSelected);
      const hotels = T.stations.filter((s) => hotelSelected(s.id));
      const dShift = next.shift - Plan.state.shift;
      const domStale = ROUTES.filter((r) => { const d = domesticSel(r); if (!d) return false; const st = after.find((x) => x.id === r.after); return st && dateOf(d.outbound.dep) !== st.checkOut; });
      const moves = next.shift !== Plan.state.shift || next.late !== Plan.state.late || next.mode !== Plan.state.mode;
      return `
        <form method="dialog" class="todo-form">
          <h2>${moves ? L("Flug übernehmen und Plan verschieben?", "Flug iwwernemme un de Blan verschiewe?") : L("Flug übernehmen?", "Flug iwwernemme?")}</h2>
          <p style="margin:0">${L(`<strong>${esc(codeOf(o.outbound))} / ${esc(codeOf(o.return))}</strong> ersetzt <em>${esc(curName)}</em>.`, `<strong>${esc(codeOf(o.outbound))} / ${esc(codeOf(o.return))}</strong> kummt fer <em>${esc(curName)}</em>.`)}</p>
          <p class="small" style="margin:0">${L("Hinflug", "Hieflug")} ${esc(Plan.fmt.wd(dateOf(o.outbound.dep)))} ${esc(hm(o.outbound.dep))} ${esc(o.outbound.from)} → ${esc(o.outbound.to)} ${esc(Plan.fmt.wd(dateOf(o.outbound.arr)))} ${esc(hm(o.outbound.arr))} · ${L("Rückflug", "Rickflug")} ${esc(Plan.fmt.wd(dateOf(o.return.dep)))} ${esc(hm(o.return.dep))}<br>
            ${eur(o.pricePP)} × ${TRAV} = <strong>${eur(total(o))}</strong>${cur && cur.pricePP != null ? ` (${L("bisher", "bisher")} ${eur(total(cur))})` : ""}</p>
          ${eff.late ? `
            <fieldset class="f-mode"><legend>${L(`Ankunft in Seoul erst am ${Plan.fmt.wd(dateOf(o.outbound.arr))}, ${eff.late} Tag${eff.late > 1 ? "e" : ""} später als mit einem Nonstop-Flug. Wie soll der Plan damit umgehen?`, `Ookunft in Seoul erschd am ${Plan.fmt.wd(dateOf(o.outbound.arr))}, ${eff.late} Daach schbäder wie mit'm Nonstop-Flug. Was soll de Blan do mache?`)}</legend>
              <label><input type="radio" name="mode" value="first" ${mode === "first" ? "checked" : ""}> ${L(`Erste Station (${T.stations[0].name}) wird ${eff.late} Nacht kürzer, der Rest bleibt.`, `Erschde Schdation (${T.stations[0].name}) werd ${eff.late} Nacht kärzer, de Rescht bleibt.`)}</label>
              <label><input type="radio" name="mode" value="last" ${mode === "last" ? "checked" : ""}> ${L(`Plan beginnt mit der Ankunft, die letzte Station (${T.stations[T.stations.length - 1].name} ${T.stations[T.stations.length - 1].area}) wird ${eff.late} Nacht kürzer.`, `De Blan fängt mit de Ookunft o, die letschde Schdation (${T.stations[T.stations.length - 1].name} ${T.stations[T.stations.length - 1].area}) werd ${eff.late} Nacht kärzer.`)}</label>
              <p class="small muted" style="margin:.3rem 0 0">${L("Tage, die dadurch wegfallen, sind im Tagesplan durchgestrichen.", "Dääch, wo dodurch wegfalle, sinn im Daachesblan durchgschdriche.")}</p>
            </fieldset>` : ""}
          ${moves ? `
            <div class="f-moves">
              <p class="small" style="margin:0 0 .3rem"><strong>${dShift ? L(`Alle Daten verschieben sich um ${signed(dShift)} Tag${Math.abs(dShift) > 1 ? "e" : ""}:`, `All Date rutsche um ${signed(dShift)} Daach:`) : L("Neue Aufteilung:", "Neie Ufdeilung:")}</strong></p>
              <table class="small"><tbody>${T.stations.map((s, i) => `<tr><td>${esc(s.name)} (${esc(s.area)})</td><td>${esc(before[i].dates)} · ${before[i].nights}</td><td>→</td><td><strong>${esc(after[i].dates)} · ${after[i].nights} ${L("Nächte", "Nächt")}</strong></td></tr>`).join("")}</tbody></table>
              <ul class="small" style="margin:.4rem 0 0;padding-left:1.1rem">
                <li>${L("Tagespläne, Touren, Transfers und Datumsangaben in Texten wandern mit.", "Daachesblän, Touren, Fahrerei un Date in de Texte wannern mit.")}</li>
                ${dShift ? `<li>${L(`Alle Fristen der To-dos verschieben sich um ${signed(dShift)} Tage.`, `All Frischde vun de To-dos rutsche um ${signed(dShift)} Dääch.`)}</li>` : ""}
                ${hotels.length ? `<li>${L(`Gewählte Hotels (${hotels.map((s) => esc(window.Hotels.effective(s).name)).join(", ")}) bekommen neue Daten. Ihre Preise sind dann als „zu prüfen“ markiert; die Hotel-Action holt die Preise für die neuen Daten automatisch.`, `Ausgsuchte Hodels (${hotels.map((s) => esc(window.Hotels.effective(s).name)).join(", ")}) krieje neie Date. Die Breise sinn donn „zu prüfen“; die Hodel-Action holt die Breise fer die neie Date vun selwer.`)}</li>` : ""}
                ${domStale.length ? `<li>${L(`Gewählte Inlandsflüge (${domStale.map((r) => `${esc(r.fromName)} → ${esc(r.toName)}`).join(", ")}) passen dann nicht mehr zum Datum und müssen neu gewählt werden.`, `Ausgsuchte Inlandsflieg (${domStale.map((r) => `${esc(r.fromName)} → ${esc(r.toName)}`).join(", ")}) basse donn nimmi zum Datum un misse nei ausgsucht werre.`)}</li>` : ""}
                <li>${L("Feste Feiertage bleiben, wo sie sind. Begründungen im Text beziehen sich weiter auf den ursprünglichen Termin.", "Feschde Feierdääch bleiwe, wo se sinn. Begrinnunge im Text beziehe sich weider uff de urschbrüngliche Termin.")}</li>
              </ul>
              ${warn.length ? `<div class="f-warn small"><strong>⚠️ ${L("Ruhetage im neuen Plan", "Ruhedääch im neie Blan")}:</strong><ul>${warn.map((w) => `<li>${esc(Plan.fmt.wd(w.date))} (${esc(w.station.name)}): ${esc(w.text)}</li>`).join("")}</ul></div>` : ""}
            </div>` : ""}
          <div class="form-actions">
            <button type="button" class="btn" data-close>${L("Abbrechen", "Loss es")}</button>
            <button type="submit" class="btn primary">${moves ? L("Übernehmen und Plan verschieben", "Iwwernemme un verschiewe") : L("Übernehmen", "Iwwernemme")}</button>
          </div>
        </form>`;
    };
    const show = () => {
      dlg.innerHTML = build();
      dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
      dlg.querySelectorAll("input[name=mode]").forEach((r) => r.addEventListener("change", () => { mode = r.value; show(); }));
      dlg.querySelector("form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        dlg.close();
        select(o, meta, Plan.clean({ shift: eff.shift, late: eff.late, mode }));
      });
    };
    show();
    dlg.showModal();
  }

  async function select(o, meta, plan) {
    const day = new Date().toLocaleDateString("de-DE");
    const prev = state.sel.longhaul;
    const prevPlan = { ...state.sel.plan };
    const entry = {
      ...JSON.parse(JSON.stringify(o)),
      cls: (meta.params && meta.params.cls) || form.cls,
      travellers: TRAV,
      selectedAt: new Date().toISOString(),
      priceSource: `${o.source === "fli" ? "Google Flights über fli" : "Google Flights über SerpApi"}, Preis für 1 Person × ${TRAV}, abgerufen ${meta.updatedAt ? new Date(meta.updatedAt).toLocaleDateString("de-DE") : day}`,
    };
    delete entry.departureToken;
    const d = sourceDates().dates[dateOf(o.outbound.dep)];
    entry.url = (d && d.url) || googleUrl(entry);
    const msg = `Flug gewählt: ${codeOf(o.outbound)} / ${codeOf(o.return)}${plan.shift !== prevPlan.shift || plan.late !== prevPlan.late ? `, Plan ${signed(plan.shift)} Tage${plan.late ? `, Ankunft +${plan.late} (${plan.mode === "first" ? "erste Station kürzer" : "letzte Station kürzer"})` : ""}` : ""}`;
    const ok = await save((sel) => { sel.longhaul = entry; sel.plan = plan; }, msg);
    if (ok) await syncTodo(entry, prev);
  }

  async function resetLonghaul() {
    const prev = state.sel.longhaul;
    const ok = await save((sel) => { sel.longhaul = null; sel.plan = { shift: 0, late: 0, mode: "first" }; }, "Flug auf Planvorschlag zurückgesetzt");
    if (ok) await syncTodo(null, prev);
  }

  // Buchungs-To-do der Langstrecke anpassen (Text mit Platzhaltern, damit Daten mitwandern).
  // Der ursprüngliche Text wird in "planned" aufgehoben; "Zurücksetzen" stellt ihn wieder her.
  function syncTodo(entry, prev) {
    const Todos = window.Todos;
    if (!Todos || !Todos.update) return Promise.resolve(false);
    const id = S.todoId;
    const day = new Date().toLocaleDateString("de-DE");
    const name = (o) => (o ? `${codeOf(o.outbound)} / ${codeOf(o.return)}` : T.flights.planInfo.codes);
    const seg = (x, baseDate) => `{wd:${baseDate}} ${x.from} ${hm(x.dep)} → ${x.to} ${hm(x.arr)}${plusDays(x) ? ` (+${plusDays(x)})` : ""}, ${x.airlines.join(", ")} ${codeOf(x)}, ${stopsTextHd(x.stops)}`;
    return Todos.update((items) => {
      let t = items.find((x) => x.id === id);
      if (!t) { t = { id, title: "", category: "Flüge", due: "", status: "offen", description: "", links: [] }; items.push(t); }
      else if (!t.planned) t.planned = { title: t.title, description: t.description || "", links: t.links || [] };
      if (entry) {
        t.title = `Flüge ${name(entry)} buchen ({d:${Plan.BASE.dep}} / {d:${Plan.BASE.ret}})`;
        t.description = `In der Flugsuche gewählt (${clsName(entry.cls)}): Hinflug ${seg(entry.outbound, Plan.BASE.dep)}. Rückflug ${seg(entry.return, Plan.BASE.ret)}. ` +
          `Preis ${TRAV} × ${eur(entry.pricePP)} = **${eur(total(entry))}** (${entry.priceSource}). Preis und Uhrzeiten vor der Buchung prüfen.`;
        t.links = [{ title: "Google Flights", url: entry.url || googleUrl(entry) }];
      } else if (t.planned) {
        t.title = t.planned.title; t.description = t.planned.description; t.links = t.planned.links; delete t.planned;
      }
      if (t.status === "erledigt" && prev && name(prev) !== name(entry)) {
        t.status = "offen";
        t.description = `**Flug gewechselt am ${day}:** vorher ${name(prev)}. Falls der schon gebucht war, bitte stornieren.\n\n${t.description}`;
      }
    }, `To-do angepasst: Flüge ${name(entry)}`);
  }

  function googleUrl(o) {
    const q = `Flights from ${o.outbound.from} to ${o.outbound.to} on ${dateOf(o.outbound.dep)}${o.return ? ` through ${dateOf(o.return.dep)}` : " one way"} ${clsName(o.cls || "business")} class`;
    return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&curr=EUR&hl=de`;
  }

  // ---------- Inlandsflüge wählen ----------
  function confirmDomestic(r, o) {
    const { esc } = U();
    const dlg = mounted.querySelector("#fDialog");
    const cur = domesticSel(r);
    dlg.innerHTML = `
      <form method="dialog" class="todo-form">
        <h2>${L("Inlandsflug übernehmen?", "Inlandsflug iwwernemme?")}</h2>
        <p style="margin:0"><strong>${esc(codeOf(o.outbound))}</strong> ${esc(Plan.fmt.wd(dateOf(o.outbound.dep)))} ${esc(hm(o.outbound.dep))} ${esc(o.outbound.from)} → ${esc(o.outbound.to)} ${esc(hm(o.outbound.arr))}${cur ? ` ${L("ersetzt", "kummt fer")} <em>${esc(codeOf(cur.outbound))}</em>` : ""}.</p>
        <p class="small" style="margin:0">${eur(o.pricePP)} × ${TRAV} = <strong>${eur(total(o))}</strong></p>
        <div class="form-actions">
          <button type="button" class="btn" data-close>${L("Abbrechen", "Loss es")}</button>
          <button type="submit" class="btn primary">${L("Übernehmen", "Iwwernemme")}</button>
        </div>
      </form>`;
    dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
    dlg.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault(); dlg.close();
      const entry = { ...JSON.parse(JSON.stringify(o)), cls: form.dcls, travellers: TRAV, selectedAt: new Date().toISOString(),
        priceSource: `${o.source === "fli" ? "Google Flights über fli" : "Google Flights über SerpApi"}, abgerufen ${new Date().toLocaleDateString("de-DE")}` };
      const ok = await save((sel) => { sel.domestic[r.id] = entry; }, `Inlandsflug ${r.fromName} → ${r.toName}: ${codeOf(o.outbound)}`);
      if (ok) await syncDomesticTodo(cur);
    });
    dlg.showModal();
  }

  function syncDomesticTodo(prevEntry) {
    const Todos = window.Todos;
    if (!Todos || !Todos.update || !T.flights.domesticTodoId) return Promise.resolve(false);
    const id = T.flights.domesticTodoId;
    const day = new Date().toLocaleDateString("de-DE");
    return Todos.update((items) => {
      const t = items.find((x) => x.id === id);
      if (!t) return;
      if (!t.planned) t.planned = { title: t.title, description: t.description || "", links: t.links || [] };
      const chosen = ROUTES.map((r) => [r, domesticSel(r)]).filter(([, d]) => d);
      if (!chosen.length) { t.title = t.planned.title; t.description = t.planned.description; t.links = t.planned.links; delete t.planned; return; }
      const base = (r) => T.stations.find((s) => s.id === r.after).base.checkOut;
      t.description = chosen.map(([r, d]) => `${r.fromName} → ${r.toName} {wd:${base(r)}}: ${codeOf(d.outbound)} ${hm(d.outbound.dep)} → ${hm(d.outbound.arr)}, ${d.outbound.airlines.join(", ")}, ${TRAV} × ${eur(d.pricePP)} = ${eur(total(d))}`).join(". ") +
        `. In der Flugsuche gewählt am ${day}; Preise vor der Buchung prüfen.` + (t.planned.description ? `\n\n${t.planned.description}` : "");
      t.links = chosen.map(([r, d]) => ({ title: `Google Flights ${r.fromName} → ${r.toName}`, url: d.url || googleUrl(d) }));
      if (t.status === "erledigt" && prevEntry) {
        t.status = "offen";
        t.description = `**Inlandsflug gewechselt am ${day}:** vorher ${codeOf(prevEntry.outbound)}. Falls der schon gebucht war, bitte stornieren.\n\n${t.description}`;
      }
    }, "To-do angepasst: Inlandsflüge");
  }

  // ---------- Ereignisse ----------
  function onChange(ev) {
    const t = ev.target;
    if (!t.name || t.closest("#fFilters")) return; // Filter: siehe onInput
    if (t.name === "origins" || t.name === "destinations") {
      form[t.name] = [...mounted.querySelectorAll(`input[name=${t.name}]:checked`)].map((x) => x.value);
    } else if (t.name === "flex") form.flex = t.checked;
    else if (t.name === "date") { form.date = t.value === Plan.dates().dep ? "" : t.value; form.day = ""; }
    else if (t.name === "source") { form.source = t.value; form.day = ""; }
    else if (t.type !== "number" && t.type !== "text" && t.tagName !== "INPUT") form[t.name] = t.value;
    else return;
    persist();
    render();
  }
  function onInput(ev) {
    const t = ev.target;
    if (!t.name || !t.closest("#fFilters")) return;
    form[t.name] = t.value;
    persist();
    const res = mounted.querySelector("#fResults");
    if (res) res.innerHTML = longhaulResultsHtml(); else render();
  }

  async function onClick(ev) {
    const tab = ev.target.closest("[data-tabsel]");
    if (tab) { form.tab = tab.dataset.tabsel; persist(); history.replaceState(null, "", form.tab === "domestic" ? "#flugsuche/inland" : "#flugsuche"); render(); return; }
    const day = ev.target.closest("[data-day]");
    if (day) { form.day = day.dataset.day; persist(); render(); return; }
    const b = ev.target.closest("[data-act]");
    if (!b) return;
    const act = b.dataset.act;
    if (act === "clear") {
      Object.assign(form, { stops: "any", airlines: "", maxPrice: "", depFrom: "0", depTo: "23", maxDur: "", sort: "price", day: "" });
      persist(); render();
    } else if (act === "search") {
      const params = {
        origins: form.origins, destinations: form.destinations, date: formDate(), flex: !!form.flex, tripDays: Plan.BASE.days,
        cls: form.cls, stops: form.stops, airlines: codesFrom(form.airlines), depFrom: parseInt(form.depFrom, 10) || 0,
        depTo: isNaN(parseInt(form.depTo, 10)) ? 23 : parseInt(form.depTo, 10), maxDuration: form.maxDur ? parseFloat(form.maxDur) * 60 : null,
      };
      b.disabled = true;
      const id = await request("search", params);
      if (id) { form.source = id; form.day = ""; persist(); }
      render();
    } else if (act === "returns") {
      const item = b.closest(".f-item");
      const o = findOffer(item.dataset.id);
      if (!o) return;
      const { meta } = sourceDates();
      const p = (meta && meta.params) || {};
      const params = { origins: p.origins || form.origins, destinations: p.destinations || form.destinations, date: dateOf(o.outbound.dep), tripDays: (meta && meta.tripDays) || Plan.BASE.days,
        cls: p.cls || "business", stops: p.stops || "any", airlines: p.airlines || [], depFrom: p.depFrom ?? 0, depTo: p.depTo ?? 23, maxDuration: p.maxDuration || null };
      b.disabled = true;
      const outbound = { ...o.outbound };
      const id = await request("return", params, { departureToken: o.departureToken, outbound });
      if (id) returnReq.set(o.id, id);
      render();
    } else if (act === "choose") {
      const o = findOffer(b.closest(".f-item").dataset.id);
      if (o) confirmChoose(o, sourceDates().meta || {});
    } else if (act === "reset") {
      const msg = Plan.shifted()
        ? L(`Wieder den Planvorschlag (${T.flights.planInfo.codes}) verwenden? Alle Daten gehen auf ${Plan.fmt.wd(Plan.BASE.dep)} – ${Plan.fmt.wd(Plan.BASE.ret)} zurück, mit Hotels, Touren, To-dos und Fristen.`, `Widder de Blanvorschlach (${T.flights.planInfo.codes}) nemme? All Date gehn uff ${Plan.fmt.wd(Plan.BASE.dep)} – ${Plan.fmt.wd(Plan.BASE.ret)} zurick, mit Hodels, Touren, To-dos un Frischde.`)
        : L(`Wieder den Planvorschlag (${T.flights.planInfo.codes}) verwenden?`, `Widder de Blanvorschlach (${T.flights.planInfo.codes}) nemme?`);
      if (confirm(msg)) resetLonghaul();
    } else if (act === "dsearch") {
      const r = ROUTES.find((x) => x.id === b.closest("[data-route]").dataset.route);
      const params = { origins: [r.from], destinations: [r.to], date: routeDate(r), flex: false, tripDays: null, cls: form.dcls, stops: "any", airlines: [], depFrom: 0, depTo: 23, maxDuration: null };
      b.disabled = true;
      const id = await request("search", params);
      if (id) { const list = searches(); const e = list.find((x) => x.id === id); if (e) { e.route = r.id; GH.lsSet(SEARCHES_KEY, JSON.stringify(list)); } }
      render();
    } else if (act === "dchoose") {
      const r = ROUTES.find((x) => x.id === b.closest("[data-route]").dataset.route);
      const o = findOffer(b.closest(".f-item").dataset.id);
      if (r && o) confirmDomestic(r, o);
    } else if (act === "dreset") {
      const r = ROUTES.find((x) => x.id === b.closest("[data-route]").dataset.route);
      const prev = domesticSel(r);
      if (confirm(L(`Auswahl für ${r.fromName} → ${r.toName} entfernen?`, `Auswahl fer ${r.fromName} → ${r.toName} wegmache?`))) {
        const ok = await save((sel) => { delete sel.domestic[r.id]; }, `Inlandsflug ${r.fromName} → ${r.toName} zurückgesetzt`);
        if (ok) await syncDomesticTodo(prev);
      }
    }
  }

  // Für die Inlands-Suchergebnisse: Ergebnisse der letzten Suche je Strecke nachladen
  function loadDomesticResults() {
    ROUTES.forEach((r) => { const rec = searches().find((x) => x.scope === "domestic" && x.route === r.id); if (rec) ensureResult(rec.id); });
  }

  // ---------- Öffentliche Schnittstelle ----------
  window.Flights = {
    state,
    load,
    costFlights,
    costTransport,
    flightInfo,
    domesticRoutes: ROUTES,
    domesticSel,
    domesticValid,
    routeDate,
    total,
    codeOf,
    hm,
    dateOf,
    apName,
    clsName,
    stopsText,
    plusDays,
    subscribe(fn) { listeners.push(fn); },
    mount(el, arg) {
      form.tab = arg === "inland" ? "domestic" : "longhaul";
      mounted = document.createElement("div");
      mounted.className = "hotels flights";
      el.innerHTML = "";
      el.appendChild(mounted);
      mounted.addEventListener("change", onChange);
      mounted.addEventListener("input", onInput);
      mounted.addEventListener("click", onClick);
      render();
      loadData();
      loadDomesticResults();
    },
  };

  listeners.push(render);
  GH.onTokenChange(load);
  load();
})();
