import { ordneLoesungenAn, type Anordnung, type Seite } from "./anordnung";
import { erzeugeAufgabe, type Aufgabe } from "./aufgabe";
import { erzeugeFalscheLoesung } from "./falscheLoesung";
import { HINDERNISSE, type Figur } from "./figuren";
import { erzeugeStartzahl } from "./startzahl";
import { ganzeZahl, type Zufall } from "./zufall";

// Ein Hindernis mit seiner Aufgabe und den beiden Lösungen
export interface Runde {
  aufgabe: Aufgabe;
  anordnung: Anordnung;
  hindernis: string;
}

export interface Lauf {
  name: string;
  figur: Figur;
  zahl: number;
  punkte: number;
  aufgabenNummer: number;
  runde: Runde;
  ausgeschieden: boolean;
}

function erzeugeRunde(zahl: number, aufgabenNummer: number, figur: Figur, zufall: Zufall): Runde {
  const aufgabe = erzeugeAufgabe(zahl, aufgabenNummer, zufall);
  const anordnung = ordneLoesungenAn(aufgabe.loesung, erzeugeFalscheLoesung(aufgabe, zufall), zufall);
  const hindernisse = HINDERNISSE[figur];
  const hindernis = hindernisse[ganzeZahl(zufall, 0, hindernisse.length - 1)];
  return { aufgabe, anordnung, hindernis };
}

export function starteLauf(name: string, figur: Figur, zufall: Zufall): Lauf {
  const zahl = erzeugeStartzahl(zufall);
  return {
    name,
    figur,
    zahl,
    punkte: 0,
    aufgabenNummer: 1,
    runde: erzeugeRunde(zahl, 1, figur, zufall),
    ausgeschieden: false,
  };
}

export function waehleLoesung(lauf: Lauf, seite: Seite, zufall: Zufall): Lauf {
  if (lauf.ausgeschieden) return lauf;
  if (seite !== lauf.runde.anordnung.richtigeSeite) {
    return { ...lauf, ausgeschieden: true };
  }

  const zahl = lauf.runde.aufgabe.loesung;
  const aufgabenNummer = lauf.aufgabenNummer + 1;
  return {
    ...lauf,
    zahl,
    punkte: lauf.punkte + 1,
    aufgabenNummer,
    runde: erzeugeRunde(zahl, aufgabenNummer, lauf.figur, zufall),
  };
}

export function nochmal(lauf: Lauf, zufall: Zufall): Lauf {
  return starteLauf(lauf.name, lauf.figur, zufall);
}
