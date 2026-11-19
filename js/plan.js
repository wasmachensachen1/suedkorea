// Reisedaten nach der Flugauswahl.
//
// Alle Datumsangaben, die am Reiseplan hängen, stehen in data.js (und in data/todos.json) als
// Platzhalter mit dem Datum des ursprünglichen Plans. Wird in der Flugsuche ein Flug an einem
// anderen Tag gewählt, verschiebt dieses Modul alle diese Daten:
//
//   {d:2027-09-16}        → 16.9.
//   {wd:2027-09-16}       → Do 16.9.
//   {dy:2027-09-15}       → 15.9.2027
//   {wday:2027-09-15}     → Mittwoch
//   {range:2027-09-16/2027-09-21} → 16.–21.9.
//   {nights:all}          → Zahl der Nächte aller Stationen zusammen
//   {flight:outCode}      → Angaben zum gewählten Langstreckenflug (siehe flightInfo unten)
//
// Feste Termine (Feiertage, Fristen von Anbietern) stehen ohne Platzhalter im Text und bleiben.
//
// Zustand (gespeichert in data/flights.json unter "plan"):
//   shift  Tage, um die der ganze Plan verschoben ist (Abflugtag neu − Abflugtag laut Plan)
//   late   Tage, die der gewählte Hinflug später in Seoul ankommt als ein Nonstop-Flug (0, 1, 2)
//   mode   bei late > 0: "first" = erste Station beginnt später (wird kürzer),
//          "last" = Plan ab Ankunft, letzte Station wird kürzer (Rückflugtag bleibt)
//
// Läuft im Browser und in der GitHub Action (scripts/fetch-hotels.mjs, scripts/fetch-flights.mjs).
(function (root) {
  "use strict";

  const T = root.TRIP;
  const L = (hd, kp) => (root.Theme ? root.Theme.t(hd, kp) : hd);

  // ---------- Datumshelfer (alles in UTC, Format YYYY-MM-DD) ----------
  const toDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const toIso = (dt) => dt.toISOString().slice(0, 10);
  const add = (iso, n) => { const dt = toDate(iso); dt.setUTCDate(dt.getUTCDate() + n); return toIso(dt); };
  const diff = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000); // b − a in Tagen
  const wdIdx = (iso) => toDate(iso).getUTCDay();
  const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const WD_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const WD_LONG_KP = ["Sunndaach", "Mondaach", "Dienschdaach", "Mittwoch", "Dunnerschdaach", "Freidaach", "Samschdaach"];
  const dm = (iso) => { const [, m, d] = iso.split("-").map(Number); return `${d}.${m}.`; };
  const fmt = {
    d: dm,
    wd: (iso) => `${WD[wdIdx(iso)]} ${dm(iso)}`,
    dy: (iso) => `${dm(iso)}${iso.slice(0, 4)}`,
    wday: (iso) => L(WD_LONG[wdIdx(iso)], WD_LONG_KP[wdIdx(iso)]),
    range(a, b) {
      const [, m1, d1] = a.split("-").map(Number), [, m2, d2] = b.split("-").map(Number);
      return m1 === m2 ? `${d1}.–${d2}.${m2}.` : `${d1}.${m1}.–${d2}.${m2}.`;
    },
  };

  // ---------- Ursprünglicher Plan ----------
  // Basisdaten einmal sichern; checkIn/checkOut/nights/dates der Stationen werden danach berechnet.
  T.stations.forEach((s) => { if (!s.base) s.base = { checkIn: s.checkIn, checkOut: s.checkOut }; });
  const BASE = {
    dep: T.departure.slice(0, 10),
    depTime: T.departure.slice(11, 16),
    arr: T.stations[0].base.checkIn,
    ret: T.stations[T.stations.length - 1].base.checkOut,
  };
  BASE.days = diff(BASE.dep, BASE.ret); // Abflug bis Rückflug, z. B. 21

  const EMPTY = { shift: 0, late: 0, mode: "first" };
  let state = { ...EMPTY };
  const listeners = [];

  function clean(p) {
    const s = { ...EMPTY, ...(p || {}) };
    s.shift = parseInt(s.shift, 10) || 0;
    s.late = Math.max(0, parseInt(s.late, 10) || 0);
    if (s.mode !== "last") s.mode = "first";
    // Die betroffene Station muss mindestens eine Nacht behalten
    const st = s.mode === "first" ? T.stations[0] : T.stations[T.stations.length - 1];
    s.late = Math.min(s.late, diff(st.base.checkIn, st.base.checkOut) - 1);
    return s;
  }

  // Ursprüngliches Datum → Datum im (verschobenen) Plan. dropped = Tag entfällt wegen späterer Ankunft.
  function mapWith(p, iso) {
    const { shift: S, late: k, mode } = p;
    if (iso === BASE.dep || iso === BASE.ret) return { iso: add(iso, S), dropped: false };
    if (!k) return { iso: add(iso, S), dropped: false };
    if (mode === "first") {
      if (iso === BASE.arr) return { iso: add(iso, S + k), dropped: false };
      if (iso > BASE.arr && iso <= add(BASE.arr, k)) return { iso: add(iso, S), dropped: true };
      return { iso: add(iso, S), dropped: false };
    }
    if (iso >= add(BASE.ret, -k) && iso < BASE.ret) return { iso: add(iso, S + k), dropped: true };
    return { iso: add(iso, S + k), dropped: false };
  }

  // Stationsdaten für einen Planzustand
  function stationsWith(p) {
    return T.stations.map((s) => {
      const checkIn = mapWith(p, s.base.checkIn).iso, checkOut = mapWith(p, s.base.checkOut).iso;
      return { id: s.id, checkIn, checkOut, nights: diff(checkIn, checkOut), dates: fmt.range(checkIn, checkOut) };
    });
  }

  function applyStations() {
    stationsWith(state).forEach((x, i) => Object.assign(T.stations[i], { checkIn: x.checkIn, checkOut: x.checkOut, nights: x.nights, dates: x.dates }));
  }

  // ---------- Angaben zum Langstreckenflug für {flight:…} ----------
  // Standard aus data.js (flights.planInfo); die Flugsuche setzt den gewählten Flug.
  let flightInfo = { ...((T.flights && T.flights.planInfo) || {}) };

  // ---------- Platzhalter ersetzen ----------
  const TOKEN = /\{(d|wd|dy|wday|range|flight|nights):([^}\s]+)\}/g;
  function expandWith(p, text) {
    if (text == null) return "";
    const s = String(text);
    if (s.indexOf("{") < 0) return s;
    return s.replace(TOKEN, (all, kind, arg) => {
      if (kind === "flight") {
        const v = flightInfo[arg];
        return v == null ? all : String(typeof v === "function" ? v() : v);
      }
      if (kind === "nights") return String(stationsWith(p).reduce((n, x) => n + x.nights, 0));
      if (kind === "range") {
        const [a, b] = arg.split("/");
        if (!/^\d{4}-\d\d-\d\d$/.test(a || "") || !/^\d{4}-\d\d-\d\d$/.test(b || "")) return all;
        return fmt.range(mapWith(p, a).iso, mapWith(p, b).iso);
      }
      if (!/^\d{4}-\d\d-\d\d$/.test(arg)) return all;
      return fmt[kind](mapWith(p, arg).iso);
    });
  }

  // Erstes Datum in einem Platzhalter-Text (für Tagespläne: "{wd:2027-09-16}" → "2027-09-16")
  function baseDateOf(text) {
    const m = /\{(?:d|wd|dy|wday):(\d{4}-\d\d-\d\d)\}/.exec(String(text || ""));
    return m ? m[1] : null;
  }

  // ---------- Feiertage und Ruhetage ----------
  function holidaysOn(iso) {
    return (T.holidays || []).filter((h) => iso >= h.from && iso <= (h.to || h.from));
  }

  // n-ter Wochentag im Monat (n = 1…5)
  const nthOfMonth = (iso) => Math.floor((Number(iso.slice(8, 10)) - 1) / 7) + 1;

  // Hinweise für einen Tag des Tagesplans: Ruhetage laut data.js (closures) und Feiertage.
  // hotelSelected(stationId) sagt, ob statt des Planhotels ein anderes gewählt ist.
  function dayNotes(p, station, day, hotelSelected) {
    const base = baseDateOf(day[0]);
    if (!base) return [];
    const m = mapWith(p, base);
    if (m.dropped) return [];
    const iso = m.iso, wd = wdIdx(iso);
    const notes = [];
    (T.closures || []).forEach((c) => {
      if (c.station && c.station !== station.id) return;
      if (c.planHotelOnly && hotelSelected && hotelSelected(station.id)) return;
      if (!String(day[1]).includes(c.match)) return;
      const hit = (c.weekdays && c.weekdays.includes(wd)) || (c.nthWeekday && c.nthWeekday.wd === wd && c.nthWeekday.n === nthOfMonth(iso));
      if (hit) notes.push({ type: "closed", text: c.text });
    });
    holidaysOn(iso).forEach((h) => notes.push({ type: "holiday", text: h.name }));
    return notes;
  }

  // Alle Ruhetag-Warnungen eines Planzustands (für Übersicht und Sicherheitsabfrage)
  function warningsWith(p, hotelSelected) {
    const out = [];
    T.stations.forEach((s) => (s.days || []).forEach((d) => {
      dayNotes(p, s, d, hotelSelected).filter((n) => n.type === "closed").forEach((n) => {
        out.push({ station: s, date: mapWith(p, baseDateOf(d[0])).iso, text: n.text });
      });
    }));
    return out;
  }

  function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

  // ---------- Öffentliche Schnittstelle ----------
  const Plan = {
    BASE,
    fmt,
    add,
    diff,
    clean,
    get state() { return { ...state }; },
    shifted: () => state.shift !== 0 || state.late !== 0,
    configure(p) {
      const next = clean(p);
      if (next.shift === state.shift && next.late === state.late && next.mode === state.mode) return;
      state = next;
      applyStations();
      notify();
    },
    setFlightInfo(info) { flightInfo = { ...((T.flights && T.flights.planInfo) || {}), ...(info || {}) }; notify(); },
    flightInfo: () => ({ ...flightInfo }),
    map: (iso) => mapWith(state, iso),
    mapWith,
    expand: (text) => expandWith(state, text),
    expandWith,
    baseDateOf,
    stationsWith,
    // Abflug, Ankunft und Rückflug laut aktuellem Plan
    dates() {
      return {
        dep: mapWith(state, BASE.dep).iso,
        arr: mapWith(state, BASE.arr).iso,
        ret: mapWith(state, BASE.ret).iso,
      };
    },
    // Fristen der To-dos wandern mit dem ganzen Plan
    shiftDue: (iso) => (iso && /^\d{4}-\d\d-\d\d$/.test(iso) ? add(iso, state.shift) : iso),
    unshiftDue: (iso) => (iso && /^\d{4}-\d\d-\d\d$/.test(iso) ? add(iso, -state.shift) : iso),
    holidaysOn,
    dayNotes: (station, day, hotelSelected) => dayNotes(state, station, day, hotelSelected),
    dayNotesWith: dayNotes,
    warnings: (hotelSelected) => warningsWith(state, hotelSelected),
    warningsWith,
    onChange(fn) { listeners.push(fn); },
  };

  applyStations();
  root.Plan = Plan;
})(typeof window !== "undefined" ? window : globalThis);
