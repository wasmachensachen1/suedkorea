// Gemeinsamer Zugriff auf JSON-Dateien im Repository (To-dos, Hotel-Auswahl).
// Ohne Token wird die Datei nur gelesen (direkt von der Seite), mit einem persönlichen
// GitHub-Token (Contents: Read and write) kann sie als Commit gespeichert werden.
(function () {
  "use strict";

  const CFG = { owner: "wasmachensachen1", repo: "suedkorea", branch: "main" };
  const TOKEN_KEY = "suedkorea-gh-token";
  const L = (hd, kp) => (window.Theme ? window.Theme.t(hd, kp) : hd); // hochdeutsch / kurpfälzisch

  const lsGet = (k) => { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } };
  const lsSet = (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) { /* egal */ } };
  const token = () => lsGet(TOKEN_KEY);
  const tokenListeners = [];

  function b64encode(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function b64decode(b64) {
    const bin = atob(b64.replace(/\s/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }

  function message(status, method, path) {
    if (status === 401) return L("Der GitHub-Token ist ungültig oder abgelaufen.", "De GitHub-Token is ungildisch odder abgelaafe.");
    if (status === 403 || (status === 404 && method !== "GET"))
      return L(`Der Token darf nicht in das Repository schreiben. Er braucht für „${CFG.repo}“ die Berechtigung „Contents: Read and write“.`,
        `De Token derf net ins Repository schreiwe. Der braucht fer „${CFG.repo}“ die Berechtigung „Contents: Read and write“.`);
    if (status === 404) return L(`Die Datei ${path} oder das Repository wurde nicht gefunden – oder der Token hat keinen Zugriff darauf.`,
      `Die Datei ${path} odder des Repository is net zu finne – odder de Token derf net dro.`);
    if (status === 409) return L("Die Datei wurde gleichzeitig woanders geändert.", "Die Datei is grad gleichzeidisch woanners geännert worre.");
    return L(`GitHub hat mit Fehler ${status} geantwortet.`, `GitHub hot mit Fehler ${status} geantwortet.`);
  }

  async function api(method, path, body, tok) {
    const url = `https://api.github.com/repos/${CFG.owner}/${CFG.repo}/contents/${path}`;
    const res = await fetch(method === "GET" ? `${url}?ref=${CFG.branch}&t=${Date.now()}` : url, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tok || token()}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      const err = new Error(message(res.status, method, path));
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  // Liest eine JSON-Datei. Mit Token über die API (liefert sha), sonst direkt von der Seite.
  async function readJson(path, tok) {
    if (tok || token()) {
      const j = await api("GET", path, null, tok);
      return { data: JSON.parse(b64decode(j.content)), sha: j.sha };
    }
    const res = await fetch(`${path}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(L(`${path} konnte nicht geladen werden (${res.status}).`, `${path} hot net gelade werre kenne (${res.status}).`));
    return { data: await res.json(), sha: null };
  }

  // Schreibt eine JSON-Datei als Commit. build(data) bekommt den frischen Stand und
  // liefert den neuen Inhalt; bei gleichzeitiger Änderung wird bis zu dreimal neu versucht.
  async function updateJson(path, build, commitMessage) {
    if (!token()) throw new Error(L("Zum Speichern zuerst einen GitHub-Token hinterlegen (To-dos → Bearbeiten aktivieren).", "Zum Schbeichere erschd mol en GitHub-Token hinnerlege (To-dos → Bearbeide oschalde)."));
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, sha } = await readJson(path);
      const next = build(data);
      const content = JSON.stringify(next, null, 2) + "\n";
      try {
        const j = await api("PUT", path, { message: commitMessage, content: b64encode(content), sha, branch: CFG.branch });
        return { data: next, sha: j.content && j.content.sha };
      } catch (e) {
        if ((e.status === 409 || e.status === 422) && attempt < 2) continue;
        throw e;
      }
    }
    throw new Error(L("Speichern fehlgeschlagen.", "Schbeichere is schiefgange."));
  }

  window.GitHubStore = {
    CFG,
    token,
    setToken(v) { lsSet(TOKEN_KEY, v); tokenListeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } }); },
    onTokenChange(fn) { tokenListeners.push(fn); },
    readJson,
    updateJson,
    lsGet,
    lsSet,
  };
})();
