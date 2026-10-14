// Liefert eine Zahl in [0, 1), wie Math.random. Im Spiel ist es Math.random,
// in Tests ein Generator mit festem Startwert.
export type Zufall = () => number;

// Ganze Zahl von min bis max (beide eingeschlossen), gleichverteilt
export function ganzeZahl(zufall: Zufall, min: number, max: number): number {
  return min + Math.floor(zufall() * (max - min + 1));
}
