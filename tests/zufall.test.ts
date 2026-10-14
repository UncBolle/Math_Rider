import { describe, expect, it } from "vitest";
import { erzeugeTestZufall } from "./hilfen/zufall";

describe("T2: Zufallsquelle für Tests", () => {
  it("liefert bei gleichem Startwert die gleiche Zahlenfolge", () => {
    const a = erzeugeTestZufall(42);
    const b = erzeugeTestZufall(42);
    for (let i = 0; i < 1000; i++) {
      expect(a()).toBe(b());
    }
  });

  it("liefert bei anderem Startwert eine andere Zahlenfolge", () => {
    const a = erzeugeTestZufall(1);
    const b = erzeugeTestZufall(2);
    const folgeA = Array.from({ length: 10 }, () => a());
    const folgeB = Array.from({ length: 10 }, () => b());
    expect(folgeA).not.toEqual(folgeB);
  });

  it("liefert nur Werte in [0, 1)", () => {
    const zufall = erzeugeTestZufall(7);
    for (let i = 0; i < 10000; i++) {
      const wert = zufall();
      expect(wert).toBeGreaterThanOrEqual(0);
      expect(wert).toBeLessThan(1);
    }
  });
});
