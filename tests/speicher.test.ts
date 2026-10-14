import { describe, expect, it } from "vitest";
import type { Eintrag } from "../src/logik/bestenliste";
import {
  ladeBestenliste,
  ladeName,
  SCHLUESSEL_BESTENLISTE,
  speichereBestenliste,
  speichereName,
  standardSpeicher,
  type Speicher,
} from "../src/logik/speicher";

function testSpeicher(daten: Record<string, string> = {}): Speicher {
  const inhalt = new Map(Object.entries(daten));
  return {
    getItem: (schluessel) => inhalt.get(schluessel) ?? null,
    setItem: (schluessel, wert) => void inhalt.set(schluessel, wert),
  };
}

const kaputterSpeicher: Speicher = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
};

const liste: Eintrag[] = [
  { name: "Mia", figur: "prinzessin", punkte: 12 },
  { name: "Ben", figur: "rakete", punkte: 7 },
];

describe("T10: Speichern im Browser", () => {
  it("D-01: gespeicherter Name und Bestenliste werden gleich wieder geladen", () => {
    const speicher = testSpeicher();
    speichereName(speicher, "Jürgen");
    speichereBestenliste(speicher, liste);
    expect(ladeName(speicher)).toBe("Jürgen");
    expect(ladeBestenliste(speicher)).toEqual(liste);
  });

  it("D-02: kaputte Daten ergeben eine leere Bestenliste", () => {
    for (const kaputt of [
      "kein json",
      "{}",
      "null",
      '[{"name":"Mia"}]',
      '[{"name":"Mia","figur":"drache","punkte":3}]',
      '[{"name":"Mia","figur":"rakete","punkte":-1}]',
      '[{"name":"Mia","figur":"rakete","punkte":2.5}]',
      '[{"name":"","figur":"rakete","punkte":3}]',
    ]) {
      const speicher = testSpeicher({ [SCHLUESSEL_BESTENLISTE]: kaputt });
      expect(ladeBestenliste(speicher), kaputt).toEqual([]);
    }
  });

  it("D-02: eine unsortierte oder zu lange Liste wird sortiert und gekürzt", () => {
    const lang = Array.from({ length: 12 }, (_, i) => ({ name: `Kind${i}`, figur: "rakete", punkte: i + 1 }));
    const speicher = testSpeicher({ [SCHLUESSEL_BESTENLISTE]: JSON.stringify(lang) });
    const geladen = ladeBestenliste(speicher);
    expect(geladen.map((e) => e.punkte)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
  });

  it("D-03: wirft der Speicher Fehler, läuft alles ohne Speichern weiter", () => {
    expect(() => speichereName(kaputterSpeicher, "Lena")).not.toThrow();
    expect(() => speichereBestenliste(kaputterSpeicher, liste)).not.toThrow();
    expect(ladeName(kaputterSpeicher)).toBe("");
    expect(ladeBestenliste(kaputterSpeicher)).toEqual([]);
  });

  it("D-03: ohne Speicher (null) läuft alles ohne Speichern weiter", () => {
    expect(() => speichereName(null, "Lena")).not.toThrow();
    expect(ladeName(null)).toBe("");
    expect(ladeBestenliste(null)).toEqual([]);
  });

  it("D-03: ohne Browser liefert standardSpeicher null statt eines Fehlers", () => {
    expect(standardSpeicher()).toBeNull();
  });

  it("D-04: beim ersten Besuch sind Name und Bestenliste leer", () => {
    const speicher = testSpeicher();
    expect(ladeName(speicher)).toBe("");
    expect(ladeBestenliste(speicher)).toEqual([]);
  });
});
