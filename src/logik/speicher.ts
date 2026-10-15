import { BESTENLISTE_LAENGE, type Eintrag } from "./bestenliste";
import { FIGUREN, type Figur } from "./figuren";
import { pruefeName } from "./name";

// Teil von localStorage, den das Spiel braucht; in Tests ersetzbar
export type Speicher = Pick<Storage, "getItem" | "setItem">;

export const SCHLUESSEL_NAME = "mathRider.name";
export const SCHLUESSEL_BESTENLISTE = "mathRider.bestenliste";

// localStorage, oder null, wenn der Browser ihn verweigert (z. B. privater Modus)
export function standardSpeicher(): Speicher | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function lies(speicher: Speicher | null, schluessel: string): string | null {
  try {
    return speicher?.getItem(schluessel) ?? null;
  } catch {
    return null;
  }
}

function schreibe(speicher: Speicher | null, schluessel: string, wert: string): void {
  try {
    speicher?.setItem(schluessel, wert);
  } catch {
    // Ohne Speicher läuft das Spiel weiter, es merkt sich nur nichts
  }
}

export function ladeName(speicher: Speicher | null): string {
  return pruefeName(lies(speicher, SCHLUESSEL_NAME) ?? "") ?? "";
}

export function speichereName(speicher: Speicher | null, name: string): void {
  schreibe(speicher, SCHLUESSEL_NAME, name);
}

function istEintrag(wert: unknown): wert is Eintrag {
  if (typeof wert !== "object" || wert === null) return false;
  const { name, figur, punkte } = wert as Record<string, unknown>;
  return (
    typeof name === "string" &&
    pruefeName(name) === name &&
    FIGUREN.includes(figur as Figur) &&
    Number.isInteger(punkte) &&
    (punkte as number) >= 1
  );
}

export function ladeBestenliste(speicher: Speicher | null): Eintrag[] {
  const text = lies(speicher, SCHLUESSEL_BESTENLISTE);
  if (text === null) return [];

  let daten: unknown;
  try {
    daten = JSON.parse(text);
  } catch {
    return [];
  }
  if (!Array.isArray(daten) || !daten.every(istEintrag)) return [];

  // Stabile Sortierung: bei Gleichstand bleibt der ältere Eintrag vorn
  return [...daten].sort((a, b) => b.punkte - a.punkte).slice(0, BESTENLISTE_LAENGE);
}

export function speichereBestenliste(speicher: Speicher | null, liste: readonly Eintrag[]): void {
  schreibe(speicher, SCHLUESSEL_BESTENLISTE, JSON.stringify(liste));
}

export const SCHLUESSEL_STUMM = "mathRider.stumm";

export function ladeStumm(speicher: Speicher | null): boolean {
  return lies(speicher, SCHLUESSEL_STUMM) === "ja";
}

export function speichereStumm(speicher: Speicher | null, stumm: boolean): void {
  schreibe(speicher, SCHLUESSEL_STUMM, stumm ? "ja" : "nein");
}
