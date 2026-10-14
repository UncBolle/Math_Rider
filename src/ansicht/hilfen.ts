// Kleines Werkzeug, um Elemente mit Klasse und Text zu bauen
export function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  klasse?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (klasse) el.className = klasse;
  if (text !== undefined) el.textContent = text;
  return el;
}

const wenigBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Dauer einer Animation; bei „Bewegung reduzieren“ im System deutlich kürzer
export function dauer(ms: number): number {
  return wenigBewegung ? Math.round(ms * 0.3) : ms;
}

// Spielt eine Animation ab und wartet, bis sie fertig ist. Der Endzustand bleibt stehen.
export async function bewege(el: Element, schritte: Keyframe[], ms: number, easing = "ease-in-out"): Promise<void> {
  await el.animate(schritte, { duration: dauer(ms), easing, fill: "forwards" }).finished;
}

export function warte(ms: number): Promise<void> {
  return new Promise((fertig) => setTimeout(fertig, dauer(ms)));
}
