# Math_Rider: Aufgaben

Umsetzungsplan in der empfohlenen Reihenfolge. Jede Aufgabe ist ein Schritt im Sinne von [AGENTS.md](AGENTS.md): fertig, wenn ihre Kriterien erfüllt sind, dann ein Commit. Erledigte Aufgaben abhaken (`[x]`). Die Test-IDs verweisen auf [TESTFAELLE.md](TESTFAELLE.md), die Regeln auf [SPIELDESIGN.md](SPIELDESIGN.md).

## Aufbau

- `src/logik/`: reine Spiellogik ohne DOM, vollständig mit Vitest getestet. Jede Funktion, die würfelt, bekommt die Zufallsquelle als Parameter (`zufall: () => number`), damit Tests mit festem Startwert reproduzierbar sind.
- `src/ansicht/`: Bildschirme und Eingabe (DOM).
- `src/grafiken/`: eigene SVG-Dateien.

## Phase 1: Grundlage

- [x] **T1 Projekt aufsetzen.** Vite-Vorlage `vanilla-ts`, Vitest, `.gitignore` (u. a. `node_modules/`, `dist/`), npm-Skripte `dev`, `build`, `test`, Ordner wie unter „Aufbau“.
  Fertig, wenn: `npm run dev` eine Platzhalterseite zeigt, `npm test` einen Beispieltest grün meldet und `npm run build` ohne Fehler läuft.

## Phase 2: Spiellogik (test-first, ohne Oberfläche)

- [x] **T2 Zufallsquelle für Tests.** Kleiner, deterministischer Zufallsgenerator mit Startwert, nur für Tests (z. B. `tests/hilfen/zufall.ts`).
  Fertig, wenn: gleicher Startwert gleiche Zahlenfolge liefert und alle Werte in [0, 1) liegen.
- [x] **T3 Startzahl.** Fertig, wenn: S-01 bis S-02 grün.
- [x] **T4 Aufgabe erzeugen** aus aktueller Zahl und Aufgabennummer: Rechenart, Aufgabenzahl, richtige Lösung. Fertig, wenn: A-01 bis A-09 grün.
- [x] **T5 Falsche Lösung erzeugen.** Fertig, wenn: F-01 bis F-06 grün.
- [x] **T6 Lösungen anordnen** (richtige Lösung zufällig links oder rechts). Fertig, wenn: L-01 bis L-02 grün.
- [x] **T7 Spielablauf** als Zustand eines Laufs: Start, Antwort wählen, Ausscheiden, Nochmal, Hindernis passend zur Figur. Fertig, wenn: P-01 bis P-07 grün.
- [ ] **T8 Name prüfen.** Fertig, wenn: N-01 bis N-04 grün.
- [ ] **T9 Bestenliste.** Fertig, wenn: B-01 bis B-07 grün.
- [ ] **T10 Speichern im Browser** (Name, Bestenliste) über `localStorage`, robust gegen fehlende oder kaputte Daten. Fertig, wenn: D-01 bis D-04 grün.

## Phase 3: Oberfläche

- [ ] **T11 Bühne im Querformat.** Feste Spielfläche im Seitenverhältnis 16:9, die sich in jedes Fenster einpasst; im Hochformat verkleinert mit Rand. Fertig, wenn: M-01 bis M-03 bestanden.
- [ ] **T12 Grafiken.** SVGs für Rakete, Prinzessin auf Einhorn, je mindestens zwei Hindernisse pro Thema, Hintergrund je Thema. Fertig, wenn: alle Grafiken im Repo liegen, auf hellem und dunklem Hintergrund erkennbar sind und M-12 bestanden ist.
- [ ] **T13 Startbildschirm: Name.** Eingabefeld (max. 20 Zeichen), Bestätigen mit Enter oder Schaltfläche, letzter Name vorausgefüllt. Fertig, wenn: M-11 bestanden.
- [ ] **T14 Figurenwahl.** Zwei große Schaltflächen mit Bild. Fertig, wenn: Auswahl per Maus, Touch und Tastatur funktioniert.
- [ ] **T15 Spielszene.** Figur unten mittig mit Zahl, Hindernis kommt von oben und hält an, Aufgabe davor, zwei Lösungen links und rechts; Auswahl per Klick, Touch, ← / →. Fertig, wenn: M-04 bis M-07 bestanden.
- [ ] **T16 Animationen.** Richtig: Figur weicht zur gewählten Seite aus, fährt vorbei, übernimmt die neue Zahl. Falsch: Figur stürzt. Fertig, wenn: M-08 bis M-09 bestanden.
- [ ] **T17 Ergebnisbildschirm.** Punkte, Hinweis ob Bestenliste erreicht, Bestenliste, „Nochmal“. Fertig, wenn: M-10, M-13 und M-15 bestanden.

## Phase 4: Veröffentlichen

- [ ] **T18 GitHub Pages.** GitHub-Actions-Workflow, der bei Push auf `main` baut und veröffentlicht; Vite `base` auf `/Math_Rider/`. Fertig, wenn: der Workflow grün ist, das Spiel unter `https://uncbolle.github.io/Math_Rider/` läuft und M-12 dort bestanden ist. (Der Push dafür nur auf Befehl des Nutzers.)
- [ ] **T19 Test auf echten Geräten.** Nutzer prüft M-14. Fertig, wenn: der Nutzer es bestätigt und gefundene Probleme als Aufgaben hier stehen.

## Später

- [ ] **T20 Töne.** Leise, freundliche Töne für richtig und falsch, gut sichtbarer Stummschalter, Einstellung wird gespeichert.
