import { NAME_MAX_LAENGE, pruefeName } from "../logik/name";
import { element } from "./hilfen";

export function zeigeNameBildschirm(
  buehne: HTMLElement,
  letzterName: string,
  weiter: (name: string) => void,
): void {
  const bildschirm = element("div", "bildschirm menue start");
  const titel = element("h1", "titel", "Math Rider");

  const formular = element("form", "glas");
  formular.noValidate = true;
  const beschriftung = element("label", undefined, "Wie heißt du?");
  const eingabe = element("input");
  eingabe.id = "name";
  beschriftung.htmlFor = "name";
  eingabe.type = "text";
  eingabe.maxLength = NAME_MAX_LAENGE;
  eingabe.autocomplete = "off";
  eingabe.spellcheck = false;
  eingabe.enterKeyHint = "go";
  eingabe.value = letzterName;
  const hinweis = element("p", "hinweis");
  const knopf = element("button", "knopf", "Los geht's!");
  knopf.type = "submit";

  formular.append(beschriftung, eingabe, hinweis, knopf);
  bildschirm.append(titel, formular);
  buehne.replaceChildren(bildschirm);

  eingabe.addEventListener("input", () => (hinweis.textContent = ""));
  formular.addEventListener("submit", (ereignis) => {
    ereignis.preventDefault();
    const name = pruefeName(eingabe.value);
    if (name === null) {
      hinweis.textContent = "Schreib bitte deinen Namen hinein.";
      eingabe.focus();
      return;
    }
    eingabe.blur();
    weiter(name);
  });

  eingabe.focus();
}
