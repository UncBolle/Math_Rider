import type { Seite } from "../logik/anordnung";
import { waehleLoesung, type Lauf, type Runde } from "../logik/lauf";
import type { Zufall } from "../logik/zufall";
import { FIGUR_BILD, FIGUR_THEMA, HINDERNIS_BILD, HINDERNIS_NAME } from "./grafiken";
import { bewege, dauer, element, warte } from "./hilfen";
import { erstelleKulisse, verlauf } from "./kulisse";
import { projiziere, RUHE_TIEFE, skalaBei, tiefeFuerY } from "./perspektive";

// Abstand, um den die Figur zur Seite ausweicht (Mitte einer Lösung minus Mitte der Bühne)
const AUSWEICHEN = 300;
// Tiefe, in der ein neues Hindernis am Horizont auftaucht
const START_TIEFE = 9000;
// Bis hierhin zieht ein Hindernis nach einer richtigen Antwort an der Figur vorbei
const ENDE_TIEFE = -700;
// Linie innerhalb der Hindernis-Gruppe, auf der das Hindernis den Boden berührt
const GRUPPE_BODEN = 300;

interface Gruppe {
  el: HTMLElement;
  links: HTMLButtonElement;
  rechts: HTMLButtonElement;
}

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
  let gruppe: Gruppe;

  const thema = FIGUR_THEMA[lauf.figur];
  const szene = element("div", `bildschirm szene thema-${thema}`);
  const kulisse = erstelleKulisse(thema, signal);

  const anzeige = element("div", "anzeige");
  const punkteAnzeige = element("span", "pille punkte-pille");
  anzeige.append(punkteAnzeige, element("span", "pille", lauf.name));

  const figur = element("div", `figur figur-${lauf.figur}`);
  const koerper = element("div", "figur-koerper");
  const figurBild = element("img");
  figurBild.src = FIGUR_BILD[lauf.figur];
  figurBild.alt = "";
  const zahl = element("div", "zahl");
  koerper.append(figurBild, zahl);
  if (lauf.figur === "rakete") koerper.prepend(element("div", "flamme"));
  figur.append(element("div", "figur-schatten"), koerper);

  szene.append(kulisse.canvas, anzeige, figur);
  buehne.replaceChildren(szene);

  const zeigeStand = () => {
    zahl.textContent = String(lauf.zahl);
    punkteAnzeige.textContent = `★ ${lauf.punkte}`;
  };

  function baueGruppe(runde: Runde): Gruppe {
    const el = element("div", "hindernis-gruppe");
    const { aufgabe, anordnung } = runde;
    const zeichen = aufgabe.rechenart === "plus" ? "+" : "−";
    const bild = element("img", "hindernis");
    bild.src = HINDERNIS_BILD[runde.hindernis];
    bild.alt = HINDERNIS_NAME[runde.hindernis] ?? "";
    const schild = element("div", "aufgabe", `${zeichen} ${aufgabe.aufgabenzahl}`);
    const links = loesungsKnopf("links", anordnung.links);
    const rechts = loesungsKnopf("rechts", anordnung.rechts);
    el.append(bild, links, rechts, schild);
    return { el, links, rechts };
  }

  function loesungsKnopf(seite: Seite, wert: number) {
    const knopf = element("button", `loesung ${seite}`, String(wert));
    knopf.type = "button";
    knopf.addEventListener("click", () => void waehle(seite), { signal });
    return knopf;
  }

  // Stellt die Gruppe so dar, als stünde sie in dieser Tiefe auf der Strecke
  function setzeTiefe(el: HTMLElement, tiefe: number) {
    const { y } = projiziere(tiefe);
    el.style.transform = `translateY(${y - GRUPPE_BODEN}px) scale(${skalaBei(tiefe)})`;
    el.style.opacity = String(Math.min(1, Math.max(0, (START_TIEFE - tiefe) / 1500)));
  }

  function fahreGruppe(von: number, bis: number, ms: number, verlaufFn: (t: number) => number) {
    return kulisse.fahre(von - bis, ms, verlaufFn, (gefahren) => setzeTiefe(gruppe.el, von - gefahren));
  }

  async function neueRunde() {
    gruppe = baueGruppe(lauf.runde);
    setzeTiefe(gruppe.el, START_TIEFE);
    szene.insertBefore(gruppe.el, figur);
    figur.classList.add("in-fahrt");
    await fahreGruppe(START_TIEFE, RUHE_TIEFE, 1500, verlauf.bremsen);
    figur.classList.remove("in-fahrt");
    gesperrt = false;
  }

  async function waehle(seite: Seite) {
    if (gesperrt || signal.aborted) return;
    gesperrt = true;

    lauf = waehleLoesung(lauf, seite, zufall);
    const versatz = seite === "links" ? -AUSWEICHEN : AUSWEICHEN;
    gruppe[seite].classList.add("gewaehlt");
    await bewege(figur, [{ transform: "translateX(0)" }, { transform: `translateX(${versatz}px)` }], 320);

    if (lauf.ausgeschieden) {
      await ausscheiden(seite, versatz);
      return;
    }

    // Richtig: Die Figur fährt durch die Lösung, das Hindernis zieht vorbei
    gruppe[seite].classList.add("richtig");
    funken(640 + versatz, 470, ["#ffe14d", "#4dff9a", "#ffffff"], 18);
    plusEins(640 + versatz);
    figur.classList.add("in-fahrt");
    await fahreGruppe(RUHE_TIEFE, ENDE_TIEFE, 700, verlauf.beschleunigen);
    gruppe.el.remove();
    zeigeStand();
    void zahl.animate([{ transform: "scale(1.5)" }, { transform: "scale(1)" }], { duration: dauer(400), easing: "ease-out" });
    await bewege(figur, [{ transform: `translateX(${versatz}px)` }, { transform: "translateX(0)" }], 320);
    figur.getAnimations().forEach((animation) => animation.cancel());
    if (!signal.aborted) await neueRunde();
  }

  async function ausscheiden(seite: Seite, versatz: number) {
    gruppe[seite].classList.add("falsch");
    gruppe[lauf.runde.anordnung.richtigeSeite].classList.add("richtig");

    // Die Lösung kommt auf die Figur zu, die Figur purzelt
    await fahreGruppe(RUHE_TIEFE, tiefeFuerY(520), 420, verlauf.beschleunigen);
    funken(640 + versatz, 560, ["#ff4d6a", "#ff9a3d", "#ffffff"], 24);
    szene.classList.add("wackeln");
    await bewege(
      figur,
      [
        { transform: `translateX(${versatz}px) rotate(0deg)` },
        { transform: `translateX(${versatz - 24}px) rotate(-24deg)` },
        { transform: `translateX(${versatz + 24}px) rotate(24deg)` },
        { transform: `translateX(${versatz}px) translateY(50px) rotate(180deg) scale(0.8)`, opacity: 0.5 },
      ],
      900,
    );

    const meldung = element("div", "meldung");
    meldung.append(
      element("span", undefined, "Knapp daneben! Richtig war "),
      element("strong", undefined, String(lauf.runde.aufgabe.loesung)),
    );
    szene.append(meldung);
    await warte(2000);
    if (!signal.aborted) ende(lauf);
  }

  // Kleine Lichtfunken, die von einem Punkt aus wegfliegen
  function funken(x: number, y: number, farben: string[], anzahl: number) {
    for (let i = 0; i < anzahl; i++) {
      const funke = element("div", "funke");
      funke.style.left = `${x}px`;
      funke.style.top = `${y}px`;
      funke.style.background = farben[i % farben.length];
      funke.style.color = farben[i % farben.length];
      szene.append(funke);
      const winkel = (i / anzahl) * Math.PI * 2 + Math.random() * 0.4;
      const weite = 80 + Math.random() * 90;
      funke
        .animate(
          [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            {
              transform: `translate(calc(-50% + ${Math.cos(winkel) * weite}px), calc(-50% + ${Math.sin(winkel) * weite}px)) scale(0.2)`,
              opacity: 0,
            },
          ],
          { duration: dauer(700 + Math.random() * 300), easing: "cubic-bezier(.2,.7,.3,1)" },
        )
        .finished.then(() => funke.remove(), () => funke.remove());
    }
  }

  function plusEins(x: number) {
    const text = element("div", "plus-eins", "+1");
    text.style.left = `${x}px`;
    szene.append(text);
    text
      .animate(
        [
          { transform: "translate(-50%, 0) scale(0.6)", opacity: 0 },
          { transform: "translate(-50%, -40px) scale(1.2)", opacity: 1, offset: 0.3 },
          { transform: "translate(-50%, -110px) scale(1)", opacity: 0 },
        ],
        { duration: dauer(1000), easing: "ease-out" },
      )
      .finished.then(() => text.remove(), () => text.remove());
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
