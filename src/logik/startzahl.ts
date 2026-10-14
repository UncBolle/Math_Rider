import { ganzeZahl, type Zufall } from "./zufall";

export const STARTZAHL_MIN = 1;
export const STARTZAHL_MAX = 10;

export function erzeugeStartzahl(zufall: Zufall): number {
  return ganzeZahl(zufall, STARTZAHL_MIN, STARTZAHL_MAX);
}
