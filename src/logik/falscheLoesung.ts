import { liegtImZahlenraum, rechne, type Aufgabe } from "./aufgabe";
import { ganzeZahl, type Zufall } from "./zufall";

// Typische Rechenfehler: knapp daneben, um einen Zehner daneben
const ABWEICHUNGEN = [-1, 1, -2, 2, -10, 10];

// Wählt gleichverteilt aus allen typischen Fehlern, die im Zahlenraum liegen
export function erzeugeFalscheLoesung(aufgabe: Aufgabe, zufall: Zufall): number {
  const vertauscht = rechne(
    aufgabe.ausgangszahl,
    aufgabe.rechenart === "plus" ? "minus" : "plus",
    aufgabe.aufgabenzahl,
  );
  const kandidaten = new Set([...ABWEICHUNGEN.map((d) => aufgabe.loesung + d), vertauscht]);
  const gueltig = [...kandidaten].filter((zahl) => zahl !== aufgabe.loesung && liegtImZahlenraum(zahl));

  // Nie leer: loesung + 1 oder loesung - 1 liegt immer im Zahlenraum
  return gueltig[ganzeZahl(zufall, 0, gueltig.length - 1)];
}
