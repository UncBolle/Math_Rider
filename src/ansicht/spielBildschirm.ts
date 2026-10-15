import type { Seite } from "../logik/anordnung";
import { waehleLoesung, type Lauf } from "../logik/lauf";
import type { Zufall } from "../logik/zufall";
import { FIGUR_THEMA } from "./grafiken";
import { dauer, element, warte } from "./hilfen";
import { baueMaerchenwald } from "./maerchenwald3d";
import { tonKnopf } from "./tonKnopf";
import type { Toene } from "./toene";
import { erstelleWelt, ENDE_Z, RUHE_Z, SPUR_X, verlauf, type Anker } from "./welt3d";
import { baueWeltraum } from "./weltraum3d";

// Bis hierhin rückt das Hindernis vor, wenn die Figur in die falsche Lösung fährt
const AUFPRALL_Z = -0.6;

export function zeigeSpielBildschirm(
  buehne: HTMLElement,
  start: Lauf,
  zufall: Zufall,
  signal: AbortSignal,
  ende: (lauf: Lauf) => void,
  toene: Toene,
): void {
  let lauf = start;
  // Gesperrt, solange sich etwas bewegt: nur die erste Wahl zählt
  let gesperrt = true;
  let zahlAnker: Anker = { x: 640, y: 560, skala: 1, sichtbar: true };

  const thema = FIGUR_THEMA[lauf.figur];
  const szene = element("div", `bildschirm szene thema-${thema}`);
  const welt = erstelleWelt(signal);

  const anzeige = element("div", "anzeige");
  const punkteAnzeige = element("span", "pille punkte-pille");
  anzeige.append(punkteAnzeige, tonKnopf(toene, signal), element("span", "pille", lauf.name));

  const zahl = element("div", "zahl schwebend");
  const schild = element("div", "aufgabe schwebend");
  const knoepfe = { links: loesungsKnopf("links"), rechts: loesungsKnopf("rechts") };

  const laden = element("div", "laden");
  const ladeText = element("p", undefined, thema === "weltraum" ? "Die Rakete wird startklar gemacht …" : "Der Zauberwald erwacht …");
  const ladeBalken = element("div", "ladebalken");
  const ladeFuellung = element("div");
  ladeBalken.append(ladeFuellung);
  laden.append(ladeText, ladeBalken);

  szene.append(welt.canvas, schild, knoepfe.links, knoepfe.rechts, zahl, anzeige, laden);
  buehne.replaceChildren(szene);

  function loesungsKnopf(seite: Seite) {
    const knopf = element("button", `loesung schwebend ${seite}`);
    knopf.type = "button";
    knopf.addEventListener("click", () => void waehle(seite), { signal });
    return knopf;
  }

  // Hängt ein HTML-Element an einen Punkt der 3D-Welt
  function setze(el: HTMLElement, anker: Anker, mitSkala: boolean) {
    if (!anker.sichtbar) {
      el.style.visibility = "hidden";
      return;
    }
    const skala = mitSkala ? Math.min(2.6, anker.skala) : 1;
    el.style.visibility = "visible";
    el.style.transform = `translate(${anker.x}px, ${anker.y}px) translate(-50%, -50%) scale(${skala})`;
    el.style.opacity = mitSkala ? String(Math.min(1, Math.max(0, (anker.skala - 0.12) / 0.25))) : "1";
  }

  welt.proBild((punkte) => {
    setze(knoepfe.links, punkte.links, true);
    setze(knoepfe.rechts, punkte.rechts, true);
    setze(schild, punkte.schild, true);
    setze(zahl, punkte.zahl, false);
    zahlAnker = punkte.zahl;
  });

  const zeigeStand = () => {
    zahl.textContent = String(lauf.zahl);
    punkteAnzeige.textContent = `★ ${lauf.punkte}`;
  };

  async function neueRunde() {
    const { aufgabe, anordnung, hindernis } = lauf.runde;
    schild.textContent = `${aufgabe.rechenart === "plus" ? "+" : "−"} ${aufgabe.aufgabenzahl}`;
    knoepfe.links.textContent = String(anordnung.links);
    knoepfe.rechts.textContent = String(anordnung.rechts);
    for (const knopf of Object.values(knoepfe)) knopf.classList.remove("richtig", "falsch", "gewaehlt");
    welt.neueRunde(hindernis);
    await welt.fahre(RUHE_Z, 2400, verlauf.bremsen);
    gesperrt = false;
  }

  async function waehle(seite: Seite) {
    if (gesperrt || signal.aborted) return;
    gesperrt = true;
    toene.wecke();

    lauf = waehleLoesung(lauf, seite, zufall);
    knoepfe[seite].classList.add("gewaehlt");
    await welt.weiche(seite === "links" ? -SPUR_X : SPUR_X, 450);

    if (lauf.ausgeschieden) {
      await ausscheiden(seite);
      return;
    }

    // Richtig: Die Figur fliegt bzw. reitet durch die Lösung, das Hindernis zieht vorbei
    knoepfe[seite].classList.add("richtig");
    welt.markiere(seite, "richtig");
    toene.richtig();
    const vorbei = welt.fahre(ENDE_Z, 1000, verlauf.beschleunigen);
    void warte(560).then(() => {
      funken(zahlAnker.x, zahlAnker.y - 40, ["#ffe14d", "#4dff9a", "#ffffff"], 22);
      plusEins(zahlAnker.x, zahlAnker.y - 90);
    });
    await vorbei;
    welt.entferneRunde();
    zeigeStand();
    void zahl.animate([{ scale: "1.5" }, { scale: "1" }], { duration: dauer(400), easing: "ease-out" });
    await welt.weiche(0, 450);
    if (!signal.aborted) await neueRunde();
  }

  async function ausscheiden(seite: Seite) {
    const richtigeSeite = lauf.runde.anordnung.richtigeSeite;
    knoepfe[seite].classList.add("falsch");
    knoepfe[richtigeSeite].classList.add("richtig");
    welt.markiere(seite, "falsch");
    toene.falsch();
    welt.markiere(richtigeSeite, "richtig");

    await welt.fahre(AUFPRALL_Z, 700, verlauf.beschleunigen);
    funken(zahlAnker.x, zahlAnker.y, ["#ff4d6a", "#ff9a3d", "#ffffff"], 26);
    szene.classList.add("wackeln");
    await welt.sturz();

    const meldung = element("div", "meldung");
    meldung.append(
      element("span", undefined, "Knapp daneben! Richtig war "),
      element("strong", undefined, String(lauf.runde.aufgabe.loesung)),
    );
    szene.append(meldung);
    await warte(2200);
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
      const weite = 80 + Math.random() * 110;
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

  function plusEins(x: number, y: number) {
    const text = element("div", "plus-eins", "+1");
    text.style.left = `${x}px`;
    text.style.top = `${y}px`;
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

  const bauen = thema === "weltraum" ? baueWeltraum : baueMaerchenwald;
  bauen(welt.szene, (anteil) => (ladeFuellung.style.width = `${Math.round(anteil * 100)}%`))
    .then((themaSzene) => {
      if (signal.aborted) return;
      welt.setzeThema(themaSzene);
      zeigeStand();
      laden.classList.add("weg");
      setTimeout(() => laden.remove(), 600);
      void neueRunde();
    })
    .catch((fehler: unknown) => {
      ladeText.textContent = "Oh, die Welt konnte nicht geladen werden. Lade die Seite bitte neu.";
      console.error(fehler);
    });
}
