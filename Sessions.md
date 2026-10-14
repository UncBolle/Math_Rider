# Sitzungsprotokoll

## 2026-10-14

**Erledigt**
- Git-Repository angelegt und mit `origin` (`https://github.com/UncBolle/Math_Rider.git`, Branch `main`) verbunden.
- AGENTS.md (Arbeitsregeln), SPIELDESIGN.md (Spielregeln) und CLAUDE.md (verweist auf AGENTS.md) erstellt.

**Entscheidungen**
- TypeScript + Vite, Darstellung mit HTML/CSS, Tests mit Vitest: einfach, läuft auf PC und Handy ohne eigene Skalierung.
- Querformat, Bedienung per Maus/Touch/Pfeiltasten: Tastatur nur für den Namen.
- Kein Zeitdruck: Rechnen steht im Vordergrund, nicht die Reaktionszeit.
- Zahlenraum fest 1 bis 100, Aufgaben nur Plus und Minus.
- Nichts von fremden Servern laden, Daten nur im Browser: Datenschutz für Kinder.
- Eigene SVG-Grafiken: sehen überall gleich aus, später austauschbar.
- Pushen nur auf ausdrücklichen Befehl des Nutzers.

**Bekannte Probleme**
- Noch kein Code vorhanden.

**Offen / nächster Schritt**
- Projekt mit Vite + TypeScript + Vitest aufsetzen und `.gitignore` anlegen.
- Spiellogik (Aufgaben, falsche Lösungen) test-first umsetzen.

## 2026-10-14 (2)

**Erledigt**
- AUFGABEN.md (Umsetzungsplan T1 bis T20) und TESTFAELLE.md (automatische und manuelle Testfälle) angelegt; AGENTS.md verweist darauf.

**Entscheidungen**
- Zufallsquelle wird in die Logik hineingereicht: Tests mit Zufall bleiben reproduzierbar.
- Aufgaben und Testfälle als Markdown im Repo statt GitHub Issues: der Agent liest sie mit AGENTS.md ein, und `gh` ist nicht installiert.

**Bekannte Probleme**
- Fünf Annahmen in AUFGABEN.md sind noch nicht vom Nutzer bestätigt.

**Offen / nächster Schritt**
- Annahmen und Ordnerstruktur in AUFGABEN.md bestätigen lassen, dann T1.
