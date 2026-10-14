import { describe, expect, it } from "vitest";
import { erzeugeStartzahl } from "../src/logik/startzahl";
import { erzeugeTestZufall } from "./hilfen/zufall";

describe("T3: Startzahl", () => {
  it("S-01: jede Startzahl ist eine ganze Zahl von 1 bis 10", () => {
    const zufall = erzeugeTestZufall(1);
    for (let i = 0; i < 1000; i++) {
      const zahl = erzeugeStartzahl(zufall);
      expect(Number.isInteger(zahl)).toBe(true);
      expect(zahl).toBeGreaterThanOrEqual(1);
      expect(zahl).toBeLessThanOrEqual(10);
    }
  });

  it("S-02: jeder Wert von 1 bis 10 kommt vor", () => {
    const zufall = erzeugeTestZufall(2);
    const gesehen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      gesehen.add(erzeugeStartzahl(zufall));
    }
    expect([...gesehen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});
