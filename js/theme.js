// Zweite Optik: „Mense-Modus“ – Neon-Sonnenuntergang im Stil von GTA VI, alle Texte auf Kurpfälzisch.
// Umschalten über den Button in der Kopfzeile (und auf der Passwortseite); die Wahl wird pro Gerät gemerkt.
//
// Für Entwickler:
//   Theme.on()            true, wenn der Mense-Modus aktiv ist
//   Theme.t(hd, kp)       liefert je nach Modus den hochdeutschen oder den kurpfälzischen Text
//   Theme.onChange(fn)    fn wird nach jedem Umschalten aufgerufen (Seite neu zeichnen)
//   Theme.color(station)  Stationsfarbe passend zur Optik
//   Theme.check()         (Konsole) zeigt Reisetexte ohne Übersetzung und verwaiste Einträge
// Statische Texte in index.html bekommen data-kp="…" (bzw. data-kp-placeholder="…").
// Die Reiseinhalte aus data.js werden über js/data.kurpfalz.js ausgetauscht.
(function () {
  "use strict";

  const KEY = "suedkorea-theme";
  const root = document.documentElement;
  const listeners = [];

  let active = false;
  try { active = localStorage.getItem(KEY) === "kurpfalz"; } catch (e) { /* egal */ }

  function applyRoot() {
    if (active) root.dataset.theme = "vice"; else delete root.dataset.theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = active ? "#1a0b2e" : "#faf7f2";
  }
  applyRoot(); // sofort, damit beim Laden nichts aufblitzt

  const t = (hd, kp) => (active && kp != null ? kp : hd);

  // ---------- Reiseinhalte (data.js) ----------
  // Nicht übersetzt werden technische Felder; alle übrigen Texte werden über das Wörterbuch ersetzt.
  const SKIP = new Set(["id", "url", "color", "checkIn", "checkOut", "departure", "returnDate", "code", "icon", "hotelSearch", "base"]);
  let dict = {};
  let entries = []; // [Objekt, Schlüssel, Originaltext]

  function collect(obj) {
    if (!obj || typeof obj !== "object") return;
    Object.keys(obj).forEach((k) => {
      if (SKIP.has(k)) return;
      const v = obj[k];
      if (typeof v === "string") entries.push([obj, k, v]);
      else if (v && typeof v === "object") collect(v);
    });
  }

  function applyData() {
    entries.forEach(([obj, k, orig]) => {
      obj[k] = active && Object.prototype.hasOwnProperty.call(dict, orig) ? dict[orig] : orig;
    });
  }

  function registerData(d) {
    dict = d || {};
    entries = [];
    collect(window.TRIP);
    collect(window.MODULES_PLANNED);
    applyData();
  }

  // Wartungshilfe für die Browser-Konsole
  function check() {
    const originals = new Set(entries.map((e) => e[2]));
    // nur Texte mit mindestens vier Wörtern außerhalb von Links (Namen, Preise, Zeiten bleiben ohnehin gleich)
    const words = (s) => (s.replace(/\[[^\]]*\]\([^)]*\)/g, "").match(/[a-zäöüß]{2,}/gi) || []).length;
    const missing = [...originals].filter((s) => !(s in dict) && words(s) >= 4);
    const orphaned = Object.keys(dict).filter((k) => !originals.has(k));
    console.log(`Mense-Modus: ${Object.keys(dict).length} Übersetzungen, ${missing.length} Texte ohne Übersetzung (bleiben Hochdeutsch), ${orphaned.length} verwaiste Einträge.`);
    if (missing.length) console.table(missing.map((s) => ({ "ohne Übersetzung": s })));
    if (orphaned.length) console.table(orphaned.map((s) => ({ "verwaist (Original geändert?)": s })));
    return { missing, orphaned };
  }

  // ---------- Statische Texte in index.html ----------
  function applyStatic() {
    document.querySelectorAll("[data-kp]").forEach((el) => {
      if (!el.hasAttribute("data-hd")) el.dataset.hd = el.textContent;
      el.textContent = active ? el.dataset.kp : el.dataset.hd;
    });
    document.querySelectorAll("[data-kp-placeholder]").forEach((el) => {
      if (!el.hasAttribute("data-hd-placeholder")) el.dataset.hdPlaceholder = el.placeholder;
      el.placeholder = active ? el.dataset.kpPlaceholder : el.dataset.hdPlaceholder;
    });
    document.querySelectorAll("[data-vice-art]").forEach((el) => {
      el.innerHTML = active && window.ViceArt ? window.ViceArt.scene(el.dataset.viceArt) : "";
    });
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(active));
      btn.title = active ? "Zurück zur normalen Ansicht" : "Mense-Modus: Neon-Optik und alle Texte auf Kurpfälzisch";
      btn.innerHTML = active
        ? `<span class="tt-ic" aria-hidden="true">↩</span><span class="tt-txt">Widder normal</span>`
        : `<span class="tt-ic" aria-hidden="true">🌴</span><span class="tt-txt">Mense-Modus</span>`;
    });
  }

  // Kurzer Einblender beim Einschalten
  function splash() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = document.createElement("div");
    el.className = "vice-splash";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div><strong>Allee hopp!</strong><span>Mense-Modus is aa</span></div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  function set(on) {
    if (on === active) return;
    active = on;
    try { localStorage.setItem(KEY, active ? "kurpfalz" : "normal"); } catch (e) { /* egal */ }
    applyRoot();
    applyData();
    applyStatic();
    listeners.forEach((fn) => { try { fn(active); } catch (e) { console.error(e); } });
    if (active) splash();
  }

  // Neon-Farben für die Stationen (die normale Optik nimmt die Farben aus data.js)
  const VICE_COLORS = { seoul: "#ff7a2f", jeju: "#19d3c5", busan: "#3d9bff", gyeongju: "#b46bff", gangnam: "#ff3d8b" };
  const color = (s) => (active ? VICE_COLORS[s.id] || s.color : s.color);

  document.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-theme-toggle]")) set(!active);
  });
  document.addEventListener("DOMContentLoaded", applyStatic);

  window.Theme = {
    on: () => active,
    t,
    set,
    toggle: () => set(!active),
    onChange(fn) { listeners.push(fn); },
    color,
    registerData,
    check,
  };
})();
