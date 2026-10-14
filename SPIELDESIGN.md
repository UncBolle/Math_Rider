# Math_Rider: Spieldesign

Einzige Quelle für die Spielregeln. Änderungen hier nur nach Zustimmung des Nutzers.

## Ablauf

1. Das Kind gibt seinen Namen ein (Vorname oder Spitzname, höchstens 20 Zeichen). Der zuletzt eingegebene Name ist vorausgefüllt.
2. Es wählt eine Figur: **Rakete** oder **Prinzessin auf einem Einhorn**.
3. Das Spiel startet. Auf der Figur steht eine Zahl.
4. Nacheinander kommen Hindernisse mit Aufgaben, bis das Kind eine falsche Lösung wählt.
5. Ergebnisbildschirm mit Bestenliste und „Nochmal“ (gleicher Name, gleiche Figur).

## Figuren und Hindernisse

Jede Figur hat ein Thema; ihre Hindernisse passen dazu. Die Beispiele sind Vorschläge, weitere zum Thema passende Hindernisse dürfen dazukommen.

| Figur | Thema | Beispiele für Hindernisse |
|---|---|---|
| Rakete | Weltraum: freier Flug durch Nebel und Sterne, keine Straße | Asteroid, Schwarzes Loch, Komet |
| Prinzessin auf Einhorn | Märchenwald: Ritt auf einem Waldweg durch einen leuchtenden Wald bei Nacht | umgestürzter Baumstamm, Felsbrocken, Dornengestrüpp |

Welches Hindernis kommt, wird zufällig aus denen der Figur gewählt und dient nur der Abwechslung; es hat keinen Einfluss auf die Aufgabe.

## Szene

- Echtes 3D, Ansicht leicht seitlich von hinten und oben: Die Figur ist unten im Bild, die Welt zieht auf sie zu.
- Das Hindernis taucht in der Ferne auf und kommt näher. Links und rechts davon steht je eine Lösung (Weltraum: Neon-Portal, Märchenwald: Leuchtkugel).
- Die Aufgabe, z. B. „+12“, steht als Schild zwischen Figur und Hindernis, also vor dem Hindernis.
- Das Hindernis hält vor der Figur an und wartet, bis eine Lösung gewählt ist. Es gibt keinen Zeitdruck.

## Stil

Modern, detailreich, leuchtend: echte 3D-Modelle mit Licht, Spiegelungen und Leuchteffekten (Bloom). Weltraum mit Nebeln, Sternenfeldern, Planeten und vorbeirauschendem Sternenstaub. Märchenwald bei Nacht mit Mondlicht, Nebel, Glühwürmchen, leuchtenden Pilzen und farbig glimmenden Zauberbäumen. Menüs in Glas-Optik mit Neonknöpfen.

## Aufgaben

- Zahlenraum: **1 bis 100**, fest. Die Zahl auf der Figur verlässt ihn nie.
- Startzahl: zufällig von 1 bis 10.
- Jede Aufgabe ist Plus oder Minus mit einer Aufgabenzahl von 1 bis 20. In den ersten 5 Aufgaben eines Laufs (Aufgabe 1 bis 5) ist die Aufgabenzahl höchstens 10.
- Die Aufgabe wird so gewählt, dass das Ergebnis im Zahlenraum 1 bis 100 liegt. Ist nur eine Rechenart möglich (z. B. bei 100 nur Minus, bei 1 nur Plus), kommt diese.
- Sind beide Rechenarten möglich, kommt jede mit Wahrscheinlichkeit 1/2. Die Aufgabenzahl ist im erlaubten Bereich gleichverteilt.

Beispiel: Auf der Figur steht 5, die Aufgabe lautet „+12“, die richtige Lösung ist 17.

## Lösungen

- Eine richtige und eine falsche Lösung; auf welcher Seite die richtige steht, ist zufällig.
- Die falsche Lösung entsteht aus einem typischen Rechenfehler:
  - um 1 oder 2 daneben,
  - um 10 daneben,
  - Plus und Minus vertauscht (5 − 12 statt 5 + 12).
- Die falsche Lösung liegt ebenfalls im Zahlenraum 1 bis 100 und ist nie gleich der richtigen.

## Antworten

- Auswahl per Tippen oder Klicken auf die Lösung (große Schaltflächen), am PC auch mit den Pfeiltasten ← / →.
- **Richtig:** Die Figur weicht zur gewählten Seite aus, fährt am Hindernis vorbei und trägt das Ergebnis als neue Zahl.
- **Falsch:** Die Figur stürzt, das Kind ist ausgeschieden.

## Highscore

- Punkte eines Laufs: Anzahl der richtigen Antworten in Folge.
- Bestenliste mit den 10 besten Läufen auf dem Gerät: Name, Figur, Punkte. Gespeichert nur im Browser.
- Läufe mit 0 Punkten kommen nicht in die Liste. Bei gleicher Punktzahl steht der ältere Eintrag vorn.
- Nach dem Ausscheiden: Punkte anzeigen, Hinweis, ob es für die Bestenliste reicht, Schaltfläche „Nochmal“.

## Später (nach der Grundversion)

- Töne bei richtigen und falschen Antworten: leise und freundlich, mit gut sichtbarem Knopf zum Stummschalten.
