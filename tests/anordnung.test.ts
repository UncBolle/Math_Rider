import { describe, expect, it } from "vitest";
import { andereSeite, ordneLoesungenAn } from "../src/logik/anordnung";
import { erzeugeTestZufall } from "./hilfen/zufall";

describe("T6: Lösungen anordnen", () => {
  it("L-01: richtige Lösung steht links und rechts je etwa zur Hälfte", () => {
    const zufall = erzeugeTestZufall(6);
    let links = 0;
    for (let i = 0; i < 2000; i++) {
      if (ordneLoesungenAn(17, 38, zufall).richtigeSeite === "links") links++;
    }
    expect(links / 2000).toBeGreaterThan(0.4);
    expect(links / 2000).toBeLessThan(0.6);
  });

  it("L-02: genau eine Seite ist richtig, beide Seiten zeigen verschiedene Zahlen", () => {
    const zufall = erzeugeTestZufall(7);
    for (let i = 0; i < 1000; i++) {
      const anordnung = ordneLoesungenAn(17, 38, zufall);
      expect(anordnung.links).not.toBe(anordnung.rechts);
      expect(anordnung[anordnung.richtigeSeite]).toBe(17);
      expect(anordnung[andereSeite(anordnung.richtigeSeite)]).toBe(38);
    }
  });
});
