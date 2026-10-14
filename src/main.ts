import "./style.css";
import { erstelleBuehne } from "./ansicht/buehne";
import { zeigeErgebnisBildschirm } from "./ansicht/ergebnisBildschirm";
import { zeigeFigurenBildschirm } from "./ansicht/figurenBildschirm";
import { zeigeNameBildschirm } from "./ansicht/nameBildschirm";
import { zeigeSpielBildschirm } from "./ansicht/spielBildschirm";
import { trageEin } from "./logik/bestenliste";
import { nochmal, starteLauf, type Lauf } from "./logik/lauf";
import {
  ladeBestenliste,
  ladeName,
  speichereBestenliste,
  speichereName,
  standardSpeicher,
} from "./logik/speicher";

const zufall = Math.random;
const speicher = standardSpeicher();
const buehne = erstelleBuehne(document.querySelector<HTMLDivElement>("#app")!);

// Jeder Bildschirm meldet seine Tasten-Ereignisse über dieses Signal an;
// beim Wechsel werden sie alle auf einmal abgemeldet.
let aktuell = new AbortController();
function neuerBildschirm(): AbortSignal {
  aktuell.abort();
  aktuell = new AbortController();
  return aktuell.signal;
}

function nameEingeben() {
  neuerBildschirm();
  zeigeNameBildschirm(buehne, ladeName(speicher), (name) => {
    speichereName(speicher, name);
    figurWaehlen(name);
  });
}

function figurWaehlen(name: string) {
  zeigeFigurenBildschirm(buehne, name, neuerBildschirm(), (figur) => spielen(starteLauf(name, figur, zufall)));
}

function spielen(lauf: Lauf) {
  zeigeSpielBildschirm(buehne, lauf, zufall, neuerBildschirm(), ergebnis);
}

function ergebnis(lauf: Lauf) {
  neuerBildschirm();
  const { liste, platz } = trageEin(ladeBestenliste(speicher), {
    name: lauf.name,
    figur: lauf.figur,
    punkte: lauf.punkte,
  });
  if (platz !== null) speichereBestenliste(speicher, liste);
  zeigeErgebnisBildschirm(buehne, lauf.name, lauf.punkte, liste, platz, () => spielen(nochmal(lauf, zufall)));
}

nameEingeben();
