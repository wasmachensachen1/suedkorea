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
js/hotels.js      Hotel-Konfigurator (Suche über Xotelo, Auswahl pro Station)
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

Datenquelle ist die kostenlose [Xotelo-API](https://xotelo.com) (TripAdvisor-Daten, ohne Anmeldung und Schlüssel). Für jeden angezeigten Treffer wird der Tagespreis für den Zeitraum abgefragt (günstigstes Angebot, pro Nacht und Zimmer). Gibt es keinen, steht die allgemeine Preisspanne als Richtwert da.

„In Reiseplan übernehmen“ speichert das Hotel in `data/hotels.json`, pro Station genau eins; eine neue Wahl ersetzt die alte, „Auf Planvorschlag zurücksetzen“ nimmt sie zurück. Das braucht denselben GitHub-Token wie die To-dos. Stationsseiten, Übersicht, Transfers und Kosten nehmen dann das gewählte Hotel; die Hotelkosten rechnen mit Preis × Zimmer × Nächte laut Reiseplan.

Bezugspunkt und Suchort pro Station stehen in `data.js` unter `hotelSearch` (`center`, `centerName`, `locationKey` = TripAdvisor-Orts-ID oder `query` für die automatische Ortssuche). In Texten von `data.js` wird `{hotel:<station-id>}` durch das gewählte Hotel ersetzt.

## Passwortabfrage

Vor der Seite steht eine Passwortabfrage. Sie ist **nur ein Sichtschutz**: Die Inhalte stehen im Klartext in `js/data.js` und sind im öffentlichen Repository für jeden lesbar.

Passwort ändern: SHA-256 des neuen Passworts erzeugen (`printf '%s' 'neues-passwort' | sha256sum`) und in `js/gate.js` bei `PASSWORD_SHA256` eintragen.

## Geplante Module

- Flugsuche

Neue Module: Eintrag in `MODULES_PLANNED` (data.js) bzw. eine Render-Funktion in `VIEWS` (app.js) ergänzen.
