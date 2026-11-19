// Illustrationen für den Kurpfalz-Modus: Neon-Sonnenuntergänge als SVG, eine Szene pro Station.
// Eigene Zeichnungen (keine fremden Bilder), werden nur im Kurpfalz-Modus eingebunden.
(function () {
  "use strict";

  const W = 1200, H = 400, HORIZON = 300;
  const SIL = "#14051f";   // Vordergrund
  const MID = "#2a0c44";   // mittlere Ebene
  const FAR = "#4b1a6e";   // Berge in der Ferne
  const NEON = ["#ff3d8b", "#ffd23f", "#19d3c5", "#ff9a3c"];

  // kleiner Zufallsgenerator mit festem Startwert, damit jede Szene immer gleich aussieht
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const r1 = (n) => Math.round(n * 10) / 10;

  function defs(id) {
    // Streifen in der unteren Sonnenhälfte (Retro-Look)
    let stripes = "";
    for (let i = 0, y = 160; i < 7; i++) { const h = 2.5 + i * 2; stripes += `<rect x="0" y="${r1(y)}" width="${W}" height="${r1(h)}" fill="#000"/>`; y += h + 9 - i * 0.6; }
    return `<defs>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#160733"/><stop offset=".38" stop-color="#4f1877"/>
        <stop offset=".62" stop-color="#d9367e"/><stop offset=".8" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ffc65c"/>
      </linearGradient>
      <linearGradient id="${id}-sun" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff07a"/><stop offset=".5" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ff3d8b"/>
      </linearGradient>
      <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a1260"/><stop offset="1" stop-color="#0d0420"/>
      </linearGradient>
      <radialGradient id="${id}-glow" cx=".5" cy=".72" r=".55">
        <stop offset="0" stop-color="#ffb35c" stop-opacity=".75"/><stop offset="1" stop-color="#ff3d8b" stop-opacity="0"/>
      </radialGradient>
      <mask id="${id}-mask"><rect width="${W}" height="${H}" fill="#fff"/>${stripes}</mask>
      <filter id="${id}-neon" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
  }

  function sky(id, sunX, seed) {
    const r = rng(seed);
    let stars = "";
    for (let i = 0; i < 40; i++) stars += `<circle cx="${r1(r() * W)}" cy="${r1(r() * 120)}" r="${r1(.6 + r() * 1.1)}" fill="#fff" opacity="${r1(.25 + r() * .5)}"/>`;
    return `<rect width="${W}" height="${H}" fill="url(#${id}-sky)"/>${stars}
      <rect width="${W}" height="${H}" fill="url(#${id}-glow)"/>
      <circle cx="${sunX}" cy="200" r="112" fill="url(#${id}-sun)" mask="url(#${id}-mask)"/>`;
  }

  function sea(id, sunX) {
    let lines = "";
    for (let i = 0; i < 9; i++) {
      const y = HORIZON + 8 + i * 10, w = 210 - i * 18;
      lines += `<rect x="${sunX - w / 2}" y="${y}" width="${w}" height="${2 + i * .3}" rx="1.5" fill="${i % 2 ? "#ff3d8b" : "#ffb35c"}" opacity="${r1(.7 - i * .06)}"/>`;
    }
    return `<rect y="${HORIZON}" width="${W}" height="${H - HORIZON}" fill="url(#${id}-sea)"/>${lines}`;
  }

  function mountains(points, fill) {
    return `<path d="M0 ${HORIZON} ${points} L${W} ${HORIZON} Z" fill="${fill}"/>`;
  }

  function palm(x, y, h, lean) {
    const tx = x + lean, ty = y - h, w = Math.max(5, h * .055), L = h * .55;
    const leaf = `M0 0 C${r1(L * .3)} ${r1(-L * .28)} ${r1(L * .75)} ${r1(-L * .22)} ${r1(L)} ${r1(L * .2)} C${r1(L * .7)} ${r1(-L * .03)} ${r1(L * .35)} ${r1(L * .03)} 0 ${r1(L * .07)}Z`;
    const side = [-58, -28, 2, 28].map((a) => `<path d="${leaf}" transform="rotate(${a})"/>`).join("");
    return `<g fill="${SIL}">
      <path d="M${x} ${y} Q${r1(x + lean * .1)} ${r1(y - h * .6)} ${tx} ${ty}" stroke="${SIL}" stroke-width="${r1(w)}" fill="none" stroke-linecap="round"/>
      <g transform="translate(${tx} ${ty})">${side}<g transform="scale(-1 1)">${side}</g>
        <path d="${leaf}" transform="rotate(-92) scale(.75)"/>
        <circle r="${r1(w * .9)}" cy="${r1(w * .3)}"/></g>
    </g>`;
  }

  // Häuserzeile mit ein paar erleuchteten Fenstern
  function skyline(x0, x1, base, minH, maxH, seed, fill = SIL, lit = .12) {
    const r = rng(seed);
    let out = "", x = x0;
    while (x < x1) {
      const w = 18 + Math.floor(r() * 34), h = minH + Math.floor(r() * (maxH - minH));
      out += `<rect x="${x}" y="${base - h}" width="${w}" height="${h + 2}" fill="${fill}"/>`;
      for (let wy = base - h + 8; wy < base - 8; wy += 11) {
        for (let wx = x + 4; wx < x + w - 5; wx += 8) {
          if (r() < lit) out += `<rect x="${wx}" y="${wy}" width="3" height="4" fill="${NEON[Math.floor(r() * NEON.length)]}" opacity=".85"/>`;
        }
      }
      x += w + (r() < .3 ? 4 : 0);
    }
    return out;
  }

  // geschwungenes Hanok-Dach
  function roof(cx, y, w, h, fill = SIL) {
    const l = cx - w / 2, rr = cx + w / 2;
    return `<path d="M${l - 14} ${y - 6} Q${l + w * .12} ${y} ${l + w * .2} ${y - h} L${rr - w * .2} ${y - h} Q${rr - w * .12} ${y} ${rr + 14} ${y - 6} L${rr} ${y + 4} L${l} ${y + 4} Z" fill="${fill}"/>`;
  }

  // ---------- Wahrzeichen ----------
  function namsanTower(cx, base) {
    return `<path d="M${cx - 230} ${base} Q${cx - 60} ${base - 120} ${cx} ${base - 122} Q${cx + 70} ${base - 120} ${cx + 240} ${base} Z" fill="${MID}"/>
      <g fill="${SIL}">
        <rect x="${cx - 5}" y="${base - 250}" width="10" height="130"/>
        <rect x="${cx - 20}" y="${base - 262}" width="40" height="18" rx="6"/>
        <rect x="${cx - 13}" y="${base - 276}" width="26" height="14" rx="4"/>
        <rect x="${cx - 1.5}" y="${base - 330}" width="3" height="56"/>
      </g>
      <circle cx="${cx}" cy="${base - 331}" r="3.5" fill="#ff3d8b"/>`;
  }

  function palaceGate(cx, base) {
    return `<g fill="${SIL}">
      <rect x="${cx - 120}" y="${base - 48}" width="240" height="50"/>
      ${roof(cx, base - 50, 210, 26)}
      <rect x="${cx - 80}" y="${base - 92}" width="160" height="20"/>
      ${roof(cx, base - 92, 175, 24)}
    </g>
    <path d="M${cx - 62} ${base} v-22 a14 14 0 0 1 28 0 v22 Z M${cx - 14} ${base} v-28 a14 14 0 0 1 28 0 v28 Z M${cx + 34} ${base} v-22 a14 14 0 0 1 28 0 v22 Z" fill="#ff9a3c" opacity=".55"/>`;
  }

  function seongsan(cx, base) {
    return `<path d="M${cx - 170} ${base} C${cx - 140} ${base - 40} ${cx - 120} ${base - 95} ${cx - 90} ${base - 108}
      L${cx - 70} ${base - 100} L${cx - 50} ${base - 112} L${cx - 20} ${base - 104} L${cx + 10} ${base - 114} L${cx + 40} ${base - 102}
      L${cx + 70} ${base - 110} C${cx + 100} ${base - 92} ${cx + 125} ${base - 40} ${cx + 160} ${base} Z" fill="${SIL}"/>
      <path d="M${cx - 175} ${base} q20 -4 40 0 t40 0" stroke="#19d3c5" stroke-width="2" fill="none" opacity=".6"/>`;
  }

  function gwanganBridge(id, y) {
    const t1 = 430, t2 = 770, top = y - 120;
    // Hauptseil hängt zwischen den Pylonen durch, die Seitenseile laufen zur Fahrbahn
    const main = `M${t1} ${top} Q${(t1 + t2) / 2} ${2 * (y - 14) - top} ${t2} ${top}`;
    const left = `M40 ${y} Q${t1 - 120} ${y - 30} ${t1} ${top}`;
    const right = `M${t2} ${top} Q${t2 + 120} ${y - 30} 1160 ${y}`;
    return `<g filter="url(#${id}-neon)">
      <rect x="0" y="${y}" width="${W}" height="6" fill="${SIL}"/>
      <path d="${main} ${left} ${right}" stroke="#19d3c5" stroke-width="3" fill="none"/>
      <rect x="0" y="${y + 6}" width="${W}" height="2" fill="#ff3d8b"/>
      <rect x="${t1 - 7}" y="${top}" width="14" height="${y - top + 30}" fill="${SIL}" stroke="#19d3c5" stroke-width="1.5"/>
      <rect x="${t2 - 7}" y="${top}" width="14" height="${y - top + 30}" fill="${SIL}" stroke="#19d3c5" stroke-width="1.5"/>
    </g>`;
  }

  function tumuli(base) {
    return `<path d="M-40 ${base} Q130 ${base - 190} 330 ${base} Z M250 ${base} Q370 ${base - 110} 500 ${base} Z M740 ${base} Q920 ${base - 200} 1110 ${base} Z M1030 ${base} Q1140 ${base - 100} 1250 ${base} Z" fill="${SIL}"/>`;
  }

  function cheomseongdae(cx, base) {
    return `<path d="M${cx - 30} ${base} C${cx - 26} ${base - 40} ${cx - 14} ${base - 70} ${cx - 13} ${base - 100} L${cx + 13} ${base - 100}
      C${cx + 14} ${base - 70} ${cx + 26} ${base - 40} ${cx + 30} ${base} Z" fill="${SIL}"/>
      <rect x="${cx - 18}" y="${base - 112}" width="36" height="12" fill="${SIL}"/>
      <rect x="${cx - 6}" y="${base - 62}" width="12" height="12" fill="#ffd23f" opacity=".8"/>`;
  }

  function pagoda(cx, base, s = 1) {
    let out = "", y = base;
    [[70, 34], [56, 30], [44, 26]].forEach(([w, h]) => {
      out += `<rect x="${cx - w * s / 2 + 8}" y="${y - h * s}" width="${w * s - 16}" height="${h * s}" fill="${SIL}"/>`;
      out += roof(cx, y - h * s, w * s, 10 * s);
      y -= (h + 12) * s;
    });
    return out + `<rect x="${cx - 2}" y="${y - 30 * s}" width="4" height="${30 * s + 4}" fill="${SIL}"/>`;
  }

  function lotteTower(cx, base) {
    return `<path d="M${cx - 34} ${base} C${cx - 30} ${base - 160} ${cx - 16} ${base - 270} ${cx - 3} ${base - 330} L${cx + 3} ${base - 330}
      C${cx + 16} ${base - 270} ${cx + 30} ${base - 160} ${cx + 34} ${base} Z" fill="${SIL}"/>
      <path d="M${cx} ${base - 326} L${cx} ${base}" stroke="#ff3d8b" stroke-width="1.5" opacity=".7"/>`;
  }

  function rainbowFountain(id, y) {
    let arcs = "";
    for (let x = 80; x < 1120; x += 48) {
      const c = NEON[(x / 48) % NEON.length | 0];
      arcs += `<path d="M${x} ${y} q12 30 30 46" stroke="${c}" stroke-width="2" fill="none" opacity=".8"/>`;
    }
    return `<g filter="url(#${id}-neon)">${arcs}<rect x="0" y="${y - 6}" width="${W}" height="8" fill="${SIL}"/></g>`;
  }

  function hanRiver(id) {
    return `<rect y="${HORIZON - 28}" width="${W}" height="${H - HORIZON + 28}" fill="url(#${id}-sea)"/>`;
  }

  // ---------- Szenen ----------
  const SCENES = {
    overview(id) {
      return sky(id, 820, 7)
        + mountains("L0 210 L120 170 L230 205 L340 150 L450 200 L560 175 L700 215 L820 160 L960 210 L1080 175 L1200 200", FAR)
        + sea(id, 820)
        + namsanTower(300, HORIZON)
        + skyline(470, 1200, HORIZON + 2, 30, 120, 11, MID, .1)
        + skyline(0, 1200, HORIZON + 40, 10, 40, 5, SIL, .05)
        + `<rect y="${HORIZON + 38}" width="${W}" height="70" fill="${SIL}"/>`
        + palm(70, 400, 250, 30) + palm(150, 400, 190, -24) + palm(1110, 400, 260, -36) + palm(1040, 400, 180, 18);
    },
    seoul(id) {
      return sky(id, 760, 3)
        + mountains("L0 230 L150 160 L260 200 L380 140 L520 210 L700 180 L860 220 L1000 170 L1200 220", FAR)
        + namsanTower(980, HORIZON)
        + skyline(0, 1200, HORIZON + 10, 20, 70, 21, MID, .08)
        + `<rect y="${HORIZON + 8}" width="${W}" height="100" fill="${SIL}"/>`
        + palaceGate(420, HORIZON + 10)
        + palm(60, 400, 200, 20) + palm(1150, 400, 230, -30);
    },
    jeju(id) {
      return sky(id, 520, 9)
        + mountains("Q600 150 1200 250", FAR)
        + sea(id, 520)
        + seongsan(930, HORIZON + 6)
        + `<path d="M0 360 Q220 330 420 360 T900 370 T1200 350 V400 H0 Z" fill="#e7a35c" opacity=".35"/>`
        + `<path d="M0 372 Q300 350 600 378 T1200 368 V400 H0 Z" fill="${SIL}"/>`
        + palm(90, 400, 280, 40) + palm(190, 400, 210, -20) + palm(320, 400, 160, 26) + palm(1120, 400, 240, -28);
    },
    busan(id) {
      return sky(id, 600, 13)
        + mountains("L0 240 L180 200 L320 240 L520 215 L760 245 L980 205 L1200 235", FAR)
        + skyline(0, 260, HORIZON, 60, 190, 31, MID, .15)
        + skyline(940, 1200, HORIZON, 50, 170, 37, MID, .15)
        + sea(id, 600)
        + gwanganBridge(id, 286)
        + `<path d="M0 370 Q300 352 600 372 T1200 362 V400 H0 Z" fill="${SIL}"/>`
        + palm(40, 400, 230, 28) + palm(1160, 400, 250, -34);
    },
    gyeongju(id) {
      return sky(id, 640, 17)
        + mountains("Q300 190 600 240 T1200 220", FAR)
        + sea(id, 640)
        + `<rect y="${HORIZON}" width="${W}" height="18" fill="${MID}"/>`
        + pagoda(220, HORIZON + 2, 1.15)
        + cheomseongdae(980, HORIZON + 4)
        + tumuli(H)
        + `<rect y="${H - 8}" width="${W}" height="8" fill="${SIL}"/>`;
    },
    gangnam(id) {
      return sky(id, 360, 23)
        + skyline(0, 1200, HORIZON - 30, 40, 150, 41, MID, .14)
        + lotteTower(760, HORIZON - 26)
        + skyline(0, 1200, HORIZON - 26, 20, 80, 43, SIL, .1)
        + hanRiver(id)
        + `<rect y="${HORIZON - 28}" width="${W}" height="3" fill="#ff9a3c" opacity=".7"/>`
        + rainbowFountain(id, HORIZON + 12)
        + `<path d="M0 384 Q600 370 1200 386 V400 H0 Z" fill="${SIL}"/>`
        + palm(1130, 400, 220, -26);
    },
  };

  let counter = 0;
  function scene(key, label) {
    const draw = SCENES[key] || SCENES.overview;
    const id = `va${++counter}`;
    return `<svg class="vice-art-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label || "Illustration"}" xmlns="http://www.w3.org/2000/svg">${defs(id)}${draw(id)}</svg>`;
  }

  window.ViceArt = { scene };
})();
