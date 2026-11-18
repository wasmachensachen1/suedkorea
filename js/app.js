(function () {
  "use strict";

  const T = window.TRIP;
  const view = document.getElementById("view");
  const sidebar = document.getElementById("sidebar");

  // ---------- Helfer ----------
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Mini-Markdown: **fett** und [Text](URL)
  function md(s) {
    let out = esc(s);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, t, u) =>
      `<a href="${u}" target="_blank" rel="noopener">${t}</a>`);
    return out;
  }

  function table(head, rows, opts = {}) {
    const th = head.map((h) => `<th>${esc(h)}</th>`).join("");
    const tr = rows.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join("")}</tr>`).join("");
    const total = opts.total ? `<tr class="total"><td>${esc(opts.total[0])}</td><td class="num">${esc(opts.total[1])}</td></tr>` : "";
    return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tr}${total}</tbody></table></div>`;
  }

  window.TripUtil = { esc, md };
  const Todos = window.Todos;

  const totalNights = T.stations.reduce((n, s) => n + s.nights, 0);

  // ---------- Views ----------
  // Neue Module: hier einen Eintrag ergänzen und in NAV verlinken.
  const VIEWS = {
    uebersicht: renderOverview,
    fluege: renderFlights,
    transfers: renderTransfers,
    kosten: renderCosts,
    tipps: renderTips,
    todos: () => "",
  };
  T.stations.forEach((s) => (VIEWS[s.id] = () => renderStation(s)));
  (window.MODULES_PLANNED || []).forEach((m) => (VIEWS[m.id] = () => renderPlanned(m)));

  const NAV = [
    { label: "Reise", items: [{ id: "uebersicht", title: "Übersicht", icon: "🗺️" }] },
    {
      label: "Stationen",
      items: T.stations.map((s) => ({
        id: s.id, title: `${s.name} · ${s.area}`, dot: s.color, meta: s.dates,
      })),
    },
    {
      label: "Planung",
      items: [
        { id: "fluege", title: "Flüge", icon: "✈️" },
        { id: "transfers", title: "Transfers", icon: "🚆" },
        { id: "kosten", title: "Kosten", icon: "💶" },
        { id: "tipps", title: "Praktische Tipps", icon: "💡" },
        { id: "todos", title: "To-dos", icon: "✅", count: () => Todos.attentionCount(), alert: () => Todos.hasOverdue() },
      ],
    },
    {
      label: "Demnächst",
      items: (window.MODULES_PLANNED || []).map((m) => ({ id: m.id, title: m.title, icon: m.icon, soon: true })),
    },
  ];

  function renderNav(active) {
    sidebar.innerHTML = NAV.map((g) => `
      <div class="nav-group">
        <div class="nav-label">${esc(g.label)}</div>
        ${g.items.map((i) => `
          <a class="nav-link${i.id === active ? " active" : ""}${i.soon ? " soon" : ""}" href="#${i.id}">
            ${i.dot ? `<span class="dot" style="background:${i.dot}"></span>` : `<span>${i.icon || ""}</span>`}
            <span>${esc(i.title)}</span>
            ${i.meta ? `<span class="meta">${esc(i.meta)}</span>` : ""}
            ${i.soon ? `<span class="badge">bald</span>` : ""}
            ${i.count && i.count() ? `<span class="badge count${i.alert && i.alert() ? " alert" : ""}" title="überfällig oder bald fällig">${i.count()}</span>` : ""}
          </a>`).join("")}
      </div>`).join("");
  }

  function renderOverview() {
    const bar = T.stations.map((s) =>
      `<span title="${esc(s.name)} ${esc(s.area)}" style="flex:${s.nights};background:${s.color}"></span>`).join("");
    return `
      <section class="hero">
        <div class="kicker">Reiseplan</div>
        <h1>${esc(T.title)}</h1>
        <p>${md(T.intro)}</p>
        <div class="stats">
          <div class="stat"><strong>${totalNights}</strong><span>Nächte</span></div>
          <div class="stat"><strong>${T.stations.length}</strong><span>Stationen</span></div>
          <div class="stat"><strong>15.9.</strong><span>Abflug FRA</span></div>
          <div class="stat"><strong>6.10.</strong><span>Rückflug ICN</span></div>
        </div>
      </section>

      <h2>Route</h2>
      <div class="route-bar">${bar}</div>
      <div class="route">
        ${T.stations.map((s) => `
          <a class="route-item" href="#${s.id}">
            <div class="route-nr" style="background:${s.color}">${s.nr}</div>
            <div>
              <h3>${esc(s.name)} <span class="muted">(${esc(s.area)})</span></h3>
              <div class="sub">${esc(s.hotel.name)} · ${esc(s.focus)}</div>
            </div>
            <div class="nights"><strong>${s.nights} Nächte</strong>${esc(s.dates)}</div>
          </a>`).join("")}
      </div>

      <h2>Nächste To-dos</h2>
      <a class="card todo-teaser-card" href="#todos" style="display:block;text-decoration:none;color:inherit">
        <div id="todoTeaser">${Todos.teaserHtml()}</div>
      </a>

      <h2>Warum diese Daten</h2>
      <div class="card callout"><p style="margin:0">${md(T.why)}</p></div>

      <h2>Auf einen Blick</h2>
      <div class="grid grid-3">
        <a class="card" href="#fluege" style="text-decoration:none;color:inherit">
          <h3>✈️ Flüge</h3><p class="muted small" style="margin:0">LH712 / LH713 nonstop FRA–ICN, plus zwei Inlandsflüge.</p>
        </a>
        <a class="card" href="#kosten" style="text-decoration:none;color:inherit">
          <h3>💶 Kosten</h3><p class="muted small" style="margin:0">${esc(T.costs.total)} für zwei Personen.</p>
        </a>
        <a class="card" href="#todos" style="text-decoration:none;color:inherit">
          <h3>📅 Buchungsfristen</h3><p class="muted small" style="margin:0">Alle Fristen mit Status in der To-do-Liste.</p>
        </a>
      </div>`;
  }

  function renderStation(s) {
    const tabs = [
      ["tage", "Tagesplan", s.days.length],
      ["sehen", "Sehen & erleben", s.sights.length],
      ["wandern", "Wanderungen", s.hikes.length],
      ["touren", "Ausflüge & Anbieter", s.tours.length],
    ].filter((t) => t[2] > 0);

    const idx = T.stations.indexOf(s);
    const prev = T.stations[idx - 1], next = T.stations[idx + 1];

    return `
      <div style="--c:${s.color}">
        <div class="station-head">
          <div class="kicker">Station ${s.nr} · ${esc(s.dates)} · ${s.nights} Nächte</div>
          <h1>${esc(s.name)} <span class="muted">– ${esc(s.area)}</span></h1>
          <p style="max-width:70ch">${md(s.intro)}</p>
          <div class="chips">${s.focus.split(",").map((f) => `<span class="chip">${esc(f.trim())}</span>`).join("")}</div>
        </div>

        <div class="card hotel">
          <div class="hotel-icon">🏨</div>
          <div>
            <h3 style="margin-bottom:.3rem"><a href="${esc(s.hotel.url)}" target="_blank" rel="noopener">${esc(s.hotel.name)}</a></h3>
            <p class="small" style="margin-bottom:.3rem">${md(s.hotel.text)}</p>
            <span class="price">Richtwert: ${esc(s.hotel.price)}</span>
            ${s.hotel.alt ? `<p class="small" style="margin:.75rem 0 0">${md(s.hotel.alt)}</p>` : ""}
          </div>
        </div>

        <div class="tabs" role="tablist">
          ${tabs.map((t, i) => `<button class="tab" role="tab" data-tab="${t[0]}" aria-selected="${i === 0}">${t[1]}</button>`).join("")}
        </div>
        <div id="panel">${stationPanel(s, tabs[0][0])}</div>

        <div class="grid grid-2" style="margin-top:2rem">
          ${prev ? `<a class="card" href="#${prev.id}" style="text-decoration:none;color:inherit"><span class="muted small">← Vorherige Station</span><br><strong>${esc(prev.name)} (${esc(prev.area)})</strong></a>` : "<div></div>"}
          ${next ? `<a class="card" href="#${next.id}" style="text-decoration:none;color:inherit;text-align:right"><span class="muted small">Nächste Station →</span><br><strong>${esc(next.name)} (${esc(next.area)})</strong></a>` : ""}
        </div>
      </div>`;
  }

  function stationPanel(s, key) {
    switch (key) {
      case "tage":
        return `<div class="days">${s.days.map((d) =>
          `<div class="day"><div class="day-date">${esc(d[0])}</div><div>${md(d[1])}</div></div>`).join("")}</div>`;
      case "sehen":
        return `<ul class="list-plain">${s.sights.map((x) => `<li><strong>${md(x[0])}</strong>${md(x[1])}</li>`).join("")}</ul>`;
      case "wandern":
        return `<ul class="list-plain">${s.hikes.map((x) => `<li><strong>${md(x[0])}</strong>${md(x[1])}</li>`).join("")}</ul>`;
      case "touren":
        return table(["Ausflug", "Anbieter", "Dauer", "Preis (Richtwert)"], s.tours);
    }
    return "";
  }

  function renderFlights() {
    const F = T.flights;
    return `
      <h1>Flüge</h1>
      <p style="max-width:75ch">${md(F.intro)}</p>

      <h2>Vorgeschlagene Flüge</h2>
      <div class="grid grid-2">
        ${F.proposed.map((f) => `
          <div class="card">
            <div class="flight-label">${esc(f.label)} · ${esc(f.date)}</div>
            <div class="flight">
              <div class="end"><strong>${esc(f.from)}</strong><span>${esc(f.fromTime)}</span></div>
              <div class="mid">${esc(f.code)}<div class="line"></div>nonstop</div>
              <div class="end r"><strong>${esc(f.to)}</strong><span>${esc(f.toTime)}</span></div>
            </div>
            ${f.alt ? `<p class="small muted" style="margin:.8rem 0 0">${esc(f.alt)}</p>` : ""}
          </div>`).join("")}
      </div>
      <p class="small muted">${esc(F.proposedNote)}</p>

      <div class="card callout"><strong>Empfehlung:</strong> ${md(F.recommendation)}</div>

      <h2>Langstrecke – Optionen</h2>
      ${table(F.longhaulHead, F.longhaul)}

      <h2>So drückt ihr den Preis über den Reisetag</h2>
      <ul class="list-plain">${F.priceTips.map((t) => `<li>${md(t)}</li>`).join("")}</ul>

      <h2>Inlandsflüge</h2>
      ${table(F.domesticHead, F.domestic)}
      <p class="small">${md(F.domesticNote)}</p>`;
  }

  function renderTransfers() {
    const X = T.transfers;
    return `
      <h1>Transfers zwischen den Stationen</h1>
      <p style="max-width:75ch">${md(X.intro)}</p>
      ${table(X.head, X.rows)}
      <div class="card callout"><strong>KTX:</strong> ${md(X.note)}</div>`;
  }

  function renderCosts() {
    const C = T.costs;
    return `
      <h1>Kosten</h1>
      <p class="muted">${esc(C.title)}</p>
      ${table(["Posten", "Spanne"], C.rows, { total: ["Summe", C.total] })}
      <p class="small">${md(C.note)}</p>
      <h2>Hotels pro Nacht (Richtwerte)</h2>
      ${table(["Station", "Hotel", "Nächte", "Preis pro Nacht"],
        T.stations.map((s) => [`${s.name} (${s.area})`, `[${s.hotel.name}](${s.hotel.url})`, String(s.nights), s.hotel.price]))}`;
  }

  function renderTips() {
    return `
      <h1>Praktische Tipps</h1>
      <div class="grid grid-2">
        ${T.tips.map((t) => `
          <div class="card tip">
            <h3><span>${t.icon}</span>${esc(t.title)}</h3>
            ${t.text ? `<p style="margin:0">${md(t.text)}</p>` : ""}
            ${t.list ? `<ul>${t.list.map((l) => `<li>${md(l)}</li>`).join("")}</ul>` : ""}
          </div>`).join("")}
      </div>
      <h2>Quellen</h2>
      <ul class="sources">${T.sources.map((s) => `<li>${md(s)}</li>`).join("")}</ul>`;
  }

  function renderPlanned(m) {
    return `
      <h1>${m.icon} ${esc(m.title)}</h1>
      <div class="card soon-card">
        <p class="ic">🚧</p>
        <p><strong>Kommt in einem nächsten Schritt.</strong></p>
        <p class="muted" style="margin:0">${esc(m.text)}</p>
      </div>`;
  }

  // ---------- Countdown ----------
  function renderCountdown() {
    const el = document.getElementById("countdown");
    const ms = new Date(T.departure) - new Date();
    if (ms <= 0) { el.innerHTML = "<strong>Gute Reise!</strong>"; return; }
    const days = Math.ceil(ms / 86400000);
    el.innerHTML = `<small class="long">Noch </small><strong>${days.toLocaleString("de-DE")}</strong> <small>Tage<span class="long"> bis zum Abflug</span></small>`;
  }

  // ---------- Router ----------
  let current = "";
  Todos.subscribe(() => {
    renderNav(current);
    const teaser = document.getElementById("todoTeaser");
    if (teaser) teaser.innerHTML = Todos.teaserHtml();
  });

  function route() {
    let id = (location.hash || "").slice(1);
    if (!VIEWS[id]) id = "uebersicht";
    const station = T.stations.find((s) => s.id === id);
    view.innerHTML = station ? renderStation(station) : VIEWS[id]();
    if (station) bindTabs(station);
    if (id === "todos") Todos.mount(view);
    current = id;
    renderNav(id);
    sidebar.classList.remove("open");
    window.scrollTo(0, 0);
    document.title = (station ? `${station.name} (${station.area}) · ` : "") + "Südkorea-Rundreise 2027";
  }

  function bindTabs(s) {
    const panelEl = document.getElementById("panel");
    view.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        view.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
        panelEl.innerHTML = stationPanel(s, btn.dataset.tab);
      });
    });
  }

  document.getElementById("menuBtn").addEventListener("click", () => sidebar.classList.toggle("open"));
  window.addEventListener("hashchange", route);
  renderCountdown();
  route();
})();
