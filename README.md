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
```

Texte in `data.js` dürfen `**fett**` und `[Link](https://…)` enthalten.

## Geplante Module

- Flugsuche
- Hotel-Konfigurator
- To-dos & Erinnerungen

Neue Module: Eintrag in `MODULES_PLANNED` (data.js) bzw. eine Render-Funktion in `VIEWS` (app.js) ergänzen.
