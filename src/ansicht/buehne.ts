// Feste Spielfläche im Querformat, die in jedes Fenster eingepasst wird.
// Alle Bildschirme rechnen in diesen Punkten, egal wie groß das Gerät ist.
export const BUEHNE_BREITE = 1280;
export const BUEHNE_HOEHE = 720;

// Wie stark die Bühne gerade vergrößert (> 1) oder verkleinert (< 1) dargestellt wird
export function buehnenSkala(): number {
  return Math.min(window.innerWidth / BUEHNE_BREITE, window.innerHeight / BUEHNE_HOEHE);
}

export function erstelleBuehne(wurzel: HTMLElement): HTMLElement {
  const buehne = document.createElement("div");
  buehne.className = "buehne";
  wurzel.replaceChildren(buehne);

  const passeAn = () => {
    const skala = buehnenSkala();
    const links = (window.innerWidth - BUEHNE_BREITE * skala) / 2;
    const oben = (window.innerHeight - BUEHNE_HOEHE * skala) / 2;
    buehne.style.transform = `translate(${links}px, ${oben}px) scale(${skala})`;
  };

  passeAn();
  window.addEventListener("resize", passeAn);
  window.visualViewport?.addEventListener("resize", passeAn);
  return buehne;
}
