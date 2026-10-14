import type { Zufall } from "../../src/logik/zufall";

// Mulberry32: klein, schnell und bei gleichem Startwert immer gleich
export function erzeugeTestZufall(startwert: number): Zufall {
  let zustand = startwert >>> 0;
  return () => {
    zustand = (zustand + 0x6d2b79f5) >>> 0;
    let t = zustand;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
