import { describe, expect, it } from "vitest";
import { andereSeite } from "../src/logik/anordnung";
import { liegtImZahlenraum } from "../src/logik/aufgabe";
import { HINDERNISSE, type Figur } from "../src/logik/figuren";
import { nochmal, starteLauf, waehleLoesung, type Lauf } from "../src/logik/lauf";
import { erzeugeTestZufall } from "./hilfen/zufall";

const richtig = (lauf: Lauf) => lauf.runde.anordnung.richtigeSeite;
const falsch = (lauf: Lauf) => andereSeite(lauf.runde.anordnung.richtigeSeite);

describe("T7: Spielablauf", () => {
  it("P-01: neuer Lauf beginnt mit 0 Punkten, Aufgabe 1 und der Startzahl", () => {
    const lauf = starteLauf("Lena", "rakete", erzeugeTestZufall(1));
    expect(lauf.name).toBe("Lena");
    expect(lauf.figur).toBe("rakete");
    expect(lauf.punkte).toBe(0);
    expect(lauf.aufgabenNummer).toBe(1);
    expect(lauf.zahl).toBeGreaterThanOrEqual(1);
    expect(lauf.zahl).toBeLessThanOrEqual(10);
    expect(lauf.runde.aufgabe.ausgangszahl).toBe(lauf.zahl);
    expect(lauf.ausgeschieden).toBe(false);
  });

  it("P-02: richtige Lösung übernimmt das Ergebnis, zählt einen Punkt und stellt eine neue Aufgabe", () => {
    const zufall = erzeugeTestZufall(2);
    const vorher = starteLauf("Lena", "rakete", zufall);
    const nachher = waehleLoesung(vorher, richtig(vorher), zufall);
    expect(nachher.zahl).toBe(vorher.runde.aufgabe.loesung);
    expect(nachher.punkte).toBe(1);
    expect(nachher.aufgabenNummer).toBe(2);
    expect(nachher.runde.aufgabe.ausgangszahl).toBe(nachher.zahl);
    expect(nachher.ausgeschieden).toBe(false);
  });

  it("P-03: falsche Lösung scheidet aus, Zahl und Punkte bleiben", () => {
    const zufall = erzeugeTestZufall(3);
    let lauf = starteLauf("Lena", "prinzessin", zufall);
    lauf = waehleLoesung(lauf, richtig(lauf), zufall);
    const nachher = waehleLoesung(lauf, falsch(lauf), zufall);
    expect(nachher.ausgeschieden).toBe(true);
    expect(nachher.zahl).toBe(lauf.zahl);
    expect(nachher.punkte).toBe(1);
  });

  it("P-04: nach dem Ausscheiden wird jede weitere Wahl ignoriert", () => {
    const zufall = erzeugeTestZufall(4);
    const lauf = starteLauf("Lena", "rakete", zufall);
    const raus = waehleLoesung(lauf, falsch(lauf), zufall);
    expect(waehleLoesung(raus, "links", zufall)).toBe(raus);
    expect(waehleLoesung(raus, "rechts", zufall)).toBe(raus);
  });

  for (const figur of ["rakete", "prinzessin"] as Figur[]) {
    it(`P-05 und P-06: Hindernisse der Figur ${figur} stammen aus ihrem Thema, alle kommen vor`, () => {
      const zufall = erzeugeTestZufall(5);
      let lauf = starteLauf("Lena", figur, zufall);
      const gesehen = new Set<string>();
      for (let i = 0; i < 500; i++) {
        expect(HINDERNISSE[figur]).toContain(lauf.runde.hindernis);
        gesehen.add(lauf.runde.hindernis);
        lauf = waehleLoesung(lauf, richtig(lauf), zufall);
      }
      expect(gesehen).toEqual(new Set(HINDERNISSE[figur]));
    });
  }

  it("P-07: Nochmal startet mit gleichem Namen und gleicher Figur von vorn", () => {
    const zufall = erzeugeTestZufall(7);
    let lauf = starteLauf("Lena", "prinzessin", zufall);
    for (let i = 0; i < 3; i++) lauf = waehleLoesung(lauf, richtig(lauf), zufall);
    lauf = waehleLoesung(lauf, falsch(lauf), zufall);

    const neu = nochmal(lauf, zufall);
    expect(neu.name).toBe("Lena");
    expect(neu.figur).toBe("prinzessin");
    expect(neu.punkte).toBe(0);
    expect(neu.aufgabenNummer).toBe(1);
    expect(neu.ausgeschieden).toBe(false);
    expect(neu.zahl).toBeGreaterThanOrEqual(1);
    expect(neu.zahl).toBeLessThanOrEqual(10);
  });

  it("bleibt in langen Läufen immer im Zahlenraum", () => {
    const zufall = erzeugeTestZufall(8);
    let lauf = starteLauf("Lena", "rakete", zufall);
    for (let i = 0; i < 5000; i++) {
      lauf = waehleLoesung(lauf, richtig(lauf), zufall);
      expect(liegtImZahlenraum(lauf.zahl)).toBe(true);
    }
    expect(lauf.punkte).toBe(5000);
  });
});
