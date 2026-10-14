import { ganzeZahl, type Zufall } from "./zufall";

export const ZAHLENRAUM_MIN = 1;
export const ZAHLENRAUM_MAX = 100;
export const AUFGABENZAHL_MAX = 20;
export const AUFGABENZAHL_MAX_ANFANG = 10;
export const ANZAHL_ANFANGSAUFGABEN = 5;

export type Rechenart = "plus" | "minus";

export interface Aufgabe {
  ausgangszahl: number;
  rechenart: Rechenart;
  aufgabenzahl: number;
  loesung: number;
}

export function liegtImZahlenraum(zahl: number): boolean {
  return Number.isInteger(zahl) && zahl >= ZAHLENRAUM_MIN && zahl <= ZAHLENRAUM_MAX;
}

export function rechne(zahl: number, rechenart: Rechenart, aufgabenzahl: number): number {
  return rechenart === "plus" ? zahl + aufgabenzahl : zahl - aufgabenzahl;
}

// zahl: aktuelle Zahl auf der Figur; aufgabenNummer: 1 für die erste Aufgabe eines Laufs
export function erzeugeAufgabe(zahl: number, aufgabenNummer: number, zufall: Zufall): Aufgabe {
  if (!liegtImZahlenraum(zahl)) {
    throw new RangeError(`Zahl ${zahl} liegt nicht im Zahlenraum`);
  }
  if (!Number.isInteger(aufgabenNummer) || aufgabenNummer < 1) {
    throw new RangeError(`Ungültige Aufgabennummer ${aufgabenNummer}`);
  }

  const obergrenze = aufgabenNummer <= ANZAHL_ANFANGSAUFGABEN ? AUFGABENZAHL_MAX_ANFANG : AUFGABENZAHL_MAX;
  // Größte Aufgabenzahl je Rechenart, bei der das Ergebnis im Zahlenraum bleibt
  const maxPlus = Math.min(obergrenze, ZAHLENRAUM_MAX - zahl);
  const maxMinus = Math.min(obergrenze, zahl - ZAHLENRAUM_MIN);

  let rechenart: Rechenart;
  if (maxPlus < 1) {
    rechenart = "minus";
  } else if (maxMinus < 1) {
    rechenart = "plus";
  } else {
    rechenart = zufall() < 0.5 ? "plus" : "minus";
  }

  const aufgabenzahl = ganzeZahl(zufall, 1, rechenart === "plus" ? maxPlus : maxMinus);
  return { ausgangszahl: zahl, rechenart, aufgabenzahl, loesung: rechne(zahl, rechenart, aufgabenzahl) };
}
