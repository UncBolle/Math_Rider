# Math_Rider: Arbeitsregeln für Agenten

Math_Rider ist ein Mathe-Lernspiel für Grundschulkinder (Plus und Minus im Zahlenraum 1 bis 100). Es läuft als Webseite im Browser, am PC und auf dem Handy, im Querformat.

**Bevor du Spiellogik oder Darstellung änderst, lies [SPIELDESIGN.md](SPIELDESIGN.md).** Dort steht das Spiel vollständig beschrieben; es ist die einzige Quelle für Spielregeln, und die Tests prüfen genau diese Regeln.

## Ablauf jeder Sitzung

1. **Einlesen:** Lies den letzten (untersten) Eintrag in [Sessions.md](Sessions.md) und setze bei den offenen Punkten an. Fertig ist dieser Schritt, wenn du den Stand in zwei, drei Sätzen zusammenfassen kannst.
2. **Vorschlagen:** Beschreibe, was du in dieser Sitzung umsetzen willst und wie. Bei allem aus der Liste „Vorher fragen“ wartest du auf Zustimmung.
3. **Umsetzen:** Arbeite in kleinen, abgeschlossenen Schritten. Ein Schritt ist fertig, wenn die Tests grün sind und die Kriterien unter „Geräte und Bedienung“ erfüllt sind. Dann folgt ein lokaler Git-Commit mit einer aussagekräftigen deutschen Nachricht.
4. **Protokollieren:** Hänge am Ende der Sitzung einen Eintrag **unten** an [Sessions.md](Sessions.md) an (Format siehe unten).

## Vorher fragen

Hol dir vorher die Zustimmung des Nutzers bei:

- neuen Abhängigkeiten oder Bibliotheken (Ausnahme: Vitest ist bereits erlaubt),
- Änderungen an Spielmechanik, Aufgabenregeln oder Highscore, also an allem, was in SPIELDESIGN.md steht,
- neuen Ordnern oder Umbau der Struktur,
- Löschen von Dateien oder Funktionen.

Alles andere (Bugfixes, Tests, Umsetzung eines abgesegneten Plans) setzt du direkt um.

## Git

- Nach jedem fertigen Schritt lokal committen.
- Pushen nur, wenn der Nutzer es ausdrücklich sagt. Ein Push auf `main` veröffentlicht die Seite (sobald GitHub Pages eingerichtet ist).

## Technik

- TypeScript + Vite, Darstellung mit HTML/CSS (DOM). Tests mit Vitest.
- Grafiken (Figuren, Hindernisse) sind eigene, einfache SVGs im Repo.
- Alles wird mit dem Spiel ausgeliefert: Schriftarten, Bilder und Bibliotheken liegen im Projekt, die Seite lädt nichts von fremden Servern.
- Veröffentlichung später über GitHub Pages per GitHub Actions; einrichten erst, wenn es etwas Spielbares gibt.

## Code

- Bezeichner und Kommentare auf Deutsch, in camelCase, Umlaute ausgeschrieben (`aufgabeLoesen`). Texte, die das Kind sieht, schreiben Umlaute normal.
- Die Spiellogik (Aufgaben erzeugen, falsche Lösung erzeugen, Antwort prüfen, Highscore) ist von der Darstellung getrennt. Neue oder geänderte Logik bekommt Tests im selben Schritt.

## Geräte und Bedienung

- Das Spiel ist fürs **Querformat** gebaut. Hält man das Handy hochkant, wird dasselbe Layout verkleinert angezeigt und bleibt spielbar.
- Läuft ab 640 × 360 px ohne Zoomen und ohne Scrollen. Prüfe das in der Handy-Ansicht der Browser-Entwicklertools; größere Bedienschritte testet der Nutzer zusätzlich auf einem echten Handy.
- Gespielt wird mit Maus oder Touch, am PC zusätzlich mit den Pfeiltasten. Die Tastatur wird nur am Anfang für den Namen gebraucht.

## Kindgerecht und Datenschutz

- Texte sind kurz, freundlich und ermutigend, auch beim Ausscheiden.
- Keine Werbung, keine Tracker, keine Analyse-Dienste, keine Logins.
- Name, Spielstände und Bestenliste liegen nur im Browser (`localStorage`) und werden nie an einen Server geschickt.

## Format für Sessions.md

```markdown
## JJJJ-MM-TT

**Erledigt**
- ...

**Entscheidungen**
- Entscheidung: Begründung

**Bekannte Probleme**
- ...

**Offen / nächster Schritt**
- ...
```
