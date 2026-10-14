export const NAME_MAX_LAENGE = 20;

// Liefert den bereinigten Namen oder null, wenn er nicht erlaubt ist
export function pruefeName(eingabe: string): string | null {
  const name = eingabe.trim();
  const laenge = Array.from(name).length;
  return laenge >= 1 && laenge <= NAME_MAX_LAENGE ? name : null;
}
