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

## 2026-10-14 (3)

**Erledigt**
- Annahmen bestätigt und in SPIELDESIGN.md übernommen.
- Node.js 24.20.0 (LTS) per winget installiert.
- T1: Vite 8, TypeScript 7, Vitest 5; Ordner `src/logik/`, `src/ansicht/`, `src/grafiken/`, `tests/`; Platzhalterseite, Beispieltest, `.gitignore`.

**Entscheidungen**
- Tests liegen unter `tests/`, getrennt vom Spielcode: `src/` enthält nur, was ausgeliefert wird.
- `npm run build` prüft vorher die Typen mit `tsc`: Typfehler stoppen den Build.

**Bekannte Probleme**
- VS Code muss neu gestartet werden, damit `node` und `npm` im Terminal gefunden werden.

**Offen / nächster Schritt**
- T2 (Zufallsquelle für Tests), dann T3 bis T10 test-first.

## 2026-10-14 (4)

**Erledigt**
- T2 bis T10: komplette Spiellogik in `src/logik/`, test-first, 51 Tests grün, Build ohne Fehler.
  - `zufall.ts`, `startzahl.ts`, `aufgabe.ts`, `falscheLoesung.ts`, `anordnung.ts`, `figuren.ts`, `lauf.ts`, `name.ts`, `bestenliste.ts`, `speicher.ts`.

**Entscheidungen**
- Spielzustand (`Lauf`) ist unveränderlich: jede Wahl liefert einen neuen Lauf. Die Oberfläche kann so vorher und nachher vergleichen (z. B. für Animationen).
- Falsche Lösung: gleichverteilt aus allen gültigen Fehlern (±1, ±2, ±10, Rechenzeichen vertauscht).
- Speicherfunktionen bekommen den Speicher übergeben (`Speicher | null`): testbar, und ohne localStorage läuft das Spiel einfach ohne Speichern.
- Geladene Bestenliste wird geprüft; bei kaputten Einträgen ist sie leer, sonst sortiert und auf 10 gekürzt.

**Bekannte Probleme**
- Die Werkzeug-Shell des Agenten findet `node` erst mit `PATH="/c/Program Files/nodejs:$PATH"`; im eigenen Terminal des Nutzers ist es nach dem Neustart eingetragen.

**Offen / nächster Schritt**
- Phase 3: T11 (Bühne im Querformat), dann T12 bis T17.

## 2026-10-14 (5)

**Erledigt**
- T11 bis T17 umgesetzt: Bühne 1280 × 720 (wird eingepasst), eigene SVGs, Namenseingabe, Figurenwahl, Spielszene mit Animationen, Ergebnis mit Bestenliste. Das Spiel ist durchspielbar.
- Selbst geprüft mit Edge headless (Skript über die DevTools-Schnittstelle): beide Figuren durchgespielt, richtige und falsche Antworten, Pfeiltasten, Bestenliste wird gespeichert und hervorgehoben, Name nach Neuladen vorausgefüllt; kein Scrollen bei 640 × 360, 1920 × 1080 und hochkant 360 × 640; keine Anfragen an fremde Server; keine Fehler in der Konsole.

**Entscheidungen**
- Bühne mit festen Maßen, per `transform: scale` eingepasst: alle Bildschirme rechnen in denselben Punkten, auf jedem Gerät gleich.
- Animationen mit der Web Animations API; bei „Bewegung reduzieren“ im System laufen sie kürzer.
- Beim Ausscheiden zeigt das Spiel die richtige Lösung („Knapp daneben! Richtig war 17.“): das Kind lernt dabei.
- Figurenwahl fragt „Wähle deine Figur:“, weil die Prinzessin nicht „fährt“.
- Jeder Bildschirm meldet Tasten über ein `AbortSignal` an; beim Wechsel werden sie gemeinsam abgemeldet.

**Bekannte Probleme**
- Noch nicht geprüft: echtes Touch und echte Handys (M-04, M-11 Handy-Tastatur, M-14). T11 bis T17 bleiben offen, bis der Nutzer getestet hat.
- Nach dem Ergebnis gibt es nur „Nochmal“ (laut SPIELDESIGN.md); Name oder Figur wechseln geht nur über Neuladen.

**Offen / nächster Schritt**
- Nutzer testet im Browser und auf dem Handy; Rückmeldungen als Aufgaben aufnehmen.
- Danach T18 (GitHub Pages).

## 2026-10-14 (6)

**Erledigt**
- Rückmeldung des Nutzers umgesetzt: Aufgabe steht jetzt als Schild vor dem Hindernis (zwischen Figur und Hindernis); Grafik komplett neu im Stil von Lumo 2.
  - Perspektivische, schwebende Strecke mit Neonlinien auf Canvas (`kulisse.ts`), Hindernisse kommen vom Horizont näher (`perspektive.ts`, mit Tests).
  - Neue SVGs: Figuren von hinten, Hindernisse mit Verläufen, Glanz und Leuchten.
  - Menüs in Glas-Optik mit Neonknöpfen; Funken und „+1“ bei richtigen Antworten, Wackeln beim Ausscheiden.
- Geprüft mit Edge headless: beide Figuren, richtige und falsche Antworten, alle Größen ohne Scrollen, keine fremden Anfragen, keine Konsolenfehler; 57 Tests grün.

**Entscheidungen**
- Strecke als Canvas statt CSS-3D: eine riesige 3D-Fläche wäre auf Handys zu speicherhungrig; das Canvas zeichnet nur, was sichtbar ist.
- Kulisse und Hindernisse rechnen mit derselben Projektion (`perspektive.ts`) und werden im selben Bild bewegt: das Hindernis „steht“ fest auf der Strecke.
- Nur Systemschriften, alle Effekte mit CSS/SVG/Canvas: weiterhin nichts von fremden Servern.

**Bekannte Probleme**
- Leistung auf älteren Handys noch nicht geprüft (Canvas, Unschärfe-Effekte der Glas-Optik).

**Offen / nächster Schritt**
- Nutzer testet den neuen Look; danach Abnahme von T11 bis T17 und T18 (GitHub Pages).

## 2026-10-15

**Erledigt**
- Rückmeldung „sieht zu sehr nach 90ern aus“: Spielszene komplett auf echtes 3D mit Three.js umgestellt.
  - Weltraum: freier Flug (keine Straße), Nebel-Shader, Sternenfelder, Planeten, Sternenstaub; Rakete im Code gebaut; Asteroid, Komet, Schwarzes Loch; Lösungen als Neon-Portale.
  - Märchenwald bei Nacht: Bäume, Farne, Blumen, Pilze, Felsen aus dem Stylized Nature MegaKit (CC0), Mond, Nebel, Glühwürmchen, Mondstrahlen, violett/türkis glimmende Zauberbäume; Hindernisse Baumstamm, Felsen, Dornengestrüpp; Lösungen als Leuchtkugeln.
  - Einhorn aus Quaternius „White Horse“ (Galopp/Stehen animiert) mit Glanzfell, Regenbogenmähne, leuchtendem Horn; Prinzessin aus „Woman in Dress“ (Sitz-Animation) mit Krone.
  - Menübilder der Figuren aus der 3D-Szene gerendert (PNG statt SVG).
- Alte 2D-Darstellung entfernt (Canvas-Kulisse, Perspektivrechnung samt Test, SVG-Grafiken).

**Entscheidungen**
- Three.js mit freien CC0-Modellen statt handgezeichneter SVGs: vom Nutzer gewählt; nur so wirkt es modern und detailreich.
- Zahlen, Lösungen und Aufgabenschild bleiben HTML-Elemente, die jedes Bild an 3D-Punkte gehängt werden: gestochen scharf und weiter klick- und tippbar.
- Kamera leicht seitlich versetzt: von genau hinten wirken Einhorn und Rakete zu schmal.
- Texturen auf höchstens 1024 px verkleinert (35 MB → 5 MB).

**Bekannte Probleme**
- Ladegröße rund 11 MB Modelle + 190 kB Skript (gezippt); Ladezeit auf langsamem Netz noch nicht gemessen.
- Leistung auf echten Handys ungetestet (Bloom-Effekt, viele Bäume). Falls es ruckelt: Bloom auf Handys abschalten oder Bäume zusammenfassen (InstancedMesh).
- Die Prinzessin ist ein einfaches Modell; ein schöneres freies Prinzessinnen-Modell gab es nicht.

**Offen / nächster Schritt**
- Nutzer testet den neuen 3D-Look am PC und Handy.
- Danach T18 (GitHub Pages; dabei Vite `base` und die Modellpfade prüfen).
