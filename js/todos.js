// To-do-Liste mit Sync über GitHub (Zugriff über js/github.js).
// Die Liste liegt in data/todos.json im Repository. Ohne Token wird sie nur gelesen,
// mit einem persönlichen GitHub-Token (Contents: Read and write) speichert die Seite
// jede Änderung als Commit in diese Datei.
(function () {
  "use strict";

  const GH = window.GitHubStore;
  const CFG = { ...GH.CFG, path: "data/todos.json" };
  const FILTER_KEY = "suedkorea-todo-filter";

  const STATUS = [
    ["offen", "Offen"],
    ["in_arbeit", "In Arbeit"],
    ["erledigt", "Erledigt"],
    ["entfaellt", "Entfällt"],
  ];
  const STATUS_LABEL = Object.fromEntries(STATUS);
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
    if (!t.due) return "ohne Frist";
    if (!OPEN(t)) return fmtDate(t.due);
    const n = daysUntil(t.due);
    if (n < -1) return `${fmtDate(t.due)} · seit ${-n} Tagen überfällig`;
    if (n === -1) return `${fmtDate(t.due)} · seit gestern überfällig`;
    if (n === 0) return `${fmtDate(t.due)} · heute fällig`;
    if (n === 1) return `${fmtDate(t.due)} · morgen`;
    if (n <= 60) return `${fmtDate(t.due)} · in ${n} Tagen`;
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
    if (!token()) { state.error = "Zum Bearbeiten zuerst einen GitHub-Token hinterlegen."; notify(); return false; }
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
      state.error = `Nicht gespeichert: ${e.message || e}`;
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
        `Status: ${STATUS_LABEL[t.status] || t.status}`,
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
        "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape("In einer Woche fällig: " + t.title)}`, "TRIGGER:-P6DT15H", "END:VALARM",
        "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEscape("Heute fällig: " + t.title)}`, "TRIGGER:PT9H", "END:VALARM",
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
    state.items.forEach((t) => {
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
            <select class="todo-status st-${esc(t.status)}" data-act="status" aria-label="Status" ${canEdit ? "" : "disabled title=\"Zum Ändern GitHub-Token hinterlegen\""}>
              ${STATUS.map(([v, l]) => `<option value="${v}"${v === t.status ? " selected" : ""}>${l}</option>`).join("")}
            </select>
          </div>
          <div class="todo-meta">
            <span class="todo-due">📅 ${esc(dueText(t))}</span>
            ${t.category ? `<span class="chip">${esc(t.category)}</span>` : ""}
          </div>
          ${t.description ? `<p class="todo-desc">${md(t.description)}</p>` : ""}
          ${t.links && t.links.length ? `<ul class="todo-links">${t.links.map((l) => `<li>${linkHtml(l)}</li>`).join("")}</ul>` : ""}
          <div class="todo-actions">
            ${t.due ? `<button type="button" class="btn-link" data-act="ics">Kalendereintrag</button>` : ""}
            ${canEdit ? `<button type="button" class="btn-link" data-act="edit">Bearbeiten</button>
            <button type="button" class="btn-link danger" data-act="delete">Löschen</button>` : ""}
          </div>
        </div>
      </article>`;
  }

  function groupsFor(items) {
    if (filter === "erledigt") return [["Erledigt und entfallen", items.filter((t) => !OPEN(t))]];
    const open = items.filter(OPEN);
    const g = [
      ["Überfällig", open.filter((t) => urgency(t) === "overdue")],
      [`Fällig in den nächsten ${SOON_DAYS} Tagen`, open.filter((t) => urgency(t) === "soon")],
      ["Später", open.filter((t) => t.due && !urgency(t))],
      ["Ohne Frist", open.filter((t) => !t.due)],
    ];
    if (filter === "alle") g.push(["Erledigt und entfallen", items.filter((t) => !OPEN(t))]);
    return g;
  }

  function render() {
    if (!mounted || !document.body.contains(mounted)) { mounted = null; return; }
    const { esc } = U();
    const c = counts();
    const tok = token();
    const items = state.items.slice().sort(byDue);

    let sync;
    if (state.saving) sync = `<span class="sync-dot busy"></span> Speichere auf GitHub …`;
    else if (state.loading) sync = `<span class="sync-dot busy"></span> Lade …`;
    else if (tok) sync = `<span class="sync-dot ok"></span> Bearbeiten aktiv · synchronisiert mit GitHub${state.loadedAt ? ` · Stand ${state.loadedAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}` : ""}`;
    else sync = `<span class="sync-dot"></span> Nur lesen. Zum Bearbeiten einen GitHub-Token hinterlegen.`;

    const groups = state.loaded ? groupsFor(items).filter(([, list]) => list.length) : [];

    mounted.innerHTML = `
      <h1>✅ To-dos</h1>
      <p class="muted" style="max-width:70ch">Alles, was vor der Reise zu buchen und zu erledigen ist, mit Frist und Links. Änderungen werden im Repository gespeichert, so sehen alle Geräte denselben Stand.</p>

      <div class="todo-bar card">
        <div class="todo-sync">${sync}</div>
        <div class="todo-bar-actions">
          <button type="button" class="btn" data-act="reload">Neu laden</button>
          <button type="button" class="btn" data-act="ics-all">Alle Fristen als Kalender (.ics)</button>
          <button type="button" class="btn" data-act="token">${tok ? "GitHub-Token" : "Bearbeiten aktivieren"}</button>
        </div>
      </div>

      ${state.error ? `<div class="card todo-error" role="alert">${esc(state.error)}</div>` : ""}

      <div class="todo-stats">
        <div class="stat-box${c.overdue ? " overdue" : ""}"><strong>${c.overdue}</strong><span>überfällig</span></div>
        <div class="stat-box${c.soon ? " soon" : ""}"><strong>${c.soon}</strong><span>in ${SOON_DAYS} Tagen fällig</span></div>
        <div class="stat-box"><strong>${c.offen + c.in_arbeit}</strong><span>offen</span></div>
        <div class="stat-box"><strong>${c.erledigt}</strong><span>erledigt</span></div>
      </div>

      <div class="todo-toolbar">
        <div class="seg" role="group" aria-label="Filter">
          ${[["offen", "Offen"], ["erledigt", "Erledigt"], ["alle", "Alle"]].map(([v, l]) =>
            `<button type="button" data-filter="${v}" aria-pressed="${filter === v}">${l}</button>`).join("")}
        </div>
        ${tok ? `<button type="button" class="btn primary" data-act="new">+ To-do hinzufügen</button>` : ""}
      </div>

      ${!state.loaded && state.loading ? `<p class="muted">Lade To-dos …</p>` : ""}
      ${state.loaded && !groups.length ? `<div class="card soon-card"><p style="margin:0">Hier ist nichts – ${filter === "erledigt" ? "noch nichts erledigt" : "alles erledigt"}.</p></div>` : ""}
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

  function openEditor(t) {
    const { esc } = U();
    const dlg = mounted.querySelector("#todoDialog");
    const isNew = !t;
    t = t || { title: "", category: "", due: "", status: "offen", description: "", links: [] };
    dlg.innerHTML = `
      <form method="dialog" class="todo-form">
        <h2>${isNew ? "Neues To-do" : "To-do bearbeiten"}</h2>
        <label>Titel<input name="title" required value="${esc(t.title)}"></label>
        <div class="form-row">
          <label>Frist<input type="date" name="due" value="${esc(t.due || "")}"></label>
          <label>Status<select name="status">${STATUS.map(([v, l]) => `<option value="${v}"${v === t.status ? " selected" : ""}>${l}</option>`).join("")}</select></label>
        </div>
        <label>Kategorie<input name="category" list="todoCats" value="${esc(t.category || "")}" placeholder="z. B. Hotels">
          <datalist id="todoCats">${[...new Set([...CATEGORIES, ...state.items.map((x) => x.category).filter(Boolean)])].map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
        </label>
        <label>Beschreibung<textarea name="description" rows="4" placeholder="**fett** und [Linktext](https://…) sind möglich">${esc(t.description || "")}</textarea></label>
        <label>Links <span class="muted small">(einer pro Zeile: Titel | https://…)</span>
          <textarea name="links" rows="3" placeholder="Hotel-Website | https://…">${esc((t.links || []).map((l) => (l.title ? `${l.title} | ${l.url}` : l.url)).join("\n"))}</textarea>
        </label>
        <p class="small muted" style="margin:0">Hinweis: Das Repository ist öffentlich. Bitte keine Buchungsnummern, Passdaten oder Zugangsdaten eintragen.</p>
        <div class="form-actions">
          <button type="button" class="btn" value="cancel" data-close>Abbrechen</button>
          <button type="submit" class="btn primary" value="save">Speichern</button>
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
        <h2>Bearbeiten aktivieren</h2>
        <p class="small">Damit die Seite Änderungen speichern kann, braucht sie auf diesem Gerät einmalig einen persönlichen GitHub-Token. So legst du ihn an:</p>
        <ol class="small">
          <li><a href="${newUrl}" target="_blank" rel="noopener">Neuen „Fine-grained token“ anlegen</a> (als <strong>${esc(CFG.owner)}</strong> angemeldet).</li>
          <li>Name z. B. „Südkorea To-dos“, Ablaufdatum z. B. nach der Reise.</li>
          <li>Repository access: <strong>Only select repositories</strong> → <strong>${esc(CFG.repo)}</strong>.</li>
          <li>Permissions → Repository permissions → <strong>Contents: Read and write</strong>.</li>
          <li>„Generate token“ und den Token hier einfügen.</li>
        </ol>
        <label>GitHub-Token<input name="token" type="password" autocomplete="off" placeholder="github_pat_…" value="${esc(tok)}"></label>
        <p class="small muted" style="margin:0">Der Token wird nur in diesem Browser gespeichert. Auf geteilten Geräten nicht verwenden.</p>
        <p class="small todo-error-inline" id="tokenMsg" hidden></p>
        <div class="form-actions">
          ${tok ? `<button type="button" class="btn danger" data-remove>Token entfernen</button>` : ""}
          <button type="button" class="btn" data-close>Abbrechen</button>
          <button type="submit" class="btn primary">Prüfen und speichern</button>
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
      msg.hidden = false; msg.textContent = "Prüfe …";
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
    else if (act === "ics-all") download("suedkorea-todos.ics", buildIcs(state.items.filter(OPEN)));
    else if (act === "ics" && t) download(`todo-${t.id}.ics`, buildIcs([t]));
    else if (act === "edit" && t) openEditor(t);
    else if (act === "delete" && t) {
      if (confirm(`„${t.title}“ löschen?`)) {
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
      `To-do „${t.title}“: ${STATUS_LABEL[status]}`);
  }

  // ---------- Öffentliche Schnittstelle ----------
  window.Todos = {
    state,
    load,
    counts,
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
      if (!state.loaded) return `<p class="muted small" style="margin:0">Lade To-dos …</p>`;
      const c = counts();
      const next = state.items.filter((t) => OPEN(t) && t.due).sort(byDue).slice(0, 4);
      return `
        <p class="small" style="margin:0 0 .6rem">${c.overdue ? `<strong class="txt-overdue">${c.overdue} überfällig</strong> · ` : ""}${c.offen + c.in_arbeit} offen · ${c.erledigt} erledigt</p>
        ${next.length ? `<ul class="todo-teaser">${next.map((t) => `<li class="${urgency(t)}"><span>${esc(t.title)}</span><span class="muted">${esc(fmtDate(t.due))}</span></li>`).join("")}</ul>` : `<p class="muted small" style="margin:0">Nichts offen.</p>`}`;
    },
  };

  listeners.push(render);
  load();
})();
