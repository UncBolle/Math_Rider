// Feste Spielfläche im Querformat, die in jedes Fenster eingepasst wird.
// Alle Bildschirme rechnen in diesen Punkten, egal wie groß das Gerät ist.
export const BUEHNE_BREITE = 1280;
export const BUEHNE_HOEHE = 720;

export function erstelleBuehne(wurzel: HTMLElement): HTMLElement {
  const buehne = document.createElement("div");
  buehne.className = "buehne";
  wurzel.replaceChildren(buehne);

  const passeAn = () => {
    const breite = window.innerWidth;
    const hoehe = window.innerHeight;
    const skala = Math.min(breite / BUEHNE_BREITE, hoehe / BUEHNE_HOEHE);
    const links = (breite - BUEHNE_BREITE * skala) / 2;
    const oben = (hoehe - BUEHNE_HOEHE * skala) / 2;
    buehne.style.transform = `translate(${links}px, ${oben}px) scale(${skala})`;
  };

  passeAn();
  window.addEventListener("resize", passeAn);
  window.visualViewport?.addEventListener("resize", passeAn);
  return buehne;
}
