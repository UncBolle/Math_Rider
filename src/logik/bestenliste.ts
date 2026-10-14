import type { Figur } from "./figuren";

export const BESTENLISTE_LAENGE = 10;

export interface Eintrag {
  name: string;
  figur: Figur;
  punkte: number;
}

export interface Eintragung {
  liste: Eintrag[];
  // Erreichter Platz ab 1, oder null, wenn der Lauf nicht in die Liste kommt
  platz: number | null;
}

// Sortiert absteigend nach Punkten; bei Gleichstand steht der ältere Eintrag vorn
export function trageEin(liste: readonly Eintrag[], eintrag: Eintrag): Eintragung {
  if (eintrag.punkte < 1) return { liste: [...liste], platz: null };

  const index = liste.filter((vorhanden) => vorhanden.punkte >= eintrag.punkte).length;
  if (index >= BESTENLISTE_LAENGE) return { liste: [...liste], platz: null };

  const neu = [...liste.slice(0, index), eintrag, ...liste.slice(index)].slice(0, BESTENLISTE_LAENGE);
  return { liste: neu, platz: index + 1 };
}
