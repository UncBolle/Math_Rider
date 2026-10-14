# Math_Rider: Testfälle

Testfälle zu [SPIELDESIGN.md](SPIELDESIGN.md). Die Aufgaben in [AUFGABEN.md](AUFGABEN.md) verweisen auf die IDs.

- **Automatisch (Vitest):** alle Gruppen außer M. Der Testname beginnt mit der ID, z. B. `it("A-05: bei 100 kommt immer Minus", ...)`.
- **Zufall:** Tests mit Zufall laufen mit festem Startwert (T2) und vielen Wiederholungen (mindestens 1000 Läufe je Fall), damit seltene Fälle sicher vorkommen.
- **Manuell (M):** Prüfung im Browser, auf dem Handy über die Handy-Ansicht der Entwicklertools.

## S: Startzahl

| ID | Fall | Erwartet |
|---|---|---|
| S-01 | Viele Startzahlen erzeugen | Jede ist eine ganze Zahl von 1 bis 10 |
| S-02 | Viele Startzahlen erzeugen | Jeder Wert von 1 bis 10 kommt vor |

## A: Aufgabe erzeugen

| ID | Fall | Erwartet |
|---|---|---|
| A-01 | Jede Zahl 1 bis 100, jede Aufgabennummer 1 bis 10, je viele Aufgaben | Ergebnis liegt immer in 1 bis 100 |
| A-02 | wie A-01 | Aufgabenzahl ist ganz, mindestens 1, höchstens 20; nie 0 |
| A-03 | Aufgabennummer 1 bis 5 | Aufgabenzahl höchstens 10 |
| A-04 | Aufgabennummer ab 6, Zahl 50 | Aufgabenzahlen über 10 kommen vor, 20 kommt vor |
| A-05 | Zahl 100 | Immer Minus |
| A-06 | Zahl 1 | Immer Plus |
| A-07 | Zahl 50 | Plus und Minus kommen beide vor, je etwa zur Hälfte (40 bis 60 %) |
| A-08 | Zahl 95, Aufgabennummer 6 | Plus-Aufgaben haben höchstens 5 als Aufgabenzahl |
| A-09 | Beliebige Aufgabe | Richtige Lösung = Zahl + Aufgabenzahl bzw. Zahl − Aufgabenzahl |

## F: Falsche Lösung

| ID | Fall | Erwartet |
|---|---|---|
| F-01 | Jede mögliche Aufgabe (Zahl 1 bis 100, alle erlaubten Aufgaben), je viele Male | Falsche Lösung ≠ richtige Lösung |
| F-02 | wie F-01 | Falsche Lösung ist ganz und liegt in 1 bis 100 |
| F-03 | wie F-01 | Falsche Lösung weicht um 1, 2 oder 10 ab oder ist das Ergebnis mit vertauschtem Rechenzeichen |
| F-04 | Zahl 50, „+12“ | Alle Fehlerarten kommen vor: ±1, ±2, ±10, vertauscht (38) |
| F-05 | Richtige Lösung 1 (z. B. 3 „−2“) | Falsche Lösung trotzdem gültig (z. B. 2, 3, 11, 5) |
| F-06 | Richtige Lösung 100 (z. B. 90 „+10“) | Falsche Lösung trotzdem gültig (z. B. 99, 98, 90, 80) |

## L: Lösungen anordnen

| ID | Fall | Erwartet |
|---|---|---|
| L-01 | Viele Anordnungen | Richtige Lösung steht links und rechts je etwa zur Hälfte (40 bis 60 %) |
| L-02 | Beliebige Anordnung | Genau eine Seite ist richtig; beide Seiten zeigen verschiedene Zahlen |

## P: Spielablauf

| ID | Fall | Erwartet |
|---|---|---|
| P-01 | Neuer Lauf mit Name und Figur | Punkte 0, Aufgabennummer 1, Zahl = Startzahl, nicht ausgeschieden |
| P-02 | Richtige Lösung wählen | Zahl = richtige Lösung, Punkte +1, Aufgabennummer +1, neue Aufgabe erzeugt |
| P-03 | Falsche Lösung wählen | Ausgeschieden; Zahl und Punkte unverändert |
| P-04 | Nach dem Ausscheiden noch eine Lösung wählen | Wird ignoriert, Zustand unverändert |
| P-05 | Viele Aufgaben mit Figur Rakete bzw. Prinzessin | Hindernis stammt immer aus dem Thema der Figur |
| P-06 | Viele Aufgaben | Jedes Hindernis des Themas kommt vor |
| P-07 | „Nochmal“ nach dem Ausscheiden | Gleicher Name, gleiche Figur, Punkte 0, Aufgabennummer 1, neue Startzahl |

## N: Name

| ID | Fall | Erwartet |
|---|---|---|
| N-01 | „  Lena  “ | Wird zu „Lena“ (Leerzeichen am Rand entfernt) |
| N-02 | Leer oder nur Leerzeichen | Abgelehnt |
| N-03 | 20 Zeichen | Erlaubt; 21 Zeichen werden abgelehnt |
| N-04 | Umlaute und ß („Jürgen“, „Groß“) | Erlaubt, unverändert |

## B: Bestenliste

| ID | Fall | Erwartet |
|---|---|---|
| B-01 | Leere Liste, Lauf mit 1 Punkt | Kommt in die Liste |
| B-02 | Lauf mit 0 Punkten | Kommt nicht in die Liste |
| B-03 | 11 Läufe mit verschiedenen Punkten | Liste hat 10 Einträge, absteigend sortiert, der schlechteste fehlt |
| B-04 | Volle Liste, Lauf schlechter als Platz 10 | Liste unverändert, Ergebnis „nicht in der Bestenliste“ |
| B-05 | Volle Liste, Lauf gleich Platz 10 | Nicht aufgenommen (älterer Eintrag bleibt vorn) |
| B-06 | Neuer Lauf mit gleicher Punktzahl wie ein vorhandener | Steht hinter dem älteren Eintrag |
| B-07 | Eintrag | Enthält Name, Figur und Punkte; Ergebnis nennt den erreichten Platz |

## D: Speichern im Browser

| ID | Fall | Erwartet |
|---|---|---|
| D-01 | Name und Bestenliste speichern, dann laden | Gleiche Daten |
| D-02 | Gespeicherte Daten sind kaputt (kein gültiges JSON, falsche Form) | Leere Bestenliste, kein Absturz |
| D-03 | `localStorage` wirft Fehler (z. B. privater Modus) | Spiel läuft weiter, nur ohne Speichern |
| D-04 | Nichts gespeichert (erster Besuch) | Leerer Name, leere Bestenliste |

## M: Manuell im Browser

| ID | Fall | Erwartet |
|---|---|---|
| M-01 | Jeder Bildschirm bei 640 × 360 | Alles sichtbar, kein Scrollen, kein Zoomen nötig |
| M-02 | Jeder Bildschirm bei 1920 × 1080 | Bühne füllt das Fenster im Seitenverhältnis, scharf, nicht verzerrt |
| M-03 | Hochformat 360 × 640 | Querformat-Bühne verkleinert mit Rand, weiterhin spielbar |
| M-04 | Lösung antippen (Touch-Simulation) bzw. anklicken | Wird gewählt |
| M-05 | Pfeiltasten ← / → | Wählen linke bzw. rechte Lösung |
| M-06 | Schnell doppelt tippen oder beide Lösungen kurz nacheinander | Nur die erste Wahl zählt |
| M-07 | Hindernis erreicht die Figur, 30 Sekunden nichts tun | Hindernis wartet, nichts passiert |
| M-08 | Richtige Lösung | Figur weicht zur gewählten Seite aus, fährt vorbei, zeigt die neue Zahl |
| M-09 | Falsche Lösung | Figur stürzt, danach Ergebnisbildschirm |
| M-10 | Ergebnisbildschirm | Punkte, Hinweis zur Bestenliste, Bestenliste, „Nochmal“ startet mit gleichem Namen und gleicher Figur |
| M-11 | Name eingeben (Handy-Ansicht), Enter drücken | Tastatur erscheint, Enter bestätigt; letzter Name ist beim Neuladen vorausgefüllt |
| M-12 | Entwicklertools, Tab „Netzwerk“, ganzes Spiel durchspielen | Nur Anfragen an die eigene Seite, nichts von fremden Servern |
| M-13 | Alle Texte lesen, auch beim Ausscheiden | Kurz, freundlich, ermutigend |
| M-14 | Echtes Handy: Chrome (Android) und Safari (iOS), quer und hochkant | Wie M-01 bis M-11 |
| M-15 | Seite neu laden | Bestenliste ist noch da |
