(function () {
  "use strict";

  const T = window.TRIP;
  const Theme = window.Theme;
  const L = Theme.t; // L(hochdeutsch, kurpfälzisch)
  const col = Theme.color;
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
  const Hotels = window.Hotels;
  const eur = Hotels.eur;
  const range = (min, max) => (Math.round(min) === Math.round(max) ? eur(min) : `${Math.round(min).toLocaleString("de-DE")} – ${eur(max)}`);

  // Kosten mit den Hotels aus dem Reiseplan (gewählt oder Planvorschlag)
  function costSummary() {
    const hotel = T.stations.reduce((a, s) => {
      const c = Hotels.costRange(s);
      a.min += c.min; a.max += c.max; if (c.fixed) a.chosen++;
      return a;
    }, { min: 0, max: 0, chosen: 0 });
    const rows = T.costs.rows.map((r) => (r.id === "hotels"
      ? { ...r, min: hotel.min, max: hotel.max,
          label: `${r.label} (${hotel.chosen ? L(`${hotel.chosen} von ${T.stations.length} im Konfigurator gewählt`, `${hotel.chosen} vun ${T.stations.length} im Konfigurador ausgsucht`) : L("Planvorschläge, gehoben", "Planvorschläsch, gehowe")})` }
      : r));
    const min = rows.reduce((n, r) => n + r.min, 0), max = rows.reduce((n, r) => n + r.max, 0);
    return { rows, min, max, total: `ca. ${range(min, max)}` };
  }

  // {hotel:<station-id>} in Texten durch das Hotel im Reiseplan ersetzen
  const hotelName = (id) => { const s = T.stations.find((x) => x.id === id); return s ? Hotels.effective(s).name : id; };
  const withHotels = (text) => String(text).replace(/\{hotel:([a-z0-9-]+)\}/g, (_, id) => hotelName(id));

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
    hotels: () => "",
  };
  T.stations.forEach((s) => (VIEWS[s.id] = () => renderStation(s)));
  (window.MODULES_PLANNED || []).forEach((m) => (VIEWS[m.id] = () => renderPlanned(m)));

  // als Funktion, damit Texte und Farben nach dem Umschalten der Optik stimmen
  const nav = () => [
    { label: L("Reise", "Reis"), items: [{ id: "uebersicht", title: L("Übersicht", "Iwwersicht"), icon: "🗺️" }] },
    {
      label: L("Stationen", "Schdatione"),
      items: T.stations.map((s) => ({
        id: s.id, title: `${s.name} · ${s.area}`, dot: col(s), meta: s.dates,
      })),
    },
    {
      label: L("Planung", "Blanung"),
      items: [
        { id: "fluege", title: L("Flüge", "Flieger"), icon: "✈️" },
        { id: "hotels", title: L("Hotels", "Hodels"), icon: "🏨" },
        { id: "transfers", title: L("Transfers", "Fahrerei"), icon: "🚆" },
        { id: "kosten", title: L("Kosten", "Was es koscht"), icon: "💶" },
        { id: "tipps", title: L("Praktische Tipps", "Braktische Dibbs"), icon: "💡" },
        { id: "todos", title: "To-dos", icon: "✅", count: () => Todos.attentionCount(), alert: () => Todos.hasOverdue() },
      ],
    },
    {
      label: L("Demnächst", "Demnächschd"),
      items: (window.MODULES_PLANNED || []).map((m) => ({ id: m.id, title: m.title, icon: m.icon, soon: true })),
    },
  ].filter((g) => g.items.length);

  // Illustration (nur im Kurpfalz-Modus)
  const art = (key, label, cls = "") => (Theme.on() && window.ViceArt
    ? `<div class="vice-art ${cls}">${window.ViceArt.scene(key, label)}</div>` : "");

  function renderNav(active) {
    sidebar.innerHTML = nav().map((g) => `
      <div class="nav-group">
        <div class="nav-label">${esc(g.label)}</div>
        ${g.items.map((i) => `
          <a class="nav-link${i.id === active ? " active" : ""}${i.soon ? " soon" : ""}" href="#${i.id}">
            ${i.dot ? `<span class="dot" style="background:${i.dot}"></span>` : `<span>${i.icon || ""}</span>`}
            <span>${esc(i.title)}</span>
            ${i.meta ? `<span class="meta">${esc(i.meta)}</span>` : ""}
            ${i.soon ? `<span class="badge">${L("bald", "bald")}</span>` : ""}
            ${i.count && i.count() ? `<span class="badge count${i.alert && i.alert() ? " alert" : ""}" title="${L("überfällig oder bald fällig", "iwwerfällisch odder bald fällisch")}">${i.count()}</span>` : ""}
          </a>`).join("")}
      </div>`).join("");
  }

  function renderOverview() {
    const bar = T.stations.map((s) =>
      `<span title="${esc(s.name)} ${esc(s.area)}" style="flex:${s.nights};background:${col(s)}"></span>`).join("");
    return `
      <section class="hero">
        ${art("overview", L("Sonnenuntergang über Seoul", "Sunneunnergang iwwer Seoul"), "hero-art")}
        <div class="kicker">${L("Reiseplan", "Reiseblan")}</div>
        <h1>${esc(T.title)}</h1>
        <p>${md(T.intro)}</p>
        <div class="stats">
          <div class="stat"><strong>${totalNights}</strong><span>${L("Nächte", "Nächt")}</span></div>
          <div class="stat"><strong>${T.stations.length}</strong><span>${L("Stationen", "Schdatione")}</span></div>
          <div class="stat"><strong>15.9.</strong><span>Abflug FRA</span></div>
          <div class="stat"><strong>6.10.</strong><span>${L("Rückflug ICN", "Rickflug ICN")}</span></div>
        </div>
      </section>

      <h2>${L("Route", "Die Rout")}</h2>
      <div class="route-bar">${bar}</div>
      <div class="route">
        ${T.stations.map((s) => `
          <a class="route-item" href="#${s.id}">
            <div class="route-nr" style="background:${col(s)}">${s.nr}</div>
            <div>
              <h3>${esc(s.name)} <span class="muted">(${esc(s.area)})</span></h3>
              <div class="sub">${esc(Hotels.effective(s).name)} · ${esc(s.focus)}</div>
            </div>
            <div class="nights"><strong>${s.nights} ${L("Nächte", "Nächt")}</strong>${esc(s.dates)}</div>
          </a>`).join("")}
      </div>

      <h2>${L("Nächste To-dos", "Was als Nägschdes dran is")}</h2>
      <a class="card todo-teaser-card" href="#todos" style="display:block;text-decoration:none;color:inherit">
        <div id="todoTeaser">${Todos.teaserHtml()}</div>
      </a>

      <h2>${L("Warum diese Daten", "Warum grad an dene Dääch")}</h2>
      <div class="card callout"><p style="margin:0">${md(T.why)}</p></div>

      <h2>${L("Auf einen Blick", "Uff ään Blick")}</h2>
      <div class="grid grid-3">
        <a class="card" href="#fluege" style="text-decoration:none;color:inherit">
          <h3>✈️ ${L("Flüge", "Flieger")}</h3><p class="muted small" style="margin:0">${L("LH712 / LH713 nonstop FRA–ICN, plus zwei Inlandsflüge.", "LH712 / LH713 nonstop FRA–ICN, dezu zwaa Inlandsflieg.")}</p>
        </a>
        <a class="card" href="#kosten" style="text-decoration:none;color:inherit">
          <h3>💶 ${L("Kosten", "Was es koscht")}</h3><p class="muted small" style="margin:0">${esc(costSummary().total)} ${L("für zwei Personen.", "fer zwaa Leit.")}</p>
        </a>
        <a class="card" href="#todos" style="text-decoration:none;color:inherit">
          <h3>📅 ${L("Buchungsfristen", "Buchungsfrischde")}</h3><p class="muted small" style="margin:0">${L("Alle Fristen mit Status in der To-do-Liste.", "All Frischde mit Schdatus in de To-do-Lischd.")}</p>
        </a>
      </div>`;
  }

  function renderStation(s) {
    const tabs = [
      ["tage", L("Tagesplan", "Daachesblan"), s.days.length],
      ["sehen", L("Sehen & erleben", "Gugge & erlewe"), s.sights.length],
      ["wandern", L("Wanderungen", "Wannerunge"), s.hikes.length],
      ["touren", L("Ausflüge & Anbieter", "Ausflüch & Anbieder"), s.tours.length],
    ].filter((t) => t[2] > 0);

    const idx = T.stations.indexOf(s);
    const prev = T.stations[idx - 1], next = T.stations[idx + 1];

    return `
      <div style="--c:${col(s)}">
        ${art(s.id, `${esc(s.name)} (${esc(s.area)})`, "station-art")}
        <div class="station-head">
          <div class="kicker">${L("Station", "Schdation")} ${s.nr} · ${esc(s.dates)} · ${s.nights} ${L("Nächte", "Nächt")}</div>
          <h1>${esc(s.name)} <span class="muted">– ${esc(s.area)}</span></h1>
          <p style="max-width:70ch">${md(s.intro)}</p>
          <div class="chips">${s.focus.split(",").map((f) => `<span class="chip">${esc(f.trim())}</span>`).join("")}</div>
        </div>

        ${hotelCard(s)}

        <div class="tabs" role="tablist">
          ${tabs.map((t, i) => `<button class="tab" role="tab" data-tab="${t[0]}" aria-selected="${i === 0}">${t[1]}</button>`).join("")}
        </div>
        <div id="panel">${stationPanel(s, tabs[0][0])}</div>

        <div class="grid grid-2" style="margin-top:2rem">
          ${prev ? `<a class="card" href="#${prev.id}" style="text-decoration:none;color:inherit"><span class="muted small">← ${L("Vorherige Station", "Die Schdation devor")}</span><br><strong>${esc(prev.name)} (${esc(prev.area)})</strong></a>` : "<div></div>"}
          ${next ? `<a class="card" href="#${next.id}" style="text-decoration:none;color:inherit;text-align:right"><span class="muted small">${L("Nächste Station", "Nägschde Schdation")} →</span><br><strong>${esc(next.name)} (${esc(next.area)})</strong></a>` : ""}
        </div>
      </div>`;
  }

  function hotelCard(s) {
    const h = Hotels.effective(s);
    const c = Hotels.costRange(s);
    return `
        <div class="card hotel">
          ${h.image ? `<img class="hotel-img" src="${esc(h.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<div class="hotel-icon">🏨</div>`}
          <div>
            <h3 style="margin-bottom:.3rem"><a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(h.name)}</a>
              ${h.selected ? `<span class="badge sel">${L("im Konfigurator gewählt", "im Konfigurador ausgsucht")}</span>` : ""}</h3>
            <p class="small" style="margin-bottom:.3rem">${md(h.text)}</p>
            <span class="price">${h.selected ? "" : L("Richtwert: ", "So ungefähr: ")}${esc(h.priceText)} · ${s.nights} ${L("Nächte", "Nächt")}: ${c.fixed ? "" : "ca. "}${range(c.min, c.max)}</span>
            ${h.priceNote ? `<div class="small muted">${esc(h.priceNote)}</div>` : ""}
            ${h.alt ? `<p class="small" style="margin:.75rem 0 0">${md(h.alt)}</p>` : ""}
            <p class="small" style="margin:.6rem 0 0"><a href="#hotels/${s.id}">${h.selected ? L("Anderes Hotel wählen", "En anneres Hodel aussuche") : L("Hotels vergleichen und auswählen", "Hodels vergleiche un aussuche")} →</a></p>
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
        return table([L("Ausflug", "Ausflug"), L("Anbieter", "Anbieder"), L("Dauer", "Wie lang"), L("Preis (Richtwert)", "Breis (so ungefähr)")], s.tours);
    }
    return "";
  }

  function renderFlights() {
    const F = T.flights;
    return `
      <h1>${L("Flüge", "Flieger")}</h1>
      <p style="max-width:75ch">${md(F.intro)}</p>

      <h2>${L("Vorgeschlagene Flüge", "Die Flieger, wo mer vorschlage")}</h2>
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

      <div class="card callout"><strong>${L("Empfehlung:", "Mei Dibb:")}</strong> ${md(F.recommendation)}</div>

      <h2>${L("Langstrecke – Optionen", "Langstreck – was es gebbt")}</h2>
      ${table(F.longhaulHead, F.longhaul)}

      <h2>${L("So drückt ihr den Preis über den Reisetag", "So drickt ihr de Breis iwwer de Reisedaach")}</h2>
      <ul class="list-plain">${F.priceTips.map((t) => `<li>${md(t)}</li>`).join("")}</ul>

      <h2>${L("Inlandsflüge", "Inlandsflieg")}</h2>
      ${table(F.domesticHead, F.domestic)}
      <p class="small">${md(F.domesticNote)}</p>`;
  }

  function renderTransfers() {
    const X = T.transfers;
    return `
      <h1>${L("Transfers zwischen den Stationen", "Hie un her zwische de Schdatione")}</h1>
      <p style="max-width:75ch">${md(X.intro)}</p>
      ${table(X.head, X.rows.map((r) => r.map(withHotels)))}
      <div class="card callout"><strong>KTX:</strong> ${md(X.note)}</div>`;
  }

  function renderCosts() {
    const C = T.costs;
    const sum = costSummary();
    const hotelRows = T.stations.map((s) => {
      const h = Hotels.effective(s), c = Hotels.costRange(s);
      return [
        `${s.name} (${s.area})`,
        `[${h.name}](${h.url})${h.selected ? L(" · **gewählt**", " · **ausgsucht**") : L(" · Planvorschlag", " · Blanvorschlach")}`,
        String(s.nights),
        h.priceText,
        `${c.fixed ? "" : "ca. "}${range(c.min, c.max)}`,
      ];
    });
    const hotelTotal = T.stations.reduce((a, s) => { const c = Hotels.costRange(s); a[0] += c.min; a[1] += c.max; return a; }, [0, 0]);
    return `
      <h1>${L("Kosten", "Was es koscht")}</h1>
      <p class="muted">${esc(C.title)}</p>
      ${table([L("Posten", "Poschde"), L("Spanne", "Vun – bis")], sum.rows.map((r) => [r.label, range(r.min, r.max)]), { total: [L("Summe", "Alles zamme"), sum.total] })}
      <p class="small">${md(C.note)}</p>
      <h2>${L("Hotels", "Hodels")}</h2>
      ${table([L("Station", "Schdation"), L("Hotel", "Hodel"), L("Nächte", "Nächt"), L("Preis pro Nacht", "Breis pro Nacht"), L("Summe", "Zamme")], hotelRows, { total: [L("Hotels gesamt", "Hodels alles zamme"), range(hotelTotal[0], hotelTotal[1])] })}
      <p class="small"><a href="#hotels">${L("Hotels im Konfigurator vergleichen und auswählen", "Hodels im Konfigurador vergleiche un aussuche")} →</a></p>`;
  }

  function renderTips() {
    return `
      <h1>${L("Praktische Tipps", "Braktische Dibbs")}</h1>
      <div class="grid grid-2">
        ${T.tips.map((t) => `
          <div class="card tip">
            <h3><span>${t.icon}</span>${esc(t.title)}</h3>
            ${t.text ? `<p style="margin:0">${md(t.text)}</p>` : ""}
            ${t.list ? `<ul>${t.list.map((l) => `<li>${md(l)}</li>`).join("")}</ul>` : ""}
          </div>`).join("")}
      </div>
      <h2>${L("Quellen", "Wo mer's her hänn")}</h2>
      <ul class="sources">${T.sources.map((s) => `<li>${md(s)}</li>`).join("")}</ul>`;
  }

  function renderPlanned(m) {
    return `
      <h1>${m.icon} ${esc(m.title)}</h1>
      <div class="card soon-card">
        <p class="ic">🚧</p>
        <p><strong>${L("Kommt in einem nächsten Schritt.", "Kummt noch – nur net hudle.")}</strong></p>
        <p class="muted" style="margin:0">${esc(m.text)}</p>
      </div>`;
  }

  // ---------- Countdown ----------
  function renderCountdown() {
    const el = document.getElementById("countdown");
    const ms = new Date(T.departure) - new Date();
    if (ms <= 0) { el.innerHTML = `<strong>${L("Gute Reise!", "Gut Reis, ihr Leit!")}</strong>`; return; }
    const days = Math.ceil(ms / 86400000);
    el.innerHTML = `<small class="long">Noch </small><strong>${days.toLocaleString("de-DE")}</strong> <small>${L("Tage", "Dääch")}<span class="long">${L(" bis zum Abflug", " bis es losgeht")}</span></small>`;
  }

  // ---------- Router ----------
  let current = "";
  Todos.subscribe(() => {
    renderNav(current);
    const teaser = document.getElementById("todoTeaser");
    if (teaser) teaser.innerHTML = Todos.teaserHtml();
  });

  // Hotel-Auswahl geändert: Seiten mit Hotels neu zeichnen (der Konfigurator aktualisiert sich selbst)
  Hotels.subscribe(() => {
    if (current && current !== "hotels" && current !== "todos") show(current, false);
  });

  function show(id, scroll) {
    const [base, arg] = id.split("/");
    const station = T.stations.find((s) => s.id === base);
    view.innerHTML = station ? renderStation(station) : VIEWS[base]();
    if (station) bindTabs(station);
    if (base === "todos") Todos.mount(view);
    if (base === "hotels") Hotels.mount(view, arg);
    current = base;
    renderNav(base);
    if (scroll) window.scrollTo(0, 0);
    document.title = (station ? `${station.name} (${station.area}) · ` : base === "hotels" ? L("Hotels · ", "Hodels · ") : "") + L("Südkorea-Rundreise 2027", "Südkorea-Rundreis 2027");
  }

  function currentId() {
    const id = (location.hash || "").slice(1);
    return VIEWS[id.split("/")[0]] ? id : "uebersicht";
  }

  function route() {
    show(currentId(), true);
    sidebar.classList.remove("open");
  }

  // Optik umgeschaltet: alles mit den neuen Texten und Farben neu zeichnen, Scrollposition bleibt
  Theme.onChange(() => {
    renderCountdown();
    show(currentId(), false);
  });

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
