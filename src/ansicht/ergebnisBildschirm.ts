import type { Eintrag } from "../logik/bestenliste";
import { FIGUR_BILD, FIGUR_NAME } from "./grafiken";
import { element } from "./hilfen";

export function zeigeErgebnisBildschirm(
  buehne: HTMLElement,
  name: string,
  punkte: number,
  bestenliste: readonly Eintrag[],
  platz: number | null,
  nochmal: () => void,
): void {
  const bildschirm = element("div", "bildschirm menue ergebnis");

  const zusammenfassung = element("div", "glas zusammenfassung");
  const ueberschrift = element("h2", undefined, punkte > 0 ? `Super, ${name}!` : `Fast, ${name}!`);
  const punkteText = element("p", "punkte", punkte === 1 ? "Aufgabe geschafft" : "Aufgaben geschafft");
  punkteText.prepend(element("strong", undefined, String(punkte)));
  const platzText = element("p", "platz", platzMeldung(punkte, platz));
  const knopf = element("button", "knopf", "Nochmal");
  knopf.type = "button";
  knopf.addEventListener("click", nochmal);
  zusammenfassung.append(ueberschrift, punkteText, platzText, knopf);

  bildschirm.append(zusammenfassung, baueBestenliste(bestenliste, platz));
  buehne.replaceChildren(bildschirm);
  knopf.focus();
}

function platzMeldung(punkte: number, platz: number | null): string {
  if (platz === 1) return "Neuer Rekord! Du bist auf Platz 1!";
  if (platz !== null) return `Du bist in der Bestenliste auf Platz ${platz}!`;
  if (punkte === 0) return "Probier es gleich nochmal, du schaffst das!";
  return "Noch ein bisschen üben, dann kommst du in die Bestenliste!";
}

function baueBestenliste(liste: readonly Eintrag[], platz: number | null): HTMLElement {
  const karte = element("div", "glas bestenliste");
  karte.append(element("h3", undefined, "Bestenliste"));

  if (liste.length === 0) {
    karte.append(element("p", "leer", "Noch leer. Der erste Platz wartet auf dich!"));
    return karte;
  }

  const tabelle = element("table");
  liste.forEach((eintrag, index) => {
    const zeile = element("tr", index + 1 === platz ? "neu" : undefined);
    const bild = element("img");
    bild.src = FIGUR_BILD[eintrag.figur];
    bild.alt = FIGUR_NAME[eintrag.figur];
    const figurZelle = element("td");
    figurZelle.append(bild);
    zeile.append(
      element("td", undefined, `${index + 1}.`),
      figurZelle,
      element("td", undefined, eintrag.name),
      element("td", undefined, String(eintrag.punkte)),
    );
    tabelle.append(zeile);
  });
  karte.append(tabelle);
  return karte;
}
