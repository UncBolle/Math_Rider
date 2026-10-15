import { element } from "./hilfen";
import type { Toene } from "./toene";

// Lautsprecher mit Schallwellen bzw. durchgestrichen
const LAUT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const STUMM = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

// Gut sichtbarer Knopf zum Stummschalten; die Wahl bleibt gespeichert
export function tonKnopf(toene: Toene, signal: AbortSignal): HTMLButtonElement {
  const knopf = element("button", "pille ton-knopf");
  knopf.type = "button";
  const zeige = () => {
    const stumm = toene.istStumm();
    knopf.innerHTML = stumm ? STUMM : LAUT;
    knopf.classList.toggle("stumm", stumm);
    knopf.setAttribute("aria-label", stumm ? "Ton einschalten" : "Ton ausschalten");
  };
  knopf.addEventListener(
    "click",
    (ereignis) => {
      ereignis.stopPropagation();
      toene.umschalten();
      zeige();
      knopf.blur();
    },
    { signal },
  );
  zeige();
  return knopf;
}
