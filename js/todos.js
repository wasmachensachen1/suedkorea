// To-do-Liste mit Sync über GitHub (Zugriff über js/github.js).
// Die Liste liegt in data/todos.json im Repository. Ohne Token wird sie nur gelesen,
// mit einem persönlichen GitHub-Token (Contents: Read and write) speichert die Seite
// jede Änderung als Commit in diese Datei.
(function () {
  "use strict";

  const GH = window.GitHubStore;
  const CFG = { ...GH.CFG, path: "data/todos.json" };
  const FILTER_KEY = "suedkorea-todo-filter";

  const L = (hd, kp) => window.Theme.t(hd, kp); // hochdeutsch / kurpfälzisch
  const STATUS_HD = [
    ["offen", "Offen"],
    ["in_arbeit", "In Arbeit"],
    ["erledigt", "Erledigt"],
    ["entfaellt", "Entfällt"],
  ];
  const STATUS_KP = { offen: "Offe", in_arbeit: "Am Schaffe", erledigt: "Erledischt", entfaellt: "Fällt flach" };
  const STATUS_LABEL = Object.fromEntries(STATUS_HD); // für Commit-Nachrichten (immer Hochdeutsch)
  const statusList = () => STATUS_HD.map(([v, l]) => [v, L(l, STATUS_KP[v])]);
  const statusLabel = (v) => L(STATUS_LABEL[v] || v, STATUS_KP[v] || v);
  const OPEN = (t) => t.status === "offen" || t.status === "in_arbeit";
  const CATEGORIES = ["Flüge", "Hotels", "Transport", "Touren", "Einreise", "Vorbereitung"];
  const SOON_DAYS = 14;

  const state = {
    items: [],
    sha: null,
    loaded: false,
    loading: false,
    saving: false,
    error: "",
    loadedAt: null,
  };
  const listeners = [];

  // ---------- Helfer ----------
  const U = () => window.TripUtil; // esc, md aus app.js
  // Ansicht eines To-dos im aktuellen Plan: Platzhalter in Titel und Beschreibung ersetzt
  // ({d:2027-09-21} usw., siehe js/plan.js), Frist um die Verschiebung des Plans verschoben.
  // Gespeichert wird immer der ursprüngliche Stand.
  const P = () => window.Plan;
  function view(t) {
    const p = P();
    if (!p) return t;
    return { ...t, title: p.expand(t.title), description: p.expand(t.description || ""), due: p.shiftDue(t.due), raw: t };
  }
  const views = () => state.items.map(view);
  const lsGet = GH.lsGet;
  const lsSet = GH.lsSet;
  const token = GH.token;

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function daysUntil(due) {
    const [y, m, d] = due.split("-").map(Number);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - t) / 86400000);
  }
  function fmtDate(due) {
    const [y, m, d] = due.split("-").map(Number);
    const wd = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][new Date(y, m - 1, d).getDay()];
    return `${wd} ${d}.${m}.${y}`;
  }
  function urgency(t) {
    if (!OPEN(t) || !t.due) return "";
    const n = daysUntil(t.due);
    if (n < 0) return "overdue";
    if (n <= SOON_DAYS) return "soon";
    return "";
  }
  function dueText(t) {
    if (!t.due) return L("ohne Frist", "ohne Frischd");
    if (!OPEN(t)) return fmtDate(t.due);
    const n = daysUntil(t.due);
    if (n < -1) return `${fmtDate(t.due)} · ${L(`seit ${-n} Tagen überfällig`, `seit ${-n} Dääch iwwerfällisch`)}`;
    if (n === -1) return `${fmtDate(t.due)} · ${L("seit gestern überfällig", "seit geschdern iwwerfällisch")}`;
    if (n === 0) return `${fmtDate(t.due)} · ${L("heute fällig", "heit fällisch")}`;
    if (n === 1) return `${fmtDate(t.due)} · ${L("morgen", "morje")}`;
    if (n <= 60) return `${fmtDate(t.due)} · ${L(`in ${n} Tagen`, `in ${n} Dääch`)}`;
    return fmtDate(t.due);
  }
  const byDue = (a, b) => (a.due || "9999").localeCompare(b.due || "9999") || a.title.localeCompare(b.title, "de");
  const newId = () => "t-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function notify() { listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); }

  // ---------- GitHub ----------
  const fetchRemote = (tok) => GH.readJson(CFG.path, tok);

  async function load() {
    state.loading = true; state.error = ""; notify();
    try {
      const { data, sha } = await fetchRemote();
      state.items = Array.isArray(data.items) ? data.items : [];
      state.sha = sha;
      state.loaded = true;
      state.loadedAt = new Date();
    } catch (e) {
      state.error = e.message || String(e);
    } finally {
      state.loading = false; notify();
    }
  }

  // Änderung frisch auf den aktuellen Stand anwenden und speichern; bei Konflikt neu versuchen.
  async function mutate(fn, message) {
    if (!token()) { state.error = L("Zum Bearbeiten zuerst einen GitHub-Token hinterlegen.", "Zum Bearbeide erschd mol en GitHub-Token hinnerlege."); notify(); return false; }
    state.saving = true; state.error = "";
    const optimistic = JSON.parse(JSON.stringify(state.items));
    fn(optimistic);
    state.items = optimistic;
    notify();
    try {
      const res = await GH.updateJson(CFG.path, (data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        fn(items);
        items.sort(byDue);
        return { version: 1, items };
      }, message);
      state.items = res.data.items;
      state.sha = res.sha;
      state.loadedAt = new Date();
      return true;
    } catch (e) {
      state.error = `${L("Nicht gespeichert", "Net gspeichert")}: ${e.message || e}`;
      await load().catch(() => {});
      return false;
    } finally {
      state.saving = false; notify();
    }
  }

  // ---------- Kalender (.ics) ----------
  function icsEscape(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  }
  function icsFold(line) {
    const enc = new TextEncoder();
    if (enc.encode(line).length <= 75) return line;
    const out = []; let cur = ""; let len = 0;
    for (const ch of line) {
      const l = enc.encode(ch).length;
      if (len + l > (out.length ? 74 : 75)) { out.push(cur); cur = ""; len = 0; }
      cur += ch; len += l;
    }
    out.push(cur);
    return out.join("\r\n ");
  }
  const plain = (s) => String(s || "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "$1 ($2)");
  const ymd = (s) => s.replace(/-/g, "");
  function nextDay(due) {
    const [y, m, d] = due.split("-").map(Number);
    const n = new Date(Date.UTC(y, m - 1, d + 1));
    return n.toISOString().slice(0, 10).replace(/-/g, "");
  }

  function buildIcs(items) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    const L = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Suedkorea 2027//To-dos//DE",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Südkorea 2027 – To-dos",
    ];
    items.filter((t) => t.due).forEach((t) => {
      const desc = [
        plain(t.description),
        ...(t.links || []).map((l) => (l.title ? `${l.title}: ${l.url}` : l.url)),
        `${L("Status", "Schdatus")}: ${statusLabel(t.status)}`,
      ].filter(Boolean).join("\n\n");
      L.push(
        "BEGIN:VEVENT",
        `UID:${t.id}@suedkorea-2027`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(t.due)}`,
        `DTEND;VALUE=DATE:${nextDay(t.due)}`,
        `SUMMARY:${icsEscape("Südkorea: " + t.title)}`,
        `DESCRIPTION:${icsEscape(desc)}`,
        ...(t.links && t.links[0] ? [`URL:${t.links[0].url}`] : []),
        ...(t.category ? [`CATEGORIES:${icsEscape(t.category)}`] : []),
        "TRANSP:TRANSPARENT",
        // Erinnerung eine Woche vorher um 9 Uhr und am Fristtag um 9 Uhr
        "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(L("In einer Woche fällig: ", "In ännere Woch fällisch: ") + t.title)}`, "TRIGGER:-P6DT15H", "END:VALARM",
        "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape(L("Heute fällig: ", "Heit fällisch: ") + t.title)}`, "TRIGGER:PT9H", "END:VALARM",
        "END:VEVENT",
      );
    });
    L.push("END:VCALENDAR");
    return L.map(icsFold).join("\r\n") + "\r\n";
  }

  function download(name, text) {
    const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  // ---------- Darstellung ----------
  let mounted = null; // Container der To-do-Seite, solange sie angezeigt wird
  let filter = lsGet(FILTER_KEY) || "offen";

  function counts() {
    const c = { offen: 0, in_arbeit: 0, erledigt: 0, entfaellt: 0, overdue: 0, soon: 0 };
    views().forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
      const u = urgency(t);
      if (u) c[u]++;
    });
    return c;
  }

  function linkHtml(l) {
    const { esc } = U();
    if (!/^https?:\/\//i.test(l.url || "")) return "";
    return `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title || l.url.replace(/^https?:\/\/(www\.)?/, ""))}</a>`;
  }

  function itemHtml(t) {
    const { esc, md } = U();
    const u = urgency(t);
    const canEdit = !!token();
    return `
      <article class="todo ${u} st-${esc(t.status)}" data-id="${esc(t.id)}">
        <div class="todo-main">
          <div class="todo-top">
            <h3>${esc(t.title)}</h3>
            <select class="todo-status st-${esc(t.status)}" data-act="status" aria-label="${L("Status", "Schdatus")}" ${canEdit ? "" : `disabled title="${L("Zum Ändern GitHub-Token hinterlegen", "Zum Ännere GitHub-Token hinnerlege")}"`}>
              ${statusList().map(([v, l]) => `<option value="${v}"${v === t.status ? " selected" : ""}>${l}</option>`).join("")}
            </select>
          </div>
          <div class="todo-meta">
            <span class="todo-due">📅 ${esc(dueText(t))}</span>
            ${t.category ? `<span class="chip">${esc(t.category)}</span>` : ""}
          </div>
          ${t.description ? `<p class="todo-desc">${md(t.description)}</p>` : ""}
          ${t.links && t.links.length ? `<ul class="todo-links">${t.links.map((l) => `<li>${linkHtml(l)}</li>`).join("")}</ul>` : ""}
          <div class="todo-actions">
            ${t.due ? `<button type="button" class="btn-link" data-act="ics">${L("Kalendereintrag", "In de Kalenner")}</button>` : ""}
            ${canEdit ? `<button type="button" class="btn-link" data-act="edit">${L("Bearbeiten", "Bearbeide")}</button>
            <button type="button" class="btn-link danger" data-act="delete">${L("Löschen", "Wegmache")}</button>` : ""}
          </div>
        </div>
      </article>`;
  }

  function groupsFor(items) {
    const done = L("Erledigt und entfallen", "Erledischt un flachgfalle");
    if (filter === "erledigt") return [[done, items.filter((t) => !OPEN(t))]];
    const open = items.filter(OPEN);
    const g = [
      [L("Überfällig", "Iwwerfällisch"), open.filter((t) => urgency(t) === "overdue")],
      [L(`Fällig in den nächsten ${SOON_DAYS} Tagen`, `Fällisch in de nägschde ${SOON_DAYS} Dääch`), open.filter((t) => urgency(t) === "soon")],
      [L("Später", "Schbäder"), open.filter((t) => t.due && !urgency(t))],
      [L("Ohne Frist", "Ohne Frischd"), open.filter((t) => !t.due)],
    ];
    if (filter === "alle") g.push([done, items.filter((t) => !OPEN(t))]);
    return g;
  }

  function render() {
    if (!mounted || !document.body.contains(mounted)) { mounted = null; return; }
    const { esc } = U();
    const c = counts();
    const tok = token();
    const items = views().sort(byDue);
    const shift = P() ? P().state.shift : 0;

    let sync;
    if (state.saving) sync = `<span class="sync-dot busy"></span> ${L("Speichere auf GitHub …", "Schbeicher uff GitHub …")}`;
    else if (state.loading) sync = `<span class="sync-dot busy"></span> ${L("Lade …", "Lad …")}`;
    else if (tok) sync = `<span class="sync-dot ok"></span> ${L("Bearbeiten aktiv · synchronisiert mit GitHub", "Bearbeide is aa · mit GitHub abgeglische")}${state.loadedAt ? ` · ${L("Stand", "Schdand")} ${state.loadedAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}` : ""}`;
    else sync = `<span class="sync-dot"></span> ${L("Nur lesen. Zum Bearbeiten einen GitHub-Token hinterlegen.", "Nur gugge. Zum Bearbeide en GitHub-Token hinnerlege.")}`;

    const groups = state.loaded ? groupsFor(items).filter(([, list]) => list.length) : [];

    mounted.innerHTML = `
      <h1>✅ To-dos</h1>
      <p class="muted" style="max-width:70ch">${L("Alles, was vor der Reise zu buchen und zu erledigen ist, mit Frist und Links. Änderungen werden im Repository gespeichert, so sehen alle Geräte denselben Stand.", "Alles, was mer vor de Reis noch buche un erledische muss, mit Frischd un Links. Was ihr ännert, landet im Repository, so hänn all Gerät denselwe Schdand.")}</p>

      <div class="todo-bar card">
        <div class="todo-sync">${sync}</div>
        <div class="todo-bar-actions">
          <button type="button" class="btn" data-act="reload">${L("Neu laden", "Nei lade")}</button>
          <button type="button" class="btn" data-act="ics-all">${L("Alle Fristen als Kalender (.ics)", "All Frischde als Kalenner (.ics)")}</button>
          <button type="button" class="btn" data-act="token">${tok ? "GitHub-Token" : L("Bearbeiten aktivieren", "Bearbeide oschalde")}</button>
        </div>
      </div>

      ${state.error ? `<div class="card todo-error" role="alert">${esc(state.error)}</div>` : ""}
      ${shift ? `<div class="card callout shift-note small">📅 ${L(`Der Reiseplan ist durch die Flugwahl um ${shift > 0 ? "+" : ""}${shift} Tag${Math.abs(shift) > 1 ? "e" : ""} verschoben. Reisedaten in den Texten und alle Fristen sind entsprechend angepasst.`, `De Reiseblan is wege de Fliegerwahl um ${shift > 0 ? "+" : ""}${shift} Daach verschowe. Reisedate in de Texte un all Frischde sinn agepasst.`)}</div>` : ""}

      <div class="todo-stats">
        <div class="stat-box${c.overdue ? " overdue" : ""}"><strong>${c.overdue}</strong><span>${L("überfällig", "iwwerfällisch")}</span></div>
        <div class="stat-box${c.soon ? " soon" : ""}"><strong>${c.soon}</strong><span>${L(`in ${SOON_DAYS} Tagen fällig`, `in ${SOON_DAYS} Dääch fällisch`)}</span></div>
        <div class="stat-box"><strong>${c.offen + c.in_arbeit}</strong><span>${L("offen", "offe")}</span></div>
        <div class="stat-box"><strong>${c.erledigt}</strong><span>${L("erledigt", "erledischt")}</span></div>
      </div>

      <div class="todo-toolbar">
        <div class="seg" role="group" aria-label="Filter">
          ${[["offen", L("Offen", "Offe")], ["erledigt", L("Erledigt", "Erledischt")], ["alle", L("Alle", "All")]].map(([v, l]) =>
            `<button type="button" data-filter="${v}" aria-pressed="${filter === v}">${l}</button>`).join("")}
        </div>
        ${tok ? `<button type="button" class="btn primary" data-act="new">${L("+ To-do hinzufügen", "+ To-do dezu due")}</button>` : ""}
      </div>

      ${!state.loaded && state.loading ? `<p class="muted">${L("Lade To-dos …", "Lad To-dos …")}</p>` : ""}
      ${state.loaded && !groups.length ? `<div class="card soon-card"><p style="margin:0">${filter === "erledigt" ? L("Hier ist nichts – noch nichts erledigt.", "Do is nix – noch nix erledischt.") : L("Hier ist nichts – alles erledigt.", "Do is nix – alles erledischt. Allemol!")}</p></div>` : ""}
      ${groups.map(([title, list]) => `
        <h2 class="todo-group">${esc(title)} <span class="muted">${list.length}</span></h2>
        <div class="todo-list">${list.map(itemHtml).join("")}</div>`).join("")}

      <dialog class="todo-dialog" id="todoDialog"></dialog>`;
  }

  function findItem(el) {
    const art = el.closest(".todo");
    return art && state.items.find((t) => t.id === art.dataset.id);
  }

  function parseLinks(text) {
    return text.split("\n").map((s) => s.trim()).filter(Boolean).map((line) => {
      const m = line.match(/^(.*?)\s*\|\s*(https?:\/\/\S+)$/i);
      if (m) return { title: m[1].trim(), url: m[2] };
      const u = line.match(/https?:\/\/\S+/i);
      return u ? { title: line.replace(u[0], "").replace(/[|:\-–\s]+$/, "").trim(), url: u[0] } : null;
    }).filter(Boolean);
  }

  function openEditor(raw) {
    const { esc } = U();
    const dlg = mounted.querySelector("#todoDialog");
    const isNew = !raw;
    const t = raw ? view(raw) : { title: "", category: "", due: "", status: "offen", description: "", links: [] };
    dlg.innerHTML = `
      <form method="dialog" class="todo-form">
        <h2>${isNew ? L("Neues To-do", "Neies To-do") : L("To-do bearbeiten", "To-do bearbeide")}</h2>
        <label>${L("Titel", "Didel")}<input name="title" required value="${esc(t.title)}"></label>
        <div class="form-row">
          <label>${L("Frist", "Frischd")}<input type="date" name="due" value="${esc(t.due || "")}"></label>
          <label>${L("Status", "Schdatus")}<select name="status">${statusList().map(([v, l]) => `<option value="${v}"${v === t.status ? " selected" : ""}>${l}</option>`).join("")}</select></label>
        </div>
        <label>${L("Kategorie", "Kadegorie")}<input name="category" list="todoCats" value="${esc(t.category || "")}" placeholder="${L("z. B. Hotels", "z. B. Hodels")}">
          <datalist id="todoCats">${[...new Set([...CATEGORIES, ...state.items.map((x) => x.category).filter(Boolean)])].map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
        </label>
        <label>${L("Beschreibung", "Beschreiwung")}<textarea name="description" rows="4" placeholder="${L("**fett** und [Linktext](https://…) sind möglich", "**fett** un [Linktext](https://…) gehn aa")}">${esc(t.description || "")}</textarea></label>
        <label>Links <span class="muted small">${L("(einer pro Zeile: Titel | https://…)", "(ääner pro Zeil: Didel | https://…)")}</span>
          <textarea name="links" rows="3" placeholder="${L("Hotel-Website | https://…", "Hodel-Webseit | https://…")}">${esc((t.links || []).map((l) => (l.title ? `${l.title} | ${l.url}` : l.url)).join("\n"))}</textarea>
        </label>
        <p class="small muted" style="margin:0">${L("Hinweis: Das Repository ist öffentlich. Bitte keine Buchungsnummern, Passdaten oder Zugangsdaten eintragen.", "Uffbasse: Des Repository is öffentlich. Kää Buchungsnummern, Passdaten odder Zugangsdaten neischreiwe!")}</p>
        <div class="form-actions">
          <button type="button" class="btn" value="cancel" data-close>${L("Abbrechen", "Loss es")}</button>
          <button type="submit" class="btn primary" value="save">${L("Speichern", "Schbeichere")}</button>
        </div>
      </form>`;
    dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
    dlg.querySelector("form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const f = ev.target.elements;
      const val = {
        title: f.namedItem("title").value.trim(),
        due: f.namedItem("due").value,
        status: f.namedItem("status").value,
        category: f.namedItem("category").value.trim(),
        description: f.namedItem("description").value.trim(),
        links: parseLinks(f.namedItem("links").value),
      };
      if (!val.title) return;
      // Unveränderte Texte behalten ihre Platzhalter; Fristen zurück auf den ursprünglichen Plan rechnen
      if (!isNew && val.title === t.title) val.title = raw.title;
      if (!isNew && val.description === (t.description || "").trim()) val.description = raw.description || "";
      if (!isNew && val.due === t.due) val.due = raw.due || "";
      else if (val.due && P()) val.due = P().unshiftDue(val.due);
      dlg.close();
      if (isNew) {
        const id = newId();
        mutate((items) => items.push({ id, ...val }), `To-do hinzugefügt: ${val.title}`);
      } else {
        const id = t.id;
        mutate((items) => {
          const x = items.find((i) => i.id === id);
          if (x) Object.assign(x, val);
        }, `To-do geändert: ${val.title}`);
      }
    });
    dlg.showModal();
    dlg.querySelector("input[name=title]").focus();
  }

  function openTokenDialog() {
    const { esc } = U();
    const dlg = mounted.querySelector("#todoDialog");
    const tok = token();
    const newUrl = "https://github.com/settings/personal-access-tokens/new";
    dlg.innerHTML = `
      <form method="dialog" class="todo-form">
        <h2>${L("Bearbeiten aktivieren", "Bearbeide oschalde")}</h2>
        <p class="small">${L("Damit die Seite Änderungen speichern kann, braucht sie auf diesem Gerät einmalig einen persönlichen GitHub-Token. So legst du ihn an:", "Dass die Seit ebbes schbeichere kann, braucht's uff dem Gerät ämol en persönliche GitHub-Token. So legsch'n o:")}</p>
        <ol class="small">
          <li><a href="${newUrl}" target="_blank" rel="noopener">${L("Neuen „Fine-grained token“ anlegen", "En neie „Fine-grained token“ olege")}</a> (${L("als", "als")} <strong>${esc(CFG.owner)}</strong> ${L("angemeldet", "ogemeldet")}).</li>
          <li>${L("Name z. B. „Südkorea To-dos“, Ablaufdatum z. B. nach der Reise.", "Name z. B. „Südkorea To-dos“, Ablaufdatum z. B. nach de Reis.")}</li>
          <li>Repository access: <strong>Only select repositories</strong> → <strong>${esc(CFG.repo)}</strong>.</li>
          <li>Permissions → Repository permissions → <strong>Contents: Read and write</strong>.</li>
          <li>${L("„Generate token“ und den Token hier einfügen.", "„Generate token“ un de Token do neidue.")}</li>
        </ol>
        <label>GitHub-Token<input name="token" type="password" autocomplete="off" placeholder="github_pat_…" value="${esc(tok)}"></label>
        <p class="small muted" style="margin:0">${L("Der Token wird nur in diesem Browser gespeichert. Auf geteilten Geräten nicht verwenden.", "De Token bleibt nur in dem Browser do. Uff Gerät, wo aa annere dran gehn, net nemme.")}</p>
        <p class="small todo-error-inline" id="tokenMsg" hidden></p>
        <div class="form-actions">
          ${tok ? `<button type="button" class="btn danger" data-remove>${L("Token entfernen", "Token wegmache")}</button>` : ""}
          <button type="button" class="btn" data-close>${L("Abbrechen", "Loss es")}</button>
          <button type="submit" class="btn primary">${L("Prüfen und speichern", "Brife un schbeichere")}</button>
        </div>
      </form>`;
    dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
    const rm = dlg.querySelector("[data-remove]");
    if (rm) rm.addEventListener("click", () => { GH.setToken(""); dlg.close(); load(); });
    dlg.querySelector("form").addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const val = ev.target.elements.namedItem("token").value.trim();
      const msg = dlg.querySelector("#tokenMsg");
      if (!val) return;
      msg.hidden = false; msg.textContent = L("Prüfe …", "Brif …");
      try {
        await fetchRemote(val);
        GH.setToken(val);
        dlg.close();
        load();
      } catch (e) {
        msg.textContent = e.message || String(e);
      }
    });
    dlg.showModal();
  }

  function onClick(ev) {
    const f = ev.target.closest("[data-filter]");
    if (f) { filter = f.dataset.filter; lsSet(FILTER_KEY, filter); render(); return; }
    const b = ev.target.closest("[data-act]");
    if (!b || b.tagName === "SELECT") return;
    const act = b.dataset.act;
    const t = findItem(b);
    if (act === "reload") load();
    else if (act === "token") openTokenDialog();
    else if (act === "new") openEditor(null);
    else if (act === "ics-all") download("suedkorea-todos.ics", buildIcs(views().filter(OPEN)));
    else if (act === "ics" && t) download(`todo-${t.id}.ics`, buildIcs([view(t)]));
    else if (act === "edit" && t) openEditor(t);
    else if (act === "delete" && t) {
      if (confirm(L(`„${view(t).title}“ löschen?`, `„${view(t).title}“ werklich wegmache?`))) {
        const id = t.id;
        mutate((items) => { const i = items.findIndex((x) => x.id === id); if (i >= 0) items.splice(i, 1); }, `To-do gelöscht: ${t.title}`);
      }
    }
  }

  function onChange(ev) {
    const sel = ev.target.closest("select[data-act=status]");
    if (!sel) return;
    const t = findItem(sel);
    if (!t) return;
    const id = t.id, status = sel.value;
    mutate((items) => { const x = items.find((i) => i.id === id); if (x) x.status = status; },
      `To-do „${view(t).title}“: ${STATUS_LABEL[status]}`);
  }

  // ---------- Öffentliche Schnittstelle ----------
  window.Todos = {
    state,
    load,
    counts,
    // Änderung an der Liste speichern (z. B. aus dem Hotel-Konfigurator): fn(items) ändert die Liste
    update: mutate,
    subscribe(fn) { listeners.push(fn); },
    // Zahl für das Menü: überfällig + bald fällig
    attentionCount() { const c = counts(); return c.overdue + c.soon; },
    hasOverdue() { return counts().overdue > 0; },
    mount(el) {
      mounted = document.createElement("div");
      mounted.className = "todos";
      el.innerHTML = "";
      el.appendChild(mounted);
      mounted.addEventListener("click", onClick);
      mounted.addEventListener("change", onChange);
      render();
      if (!state.loaded && !state.loading) load();
    },
    // Kurzübersicht für die Startseite
    teaserHtml() {
      const { esc } = U();
      if (!state.loaded) return `<p class="muted small" style="margin:0">${L("Lade To-dos …", "Lad To-dos …")}</p>`;
      const c = counts();
      const next = views().filter((t) => OPEN(t) && t.due).sort(byDue).slice(0, 4);
      return `
        <p class="small" style="margin:0 0 .6rem">${c.overdue ? `<strong class="txt-overdue">${c.overdue} ${L("überfällig", "iwwerfällisch")}</strong> · ` : ""}${c.offen + c.in_arbeit} ${L("offen", "offe")} · ${c.erledigt} ${L("erledigt", "erledischt")}</p>
        ${next.length ? `<ul class="todo-teaser">${next.map((t) => `<li class="${urgency(t)}"><span>${esc(t.title)}</span><span class="muted">${esc(fmtDate(t.due))}</span></li>`).join("")}</ul>` : `<p class="muted small" style="margin:0">${L("Nichts offen.", "Nix offe.")}</p>`}`;
    },
  };

  listeners.push(render);
  // Plan verschoben: Fristen und Texte neu anzeigen
  if (window.Plan) window.Plan.onChange(() => notify());
  load();
})();
