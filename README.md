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

Pro Station werden bis zu 300 Unterkünfte geladen. Jedes Haus bekommt einen Preis pro Nacht und Zimmer, in dieser Reihenfolge:

1. **Tagespreis** für den Zeitraum laut Reiseplan (günstigstes Angebot). Für 2027 haben viele Portale noch keine Preise, deshalb gibt es das nur für einen Teil der Häuser.
2. **Aktueller Preis × Saisonfaktor**: Preis für einen Termin in gut 30 Tagen (gleicher Wochentag, gleiche Nächtezahl, Feiertage gemieden), hochgerechnet mit dem Faktor, der sich aus den Häusern mit beiden Preisen ergibt.
3. **Vergleichshäuser**: Median der 7 ähnlichsten Häuser derselben Station (Kategorie, Bewertung, Zahl der Bewertungen, Lage).

Für 1 oder 3 Personen pro Zimmer wird der Preis für 2 Personen mit Faktoren aus einer Stichprobe umgerechnet. Geschätzte Preise sind in der Liste als „geschätzt“ markiert und erklärt. Abgefragte Preise werden gespeichert und bei späteren Läufen wiederverwendet (Tagespreise 2 Tage, aktuelle Preise 14 Tage), so werden die Schätzungen mit jedem täglichen Lauf genauer.

Die Orts-ID für Jeju und Gyeongju ermittelt die Action über den Ortsnamen in den TripAdvisor-Links (`urlMatch`), weil die Suchfunktion der API nur noch kostenpflichtig über RapidAPI nutzbar ist.

„In Reiseplan übernehmen“ speichert das Hotel in `data/hotels.json`, pro Station genau eins; eine neue Wahl ersetzt die alte, „Auf Planvorschlag zurücksetzen“ nimmt sie zurück. Das braucht denselben GitHub-Token wie die To-dos. Stationsseiten, Übersicht, Transfers und Kosten nehmen dann das gewählte Hotel; die Hotelkosten rechnen mit Preis × Zimmer × Nächte laut Reiseplan.

Bezugspunkt und Suchort pro Station stehen in `data.js` unter `hotelSearch` (`center`, `centerName`, `locationKey` = TripAdvisor-Orts-ID oder `query` für die automatische Ortssuche; nach einer Änderung die Action laufen lassen). In Texten von `data.js` wird `{hotel:<station-id>}` durch das gewählte Hotel ersetzt.

## Passwortabfrage

Vor der Seite steht eine Passwortabfrage. Sie ist **nur ein Sichtschutz**: Die Inhalte stehen im Klartext in `js/data.js` und sind im öffentlichen Repository für jeden lesbar.

Passwort ändern: SHA-256 des neuen Passworts erzeugen (`printf '%s' 'neues-passwort' | sha256sum`) und in `js/gate.js` bei `PASSWORD_SHA256` eintragen.

## Geplante Module

- Flugsuche

Neue Module: Eintrag in `MODULES_PLANNED` (data.js) bzw. eine Render-Funktion in `VIEWS` (app.js) ergänzen.
