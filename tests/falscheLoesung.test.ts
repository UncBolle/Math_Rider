import { describe, expect, it } from "vitest";
import { liegtImZahlenraum, rechne, type Aufgabe, type Rechenart } from "../src/logik/aufgabe";
import { erzeugeFalscheLoesung } from "../src/logik/falscheLoesung";
import { erzeugeTestZufall } from "./hilfen/zufall";

function aufgabe(ausgangszahl: number, rechenart: Rechenart, aufgabenzahl: number): Aufgabe {
  return { ausgangszahl, rechenart, aufgabenzahl, loesung: rechne(ausgangszahl, rechenart, aufgabenzahl) };
}

// Jede Aufgabe, die das Spiel stellen kann
function alleMoeglichenAufgaben(): Aufgabe[] {
  const aufgaben: Aufgabe[] = [];
  for (let zahl = 1; zahl <= 100; zahl++) {
    for (const rechenart of ["plus", "minus"] as const) {
      for (let aufgabenzahl = 1; aufgabenzahl <= 20; aufgabenzahl++) {
        const kandidat = aufgabe(zahl, rechenart, aufgabenzahl);
        if (liegtImZahlenraum(kandidat.loesung)) aufgaben.push(kandidat);
      }
    }
  }
  return aufgaben;
}

function falscheLoesungen(a: Aufgabe, anzahl: number, startwert = 1): Set<number> {
  const zufall = erzeugeTestZufall(startwert);
  return new Set(Array.from({ length: anzahl }, () => erzeugeFalscheLoesung(a, zufall)));
}

describe("T5: Falsche Lösung erzeugen", () => {
  const alle = alleMoeglichenAufgaben();
  const zufall = erzeugeTestZufall(5);

  it("F-01: falsche Lösung ist nie die richtige", () => {
    for (const a of alle) {
      for (let i = 0; i < 50; i++) {
        expect(erzeugeFalscheLoesung(a, zufall)).not.toBe(a.loesung);
      }
    }
  });

  it("F-02: falsche Lösung ist ganz und liegt in 1 bis 100", () => {
    for (const a of alle) {
      for (let i = 0; i < 50; i++) {
        expect(liegtImZahlenraum(erzeugeFalscheLoesung(a, zufall))).toBe(true);
      }
    }
  });

  it("F-03: falsche Lösung entsteht aus einem typischen Rechenfehler", () => {
    for (const a of alle) {
      const vertauscht = rechne(a.ausgangszahl, a.rechenart === "plus" ? "minus" : "plus", a.aufgabenzahl);
      for (let i = 0; i < 50; i++) {
        const falsch = erzeugeFalscheLoesung(a, zufall);
        const abstand = Math.abs(falsch - a.loesung);
        expect([1, 2, 10].includes(abstand) || falsch === vertauscht).toBe(true);
      }
    }
  });

  it("F-04: bei 50 „+12“ kommen alle Fehlerarten vor", () => {
    expect(falscheLoesungen(aufgabe(50, "plus", 12), 2000)).toEqual(new Set([61, 63, 60, 64, 52, 72, 38]));
  });

  it("F-05: bei richtiger Lösung 1 (3 „−2“) bleibt die falsche Lösung gültig", () => {
    expect(falscheLoesungen(aufgabe(3, "minus", 2), 2000)).toEqual(new Set([2, 3, 11, 5]));
  });

  it("F-06: bei richtiger Lösung 100 (90 „+10“) bleibt die falsche Lösung gültig", () => {
    expect(falscheLoesungen(aufgabe(90, "plus", 10), 2000)).toEqual(new Set([99, 98, 90, 80]));
  });
});
