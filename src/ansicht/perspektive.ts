// Perspektive der Strecke: eine ebene Fläche, die zum Horizont hin kippt.
// Kulisse (Canvas) und Hindernisse (DOM) rechnen beide hiermit, damit sie zusammenpassen.
// „Tiefe“ ist der Abstand entlang der Strecke: 0 an der Unterkante der Bühne, größer = weiter weg.

const BRENNWEITE = 900;
const NEIGUNG = (62 * Math.PI) / 180;
const MITTE_X = 640;
const UNTERKANTE_Y = 720;

export const HORIZONT_Y = 175;
// Hier halten die Hindernisse an
export const RUHE_Y = 355;

const BLICK_Y = HORIZONT_Y + BRENNWEITE / Math.tan(NEIGUNG);
const SIN = Math.sin(NEIGUNG);
const COS = Math.cos(NEIGUNG);

export interface Punkt {
  x: number;
  y: number;
  // Verkleinerung gegenüber der Unterkante (1 bei Tiefe 0)
  faktor: number;
}

// Bildschirmpunkt eines Bodenpunkts; seitlich: Abstand von der Mitte der Strecke
export function projiziere(tiefe: number, seitlich = 0): Punkt {
  const faktor = BRENNWEITE / (BRENNWEITE + tiefe * SIN);
  return {
    x: MITTE_X + seitlich * faktor,
    y: BLICK_Y + (UNTERKANTE_Y - tiefe * COS - BLICK_Y) * faktor,
    faktor,
  };
}

// Tiefe, in der ein Bodenpunkt auf Bildschirmhöhe y liegt (y unterhalb des Horizonts)
export function tiefeFuerY(y: number): number {
  return (BRENNWEITE * (UNTERKANTE_Y - y)) / ((y - BLICK_Y) * SIN + COS * BRENNWEITE);
}

export const RUHE_TIEFE = tiefeFuerY(RUHE_Y);
const RUHE_FAKTOR = projiziere(RUHE_TIEFE).faktor;

// Größe eines Hindernisses in dieser Tiefe; 1 dort, wo es anhält
export function skalaBei(tiefe: number): number {
  return projiziere(tiefe).faktor / RUHE_FAKTOR;
}
