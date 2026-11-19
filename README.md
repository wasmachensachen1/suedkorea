# Südkorea-Rundreise 2027

Kleine WebApp zum Reiseplan (15.9.–6.10.2027): Übersicht, fünf Stationen mit Hotel, Tagesplan, Sehenswürdigkeiten, Wanderungen und Touren, dazu Flüge, Transfers, Kosten und praktische Tipps.

## Starten

Kein Build-Schritt nötig: `index.html` im Browser öffnen oder per GitHub Pages veröffentlichen
(Settings → Pages → Branch `main`, Ordner `/`).

## Aufbau

```
index.html        Grundgerüst
css/style.css     Gestaltung
js/data.js        alle Reiseinhalte (hier Texte, Preise, Links pflegen)
js/app.js         Navigation (Hash-Routing) und Darstellung
js/github.js      gemeinsamer Lese-/Schreibzugriff auf JSON-Dateien im Repository
js/todos.js       To-do-Liste mit GitHub-Sync und Kalender-Export
data/todos.json   To-dos (wird von der Seite selbst gespeichert)
js/hotels.js      Hotel-Konfigurator (Filter, Ergebnisliste, Auswahl pro Station)
scripts/fetch-hotels.mjs   holt die Hoteldaten (läuft als GitHub Action)
data/hotel-offers/         Hoteldaten pro Station (von der Action erzeugt)
data/hotels.json  gewählte Hotels pro Station (wird von der Seite selbst gespeichert)
js/gate.js        Passwortabfrage (Sichtschutz)
js/theme.js       Kurpfalz-Modus: Umschalter, Texte hochdeutsch/kurpfälzisch
js/data.kurpfalz.js        Reiseinhalte auf Kurpfälzisch (Wörterbuch zu data.js)
js/vice-art.js    Illustrationen (SVG) für den Kurpfalz-Modus
css/vice.css      Neon-Optik des Kurpfalz-Modus
fonts/            Überschriften-Schrift Anton (SIL Open Font License, lokal eingebunden)
```

Nach Änderungen an CSS oder JS in `index.html` die Versionsnummer `?v=…` an allen Dateien erhöhen (z. B. auf das aktuelle Datum). Sonst zeigen Browser bis zu 10 Minuten lang die alten Dateien aus dem Cache.

Texte in `data.js` dürfen `**fett**` und `[Link](https://…)` enthalten.

## To-dos

Die Liste steht in `data/todos.json`. Ohne Token zeigt die Seite sie nur an. Zum Bearbeiten legt man unter „To-dos → Bearbeiten aktivieren“ einmal pro Gerät einen GitHub-Token ab: Fine-grained token, nur für das Repository `suedkorea`, Berechtigung „Contents: Read and write“. Jede Änderung wird dann als Commit auf `main` gespeichert.

Fristen lassen sich einzeln oder gesammelt als `.ics` in den Kalender übernehmen, mit Erinnerung eine Woche vorher und am Fristtag.

Das Repository ist öffentlich: keine Buchungsnummern, Passdaten oder Zugangsdaten in die To-dos schreiben.

## Hotel-Konfigurator

Unter „Planung → Hotels“ (oder über „Hotels vergleichen“ auf jeder Stationsseite). Station und Zeitraum kommen aus dem Reiseplan und lassen sich ändern, ebenso Erwachsene und Zimmer. Filter: Preis von/bis pro Nacht und Zimmer, Mindestbewertung, Entfernung zum Bezugspunkt der Station („zentrale Lage“, Luftlinie), Anzahl Bewertungen, Unterkunftsart, Name; Sortierung nach Beliebtheit, Preis, Bewertung oder Nähe.

Datenquelle ist die kostenlose [Xotelo-API](https://xotelo.com) (TripAdvisor-Daten, ohne Anmeldung und Schlüssel). Weil Browser die API nicht direkt abfragen dürfen (keine CORS-Freigabe), holt die GitHub Action **„Hoteldaten aktualisieren“** (`.github/workflows/hotel-offers.yml`, Skript `scripts/fetch-hotels.mjs`) die Daten und legt sie unter `data/hotel-offers/` ab. Sie läuft täglich, nach Änderungen an `js/data.js` und auf Knopfdruck (Actions → Hoteldaten aktualisieren → Run workflow). Fehler stehen in `data/hotel-offers/index.json` und im Actions-Log.

Pro Station werden bis zu 300 Unterkünfte geladen. Tagespreise (günstigstes Angebot pro Nacht und Zimmer) holt die Action für die 70 beliebtesten und die 40 zentralsten Häuser, für den Zeitraum laut Reiseplan und 1–3 Erwachsene pro Zimmer. Für andere Häuser, Zeiträume oder Belegungen steht die allgemeine Preisspanne als Richtwert da.

„In Reiseplan übernehmen“ speichert das Hotel in `data/hotels.json`, pro Station genau eins; eine neue Wahl ersetzt die alte, „Auf Planvorschlag zurücksetzen“ nimmt sie zurück. Das braucht denselben GitHub-Token wie die To-dos. Stationsseiten, Übersicht, Transfers und Kosten nehmen dann das gewählte Hotel; die Hotelkosten rechnen mit Preis × Zimmer × Nächte laut Reiseplan.

Bezugspunkt und Suchort pro Station stehen in `data.js` unter `hotelSearch` (`center`, `centerName`, `locationKey` = TripAdvisor-Orts-ID oder `query` für die automatische Ortssuche; nach einer Änderung die Action laufen lassen). In Texten von `data.js` wird `{hotel:<station-id>}` durch das gewählte Hotel ersetzt.

## Kurpfalz-Modus

Der Button „🌴 Kurpfalz-Modus“ oben rechts (auch auf der Passwortseite) schaltet eine zweite Optik ein: Neon-Sonnenuntergang im Stil von GTA VI, mit eigenen Illustrationen pro Station, und alle Texte auf Kurpfälzisch. „↩ Widder normal“ schaltet zurück. Die Wahl wird pro Gerät im Browser gespeichert.

- **Oberflächentexte** stehen direkt im Code als Paar: `L("Hochdeutsch", "Kurpfälzisch")` (in `app.js`, `todos.js`, `hotels.js`, `github.js`). Statische Texte in `index.html` haben ein Attribut `data-kp="…"`.
- **Reiseinhalte** aus `data.js` werden über `js/data.kurpfalz.js` ersetzt: `"Originaltext": "Text uff Kurpfälzisch"`. Wird ein Text in `data.js` geändert, passt der Eintrag nicht mehr, und im Kurpfalz-Modus erscheint dort wieder das Hochdeutsche, bis die Übersetzung nachgezogen ist. In der Browser-Konsole zeigt `Theme.check()` Texte ohne Übersetzung und verwaiste Einträge.
- **Nicht übersetzt** werden To-dos und gespeicherte Hotel-Auswahlen (das sind Daten aus dem Repository) sowie Commit-Nachrichten.
- Die Illustrationen sind eigene SVG-Zeichnungen (`js/vice-art.js`), keine Bilder aus dem Spiel.

## Passwortabfrage

Vor der Seite steht eine Passwortabfrage. Sie ist **nur ein Sichtschutz**: Die Inhalte stehen im Klartext in `js/data.js` und sind im öffentlichen Repository für jeden lesbar.

Passwort ändern: SHA-256 des neuen Passworts erzeugen (`printf '%s' 'neues-passwort' | sha256sum`) und in `js/gate.js` bei `PASSWORD_SHA256` eintragen.

## Geplante Module

- Flugsuche

Neue Module: Eintrag in `MODULES_PLANNED` (data.js) bzw. eine Render-Funktion in `VIEWS` (app.js) ergänzen.
