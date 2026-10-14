import { FIGUREN, type Figur } from "../logik/figuren";
import { FIGUR_BILD, FIGUR_NAME } from "./grafiken";
import { element } from "./hilfen";

export function zeigeFigurenBildschirm(
  buehne: HTMLElement,
  name: string,
  signal: AbortSignal,
  weiter: (figur: Figur) => void,
): void {
  const bildschirm = element("div", "bildschirm menue figurenwahl");
  const frage = element("h2", undefined, `Hallo ${name}! Wähle deine Figur:`);
  const auswahl = element("div", "auswahl");

  const knoepfe = FIGUREN.map((figur) => {
    const knopf = element("button", `glas wahl-${figur}`);
    knopf.type = "button";
    const bild = element("img");
    bild.src = FIGUR_BILD[figur];
    bild.alt = "";
    knopf.append(bild, element("span", undefined, FIGUR_NAME[figur]));
    knopf.addEventListener("click", () => weiter(figur), { signal });
    return knopf;
  });

  auswahl.append(...knoepfe);
  bildschirm.append(frage, auswahl);
  buehne.replaceChildren(bildschirm);

  // Mit den Pfeiltasten zwischen den Figuren wechseln, Enter wählt
  window.addEventListener(
    "keydown",
    (ereignis) => {
      if (ereignis.key !== "ArrowLeft" && ereignis.key !== "ArrowRight") return;
      knoepfe[ereignis.key === "ArrowLeft" ? 0 : 1].focus();
    },
    { signal },
  );
  knoepfe[0].focus();
}
