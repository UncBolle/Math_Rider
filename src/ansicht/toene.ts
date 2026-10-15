import { ladeStumm, speichereStumm, type Speicher } from "../logik/speicher";

// Leise, freundliche Töne, direkt im Browser erzeugt (keine Tondateien).
// Browser erlauben Ton erst nach einer Berührung oder einem Klick; deshalb wird der
// Audio-Kontext in `wecke()` angelegt, das direkt im Klick-Ereignis aufgerufen wird.

export interface Toene {
  wecke(): void;
  richtig(): void;
  falsch(): void;
  istStumm(): boolean;
  // Schaltet um und liefert den neuen Zustand
  umschalten(): boolean;
}

const LAUTSTAERKE = 0.09;

export function erstelleToene(speicher: Speicher | null): Toene {
  let stumm = ladeStumm(speicher);
  let kontext: AudioContext | null = null;

  function holeKontext(): AudioContext | null {
    if (!kontext) {
      try {
        kontext = new AudioContext();
      } catch {
        return null;
      }
    }
    if (kontext.state === "suspended") void kontext.resume();
    return kontext;
  }

  // Ein einzelner weicher Ton mit sanftem Ein- und Ausklingen
  function ton(frequenz: number, beginn: number, dauer: number, art: OscillatorType, staerke = 1, zielFrequenz?: number) {
    const c = holeKontext();
    if (!c || stumm) return;
    const start = c.currentTime + beginn;
    const oszillator = c.createOscillator();
    const huelle = c.createGain();
    oszillator.type = art;
    oszillator.frequency.setValueAtTime(frequenz, start);
    if (zielFrequenz) oszillator.frequency.exponentialRampToValueAtTime(zielFrequenz, start + dauer);
    huelle.gain.setValueAtTime(0.0001, start);
    huelle.gain.exponentialRampToValueAtTime(LAUTSTAERKE * staerke, start + 0.02);
    huelle.gain.exponentialRampToValueAtTime(0.0001, start + dauer);
    oszillator.connect(huelle).connect(c.destination);
    oszillator.start(start);
    oszillator.stop(start + dauer + 0.05);
  }

  return {
    wecke() {
      if (!stumm) holeKontext();
    },
    richtig() {
      // Aufsteigender Dur-Dreiklang wie ein kleines Glockenspiel
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        ton(f, i * 0.07, 0.35, "sine");
        ton(f * 2, i * 0.07, 0.18, "triangle", 0.25);
      });
    },
    falsch() {
      // Sanft abfallend, nicht erschreckend
      ton(392, 0, 0.28, "triangle", 0.9, 330);
      ton(311.13, 0.22, 0.45, "triangle", 0.8, 247);
    },
    istStumm: () => stumm,
    umschalten() {
      stumm = !stumm;
      speichereStumm(speicher, stumm);
      if (!stumm) holeKontext();
      return stumm;
    },
  };
}
