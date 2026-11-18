// Passwortabfrage als Sichtschutz.
// ACHTUNG: Kein echter Schutz. Die Reisedaten stehen im Klartext in js/data.js
// und sind im öffentlichen Repository für jeden lesbar.
//
// Passwort ändern: SHA-256 des neuen Passworts hier eintragen, z. B. mit
//   printf '%s' 'neues-passwort' | sha256sum
(function () {
  "use strict";

  const PASSWORD_SHA256 = "703f0ea51dd6e4b42b18e5fd2579cf67fb628fcf49fd26eed5b32cbc4e636105";
  const STORAGE_KEY = "suedkorea-unlocked";
  const root = document.documentElement;

  function remembered() {
    try { return localStorage.getItem(STORAGE_KEY) === PASSWORD_SHA256; } catch (e) { return false; }
  }

  if (remembered()) return; // schon freigeschaltet: Seite normal anzeigen
  root.classList.add("locked");

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("gate");
    const input = document.getElementById("gatePw");
    const error = document.getElementById("gateError");
    const remember = document.getElementById("gateRemember");
    input.focus();

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      let ok = false;
      try { ok = (await sha256(input.value)) === PASSWORD_SHA256; } catch (e) { ok = false; }
      if (!ok) {
        error.hidden = false;
        input.select();
        return;
      }
      if (remember.checked) {
        try { localStorage.setItem(STORAGE_KEY, PASSWORD_SHA256); } catch (e) { /* egal */ }
      }
      root.classList.remove("locked");
      document.getElementById("view").focus();
    });
  });
})();
