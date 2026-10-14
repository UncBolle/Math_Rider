import { describe, expect, it } from "vitest";
import { BESTENLISTE_LAENGE, trageEin, type Eintrag } from "../src/logik/bestenliste";

const eintrag = (name: string, punkte: number): Eintrag => ({ name, figur: "rakete", punkte });

// Volle Liste mit 10 Einträgen: 100, 90, ..., 10 Punkte
function volleListe(): Eintrag[] {
  return Array.from({ length: BESTENLISTE_LAENGE }, (_, i) => eintrag(`Kind${i + 1}`, 100 - i * 10));
}

describe("T9: Bestenliste", () => {
  it("B-01: in einer leeren Liste kommt ein Lauf mit 1 Punkt auf Platz 1", () => {
    const ergebnis = trageEin([], eintrag("Lena", 1));
    expect(ergebnis.liste).toEqual([eintrag("Lena", 1)]);
    expect(ergebnis.platz).toBe(1);
  });

  it("B-02: ein Lauf mit 0 Punkten kommt nicht in die Liste", () => {
    const ergebnis = trageEin([], eintrag("Lena", 0));
    expect(ergebnis.liste).toEqual([]);
    expect(ergebnis.platz).toBeNull();
  });

  it("B-03: nach 11 Läufen hat die Liste 10 Einträge, absteigend, ohne den schlechtesten", () => {
    let liste: Eintrag[] = [];
    for (const punkte of [5, 12, 3, 40, 7, 25, 1, 18, 33, 9, 14]) {
      liste = trageEin(liste, eintrag(`Kind${punkte}`, punkte)).liste;
    }
    expect(liste.map((e) => e.punkte)).toEqual([40, 33, 25, 18, 14, 12, 9, 7, 5, 3]);
  });

  it("B-04: bei voller Liste bleibt ein schlechterer Lauf draußen", () => {
    const liste = volleListe();
    const ergebnis = trageEin(liste, eintrag("Lena", 5));
    expect(ergebnis.liste).toEqual(liste);
    expect(ergebnis.platz).toBeNull();
  });

  it("B-05: bei voller Liste bleibt ein Lauf gleich Platz 10 draußen", () => {
    const liste = volleListe();
    const ergebnis = trageEin(liste, eintrag("Lena", 10));
    expect(ergebnis.liste).toEqual(liste);
    expect(ergebnis.platz).toBeNull();
  });

  it("B-06: bei gleicher Punktzahl steht der ältere Eintrag vorn", () => {
    const liste = [eintrag("Alt", 20), eintrag("Mitte", 10)];
    const ergebnis = trageEin(liste, eintrag("Neu", 20));
    expect(ergebnis.liste.map((e) => e.name)).toEqual(["Alt", "Neu", "Mitte"]);
    expect(ergebnis.platz).toBe(2);
  });

  it("B-07: der Eintrag enthält Name, Figur und Punkte, das Ergebnis nennt den Platz", () => {
    const neu: Eintrag = { name: "Mia", figur: "prinzessin", punkte: 85 };
    const ergebnis = trageEin(volleListe(), neu);
    expect(ergebnis.platz).toBe(3);
    expect(ergebnis.liste[2]).toEqual(neu);
    expect(ergebnis.liste).toHaveLength(BESTENLISTE_LAENGE);
  });

  it("verändert die übergebene Liste nicht", () => {
    const liste = [eintrag("Alt", 20)];
    trageEin(liste, eintrag("Neu", 30));
    expect(liste).toEqual([eintrag("Alt", 20)]);
  });
});
