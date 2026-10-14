import type { Seite } from "../logik/anordnung";
import { waehleLoesung, type Lauf, type Runde } from "../logik/lauf";
import type { Zufall } from "../logik/zufall";
import { FIGUR_BILD, FIGUR_THEMA, HINDERNIS_BILD, HINDERNIS_NAME } from "./grafiken";
import { bewege, element, warte } from "./hilfen";

// Abstand, um den die Figur zur Seite ausweicht (Mitte der Lösung minus Mitte der Bühne)
const AUSWEICHEN = 270;

export function zeigeSpielBildschirm(
  buehne: HTMLElement,
  start: Lauf,
  zufall: Zufall,
  signal: AbortSignal,
  ende: (lauf: Lauf) => void,
): void {
  let lauf = start;
  // Gesperrt, solange sich etwas bewegt: nur die erste Wahl zählt
  let gesperrt = true;

  const szene = element("div", `bildschirm szene thema-${FIGUR_THEMA[lauf.figur]}`);
  const hintergrund = element("div", "hintergrund");
  const anzeige = element("div", "anzeige");
  const punkteAnzeige = element("span");
  anzeige.append(punkteAnzeige, element("span", undefined, lauf.name));

  const figur = element("div", `figur figur-${lauf.figur}`);
  const figurBild = element("img");
  figurBild.src = FIGUR_BILD[lauf.figur];
  figurBild.alt = "";
  const zahl = element("div", "zahl");
  figur.append(figurBild, zahl);

  szene.append(hintergrund, anzeige, figur);
  buehne.replaceChildren(szene);

  let gruppe: ReturnType<typeof baueGruppe>;

  const zeigeStand = () => {
    zahl.textContent = String(lauf.zahl);
    punkteAnzeige.textContent = `Punkte: ${lauf.punkte}`;
  };

  function baueGruppe(runde: Runde) {
    const el = element("div", "hindernis-gruppe");
    const { aufgabe, anordnung } = runde;
    const zeichen = aufgabe.rechenart === "plus" ? "+" : "−";
    const aufgabeEl = element("div", "aufgabe", `${zeichen} ${aufgabe.aufgabenzahl}`);
    const bild = element("img", "hindernis");
    bild.src = HINDERNIS_BILD[runde.hindernis];
    bild.alt = HINDERNIS_NAME[runde.hindernis] ?? "";
    const links = loesungsKnopf("links", anordnung.links);
    const rechts = loesungsKnopf("rechts", anordnung.rechts);
    el.append(bild, aufgabeEl, links, rechts);
    return { el, links, rechts };
  }

  function loesungsKnopf(seite: Seite, wert: number) {
    const knopf = element("button", `loesung ${seite}`, String(wert));
    knopf.type = "button";
    knopf.addEventListener("click", () => void waehle(seite), { signal });
    return knopf;
  }

  async function neueRunde() {
    gruppe = baueGruppe(lauf.runde);
    szene.append(gruppe.el);
    szene.classList.add("in-fahrt");
    await bewege(gruppe.el, [{ transform: "translateY(-560px)" }, { transform: "translateY(0)" }], 900, "ease-out");
    szene.classList.remove("in-fahrt");
    gesperrt = false;
  }

  async function waehle(seite: Seite) {
    if (gesperrt || signal.aborted) return;
    gesperrt = true;

    lauf = waehleLoesung(lauf, seite, zufall);
    const versatz = seite === "links" ? -AUSWEICHEN : AUSWEICHEN;
    await bewege(figur, [{ transform: "translateX(0)" }, { transform: `translateX(${versatz}px)` }], 300);

    if (lauf.ausgeschieden) {
      await ausscheiden(seite);
      return;
    }

    // Richtig: Hindernis zieht vorbei, die Figur trägt die neue Zahl
    gruppe[seite].classList.add("richtig");
    szene.classList.add("in-fahrt");
    await bewege(gruppe.el, [{ transform: "translateY(0)" }, { transform: "translateY(720px)" }], 650, "ease-in");
    gruppe.el.remove();
    zeigeStand();
    await bewege(figur, [{ transform: `translateX(${versatz}px)` }, { transform: "translateX(0)" }], 300);
    figur.getAnimations().forEach((animation) => animation.cancel());
    if (!signal.aborted) await neueRunde();
  }

  async function ausscheiden(seite: Seite) {
    const richtigeSeite = lauf.runde.anordnung.richtigeSeite;
    gruppe[seite].classList.add("falsch");
    gruppe[richtigeSeite].classList.add("richtig");

    // Die Zahl rollt auf die Figur zu, die Figur purzelt
    await bewege(gruppe.el, [{ transform: "translateY(0)" }, { transform: "translateY(230px)" }], 400, "ease-in");
    const versatz = seite === "links" ? -AUSWEICHEN : AUSWEICHEN;
    await bewege(
      figur,
      [
        { transform: `translateX(${versatz}px) rotate(0deg)` },
        { transform: `translateX(${versatz - 20}px) rotate(-20deg)` },
        { transform: `translateX(${versatz + 20}px) rotate(20deg)` },
        { transform: `translateX(${versatz}px) translateY(40px) rotate(160deg)`, opacity: 0.6 },
      ],
      800,
    );

    const meldung = element("div", "meldung", `Knapp daneben! Richtig war ${lauf.runde.aufgabe.loesung}.`);
    szene.append(meldung);
    await warte(1800);
    if (!signal.aborted) ende(lauf);
  }

  window.addEventListener(
    "keydown",
    (ereignis) => {
      if (ereignis.repeat) return;
      if (ereignis.key === "ArrowLeft") void waehle("links");
      if (ereignis.key === "ArrowRight") void waehle("rechts");
    },
    { signal },
  );

  zeigeStand();
  void neueRunde();
}
