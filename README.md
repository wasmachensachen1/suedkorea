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
js/todos.js       To-do-Liste mit GitHub-Sync und Kalender-Export
data/todos.json   To-dos (wird von der Seite selbst gespeichert)
js/gate.js        Passwortabfrage (Sichtschutz)
```

Nach Änderungen an CSS oder JS in `index.html` die Versionsnummer `?v=…` an allen Dateien erhöhen (z. B. auf das aktuelle Datum). Sonst zeigen Browser bis zu 10 Minuten lang die alten Dateien aus dem Cache.

Texte in `data.js` dürfen `**fett**` und `[Link](https://…)` enthalten.

## To-dos

Die Liste steht in `data/todos.json`. Ohne Token zeigt die Seite sie nur an. Zum Bearbeiten legt man unter „To-dos → Bearbeiten aktivieren“ einmal pro Gerät einen GitHub-Token ab: Fine-grained token, nur für das Repository `suedkorea`, Berechtigung „Contents: Read and write“. Jede Änderung wird dann als Commit auf `main` gespeichert.

Fristen lassen sich einzeln oder gesammelt als `.ics` in den Kalender übernehmen, mit Erinnerung eine Woche vorher und am Fristtag.

Das Repository ist öffentlich: keine Buchungsnummern, Passdaten oder Zugangsdaten in die To-dos schreiben.

## Passwortabfrage

Vor der Seite steht eine Passwortabfrage. Sie ist **nur ein Sichtschutz**: Die Inhalte stehen im Klartext in `js/data.js` und sind im öffentlichen Repository für jeden lesbar.

Passwort ändern: SHA-256 des neuen Passworts erzeugen (`printf '%s' 'neues-passwort' | sha256sum`) und in `js/gate.js` bei `PASSWORD_SHA256` eintragen.

## Geplante Module

- Flugsuche
- Hotel-Konfigurator

Neue Module: Eintrag in `MODULES_PLANNED` (data.js) bzw. eine Render-Funktion in `VIEWS` (app.js) ergänzen.
