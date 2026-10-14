import { describe, expect, it } from "vitest";
import {
  HORIZONT_Y,
  projiziere,
  RUHE_TIEFE,
  RUHE_Y,
  skalaBei,
  tiefeFuerY,
} from "../src/ansicht/perspektive";

describe("Perspektive der Strecke", () => {
  it("Tiefe 0 liegt an der Unterkante der Bühne, in voller Größe", () => {
    expect(projiziere(0).y).toBeCloseTo(720);
    expect(projiziere(0).faktor).toBeCloseTo(1);
  });

  it("weit entfernte Punkte nähern sich dem Horizont", () => {
    expect(projiziere(1e9).y).toBeCloseTo(HORIZONT_Y, 1);
  });

  it("je tiefer, desto höher auf dem Bildschirm und desto kleiner", () => {
    let vorher = projiziere(0);
    for (let tiefe = 100; tiefe <= 20000; tiefe += 100) {
      const jetzt = projiziere(tiefe);
      expect(jetzt.y).toBeLessThan(vorher.y);
      expect(jetzt.faktor).toBeLessThan(vorher.faktor);
      vorher = jetzt;
    }
  });

  it("tiefeFuerY ist die Umkehrung von projiziere", () => {
    for (const y of [200, 300, RUHE_Y, 500, 650, 720]) {
      expect(projiziere(tiefeFuerY(y)).y).toBeCloseTo(y);
    }
  });

  it("Hindernisse halten auf Höhe RUHE_Y in Originalgröße", () => {
    expect(projiziere(RUHE_TIEFE).y).toBeCloseTo(RUHE_Y);
    expect(skalaBei(RUHE_TIEFE)).toBeCloseTo(1);
  });

  it("seitliche Abstände schrumpfen mit der Tiefe", () => {
    const nah = projiziere(0, 300);
    const fern = projiziere(5000, 300);
    expect(nah.x - 640).toBeCloseTo(300);
    expect(fern.x - 640).toBeLessThan(300);
    expect(fern.x - 640).toBeGreaterThan(0);
  });
});
