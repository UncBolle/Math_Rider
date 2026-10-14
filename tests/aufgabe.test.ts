import { describe, expect, it } from "vitest";
import { erzeugeAufgabe, type Aufgabe } from "../src/logik/aufgabe";
import { erzeugeTestZufall } from "./hilfen/zufall";

function vieleAufgaben(zahl: number, aufgabenNummer: number, anzahl: number, startwert = 1): Aufgabe[] {
  const zufall = erzeugeTestZufall(startwert);
  return Array.from({ length: anzahl }, () => erzeugeAufgabe(zahl, aufgabenNummer, zufall));
}

function alleKombinationen(): Aufgabe[] {
  const aufgaben: Aufgabe[] = [];
  for (let zahl = 1; zahl <= 100; zahl++) {
    for (let nummer = 1; nummer <= 10; nummer++) {
      aufgaben.push(...vieleAufgaben(zahl, nummer, 50, zahl * 100 + nummer));
    }
  }
  return aufgaben;
}

describe("T4: Aufgabe erzeugen", () => {
  it("A-01: Ergebnis liegt immer in 1 bis 100", () => {
    for (const aufgabe of alleKombinationen()) {
      expect(aufgabe.loesung).toBeGreaterThanOrEqual(1);
      expect(aufgabe.loesung).toBeLessThanOrEqual(100);
    }
  });

  it("A-02: Aufgabenzahl ist ganz und liegt in 1 bis 20", () => {
    for (const aufgabe of alleKombinationen()) {
      expect(Number.isInteger(aufgabe.aufgabenzahl)).toBe(true);
      expect(aufgabe.aufgabenzahl).toBeGreaterThanOrEqual(1);
      expect(aufgabe.aufgabenzahl).toBeLessThanOrEqual(20);
    }
  });

  it("A-03: in Aufgabe 1 bis 5 ist die Aufgabenzahl höchstens 10", () => {
    for (let nummer = 1; nummer <= 5; nummer++) {
      for (let zahl = 1; zahl <= 100; zahl++) {
        for (const aufgabe of vieleAufgaben(zahl, nummer, 50, zahl * 10 + nummer)) {
          expect(aufgabe.aufgabenzahl).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it("A-04: ab Aufgabe 6 kommen bei Zahl 50 Aufgabenzahlen über 10 vor, auch 20", () => {
    const zahlen = vieleAufgaben(50, 6, 2000).map((a) => a.aufgabenzahl);
    expect(zahlen.some((z) => z > 10)).toBe(true);
    expect(zahlen).toContain(20);
  });

  it("A-05: bei Zahl 100 kommt immer Minus", () => {
    for (const aufgabe of vieleAufgaben(100, 6, 1000)) {
      expect(aufgabe.rechenart).toBe("minus");
    }
  });

  it("A-06: bei Zahl 1 kommt immer Plus", () => {
    for (const aufgabe of vieleAufgaben(1, 6, 1000)) {
      expect(aufgabe.rechenart).toBe("plus");
    }
  });

  it("A-07: bei Zahl 50 kommen Plus und Minus je etwa zur Hälfte", () => {
    const aufgaben = vieleAufgaben(50, 6, 2000);
    const anteilPlus = aufgaben.filter((a) => a.rechenart === "plus").length / aufgaben.length;
    expect(anteilPlus).toBeGreaterThan(0.4);
    expect(anteilPlus).toBeLessThan(0.6);
  });

  it("A-08: bei Zahl 95 haben Plus-Aufgaben höchstens 5 als Aufgabenzahl", () => {
    const plusAufgaben = vieleAufgaben(95, 6, 2000).filter((a) => a.rechenart === "plus");
    expect(plusAufgaben.length).toBeGreaterThan(0);
    for (const aufgabe of plusAufgaben) {
      expect(aufgabe.aufgabenzahl).toBeLessThanOrEqual(5);
    }
  });

  it("A-09: richtige Lösung ist Zahl plus bzw. minus Aufgabenzahl", () => {
    for (const aufgabe of alleKombinationen()) {
      const erwartet =
        aufgabe.rechenart === "plus"
          ? aufgabe.ausgangszahl + aufgabe.aufgabenzahl
          : aufgabe.ausgangszahl - aufgabe.aufgabenzahl;
      expect(aufgabe.loesung).toBe(erwartet);
    }
  });

  it("merkt sich die Ausgangszahl", () => {
    expect(erzeugeAufgabe(37, 1, erzeugeTestZufall(3)).ausgangszahl).toBe(37);
  });

  it("lehnt Zahlen außerhalb von 1 bis 100 und ungültige Aufgabennummern ab", () => {
    const zufall = erzeugeTestZufall(4);
    expect(() => erzeugeAufgabe(0, 1, zufall)).toThrow();
    expect(() => erzeugeAufgabe(101, 1, zufall)).toThrow();
    expect(() => erzeugeAufgabe(2.5, 1, zufall)).toThrow();
    expect(() => erzeugeAufgabe(50, 0, zufall)).toThrow();
  });
});
