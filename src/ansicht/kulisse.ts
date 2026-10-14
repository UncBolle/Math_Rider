import { BUEHNE_BREITE, BUEHNE_HOEHE, buehnenSkala } from "./buehne";
import { dauer, element } from "./hilfen";
import { HORIZONT_Y, projiziere } from "./perspektive";

// Hintergrund der Spielszene: Himmel und eine schwebende, gekachelte Strecke mit Neonlinien.
// Gezeichnet auf ein Canvas, damit es auch auf Handys flüssig läuft.

export type Thema = "weltraum" | "maerchenland";

type Rgb = [number, number, number];

interface Palette {
  // Oben, am Horizont, unten (unter der schwebenden Strecke)
  himmel: [string, string, string];
  nebel: { x: number; y: number; r: number; farbe: string }[];
  sterne: number;
  fliese: Rgb;
  fliese2: Rgb;
  fuge: Rgb;
  kante: Rgb;
  dunst: Rgb;
  neon: string;
  neonMitte: string;
}

const PALETTEN: Record<Thema, Palette> = {
  weltraum: {
    himmel: ["#04061a", "#26357f", "#070b26"],
    nebel: [
      { x: 260, y: 110, r: 420, farbe: "rgba(150, 70, 220, 0.38)" },
      { x: 1040, y: 170, r: 460, farbe: "rgba(30, 170, 230, 0.30)" },
      { x: 680, y: 40, r: 320, farbe: "rgba(240, 90, 170, 0.22)" },
      { x: 120, y: 520, r: 380, farbe: "rgba(60, 90, 220, 0.25)" },
      { x: 1180, y: 560, r: 360, farbe: "rgba(140, 60, 200, 0.25)" },
    ],
    sterne: 260,
    fliese: [218, 223, 233],
    fliese2: [200, 207, 220],
    fuge: [70, 78, 104],
    kante: [255, 255, 255],
    dunst: [34, 48, 122],
    neon: "#ff8a3d",
    neonMitte: "#ffb35c",
  },
  maerchenland: {
    himmel: ["#1d1150", "#ffb0c8", "#3a1f78"],
    nebel: [
      { x: 220, y: 120, r: 380, farbe: "rgba(255, 140, 220, 0.30)" },
      { x: 1060, y: 90, r: 420, farbe: "rgba(120, 200, 255, 0.28)" },
      { x: 640, y: 160, r: 300, farbe: "rgba(255, 230, 170, 0.30)" },
      { x: 140, y: 560, r: 360, farbe: "rgba(160, 90, 230, 0.30)" },
      { x: 1160, y: 540, r: 380, farbe: "rgba(90, 200, 230, 0.25)" },
    ],
    sterne: 140,
    fliese: [246, 238, 252],
    fliese2: [232, 220, 246],
    fuge: [128, 96, 168],
    kante: [255, 255, 255],
    dunst: [255, 182, 206],
    neon: "#45f0ff",
    neonMitte: "#ff6ad5",
  },
};

// Maße der Strecke in Bodeneinheiten (bei Tiefe 0 entspricht eine Einheit einem Bühnenpunkt)
const BREITE = 2600;
const SPALTEN = 10;
const REIHE = 420;
const FUGE = 12;
const SPUR = 452;
const MAX_TIEFE = 16000;

export interface Kulisse {
  canvas: HTMLCanvasElement;
  // Fährt die Strecke um `strecke` Einheiten weiter; proBild wird bei jedem Bild mit dem
  // bisher gefahrenen Stück aufgerufen, damit Hindernisse genau mitlaufen
  fahre(strecke: number, ms: number, verlauf: (t: number) => number, proBild?: (gefahren: number) => void): Promise<void>;
}

export const verlauf = {
  bremsen: (t: number) => 1 - (1 - t) * (1 - t),
  beschleunigen: (t: number) => t * t,
};

export function erstelleKulisse(thema: Thema, signal: AbortSignal): Kulisse {
  const palette = PALETTEN[thema];
  const canvas = element("canvas", "kulisse");
  const ctx = canvas.getContext("2d")!;
  const himmel = document.createElement("canvas");
  let aufloesung = 1;
  // Bisher insgesamt gefahrene Strecke; bestimmt, wo die Fugen liegen
  let gefahrenGesamt = 0;

  function passeGroesseAn() {
    aufloesung = Math.min(2, Math.max(1, buehnenSkala() * window.devicePixelRatio));
    for (const c of [canvas, himmel]) {
      c.width = Math.round(BUEHNE_BREITE * aufloesung);
      c.height = Math.round(BUEHNE_HOEHE * aufloesung);
    }
    zeichneHimmel();
    zeichne();
  }

  function zeichneHimmel() {
    const h = himmel.getContext("2d")!;
    h.setTransform(aufloesung, 0, 0, aufloesung, 0, 0);
    const verlaufHimmel = h.createLinearGradient(0, 0, 0, BUEHNE_HOEHE);
    verlaufHimmel.addColorStop(0, palette.himmel[0]);
    verlaufHimmel.addColorStop(HORIZONT_Y / BUEHNE_HOEHE, palette.himmel[1]);
    verlaufHimmel.addColorStop(1, palette.himmel[2]);
    h.fillStyle = verlaufHimmel;
    h.fillRect(0, 0, BUEHNE_BREITE, BUEHNE_HOEHE);

    for (const n of palette.nebel) {
      const g = h.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, n.farbe);
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      h.fillStyle = g;
      h.fillRect(0, 0, BUEHNE_BREITE, BUEHNE_HOEHE);
    }

    // Feste Sterne: gleiche Folge bei jedem Zeichnen
    let saat = 12345;
    const zufall = () => ((saat = (saat * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < palette.sterne; i++) {
      const x = zufall() * BUEHNE_BREITE;
      const y = zufall() * BUEHNE_HOEHE;
      const r = zufall() < 0.9 ? 0.6 + zufall() * 1.1 : 1.8 + zufall() * 1.4;
      const helligkeit = 0.4 + zufall() * 0.6;
      const farbeStern = zufall() < 0.8 ? "#ffffff" : "#ffe7b0";
      if (r > 1.8) {
        // Große Sterne mit weichem Schein statt hartem Fleck
        const g = h.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, farbeStern);
        g.addColorStop(0.3, `rgba(255, 255, 255, ${helligkeit * 0.35})`);
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        h.fillStyle = g;
        h.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
        continue;
      }
      h.globalAlpha = helligkeit;
      h.fillStyle = farbeStern;
      h.beginPath();
      h.arc(x, y, r, 0, Math.PI * 2);
      h.fill();
    }
    h.globalAlpha = 1;

    // Leuchtender, flacher Schein entlang des Horizonts
    h.save();
    h.translate(640, HORIZONT_Y);
    h.scale(1, 0.18);
    const schein = h.createRadialGradient(0, 0, 0, 0, 0, 760);
    schein.addColorStop(0, `${palette.neonMitte}66`);
    schein.addColorStop(1, `${palette.neonMitte}00`);
    h.fillStyle = schein;
    h.fillRect(-760, -760, 1520, 1520);
    h.restore();
  }

  const farbe = ([r, g, b]: Rgb, dunst: number) => {
    const [dr, dg, db] = palette.dunst;
    const m = (a: number, z: number) => Math.round(a + (z - a) * dunst);
    return `rgb(${m(r, dr)}, ${m(g, dg)}, ${m(b, db)})`;
  };

  // Ein Viereck auf dem Boden, gegeben in Bodenkoordinaten
  function viereck(links: number, rechts: number, nah: number, fern: number) {
    const a = projiziere(nah, links);
    const b = projiziere(nah, rechts);
    const c = projiziere(fern, rechts);
    const d = projiziere(fern, links);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
  }

  function zeichne() {
    ctx.setTransform(aufloesung, 0, 0, aufloesung, 0, 0);
    ctx.drawImage(himmel, 0, 0, BUEHNE_BREITE, BUEHNE_HOEHE);

    // Hinter den Fliesen läuft die Strecke im Dunst bis zum Horizont aus
    viereck(-BREITE / 2, BREITE / 2, MAX_TIEFE - REIHE, 400000);
    ctx.fillStyle = farbe(palette.fuge, 1);
    ctx.fill();

    // Fugen als Untergrund
    viereck(-BREITE / 2, BREITE / 2, -REIHE, MAX_TIEFE);
    const fugen = ctx.createLinearGradient(0, projiziere(MAX_TIEFE).y, 0, BUEHNE_HOEHE);
    fugen.addColorStop(0, farbe(palette.fuge, 1));
    fugen.addColorStop(0.15, farbe(palette.fuge, 0));
    ctx.fillStyle = fugen;
    ctx.fill();

    const spalte = BREITE / SPALTEN;
    const ersteReihe = Math.floor((gefahrenGesamt - REIHE) / REIHE);
    for (let n = ersteReihe; ; n++) {
      const nah = n * REIHE - gefahrenGesamt;
      if (nah > MAX_TIEFE) break;
      const fern = Math.min(nah + REIHE - FUGE, MAX_TIEFE);
      const dunst = Math.min(1, Math.max(0, (nah - 2500) / (MAX_TIEFE - 2500))) ** 0.7;
      for (let s = 0; s < SPALTEN; s++) {
        const links = -BREITE / 2 + s * spalte + FUGE / 2;
        const rechts = links + spalte - FUGE;
        viereck(links, rechts, nah, fern);
        ctx.fillStyle = farbe((n + s) % 2 === 0 ? palette.fliese : palette.fliese2, dunst);
        ctx.fill();
        // Helle Kante oben an jeder Fliese wirkt wie eine Fase
        viereck(links, rechts, fern - 26, fern);
        ctx.fillStyle = farbe(palette.kante, dunst);
        ctx.fill();
      }
    }

    // Neonlinien: Spuren und Ränder
    ctx.save();
    ctx.shadowBlur = 18 * aufloesung;
    for (const [x, breite, farbeLinie] of [
      [-SPUR, 14, palette.neonMitte],
      [SPUR, 14, palette.neonMitte],
      [-BREITE / 2 + 6, 22, palette.neon],
      [BREITE / 2 - 6, 22, palette.neon],
    ] as const) {
      ctx.shadowColor = farbeLinie;
      ctx.fillStyle = farbeLinie;
      viereck(x - breite / 2, x + breite / 2, -REIHE, 400000);
      ctx.fill();
    }
    ctx.restore();

    // Dunst am Horizont lässt die Strecke weich auslaufen (nur auf der Strecke selbst)
    const [r, g, b] = palette.dunst;
    const dunstVerlauf = ctx.createLinearGradient(0, HORIZONT_Y, 0, HORIZONT_Y + 90);
    dunstVerlauf.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
    dunstVerlauf.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.save();
    viereck(-BREITE / 2 - 40, BREITE / 2 + 40, 0, 400000);
    ctx.clip();
    ctx.fillStyle = dunstVerlauf;
    ctx.fillRect(0, HORIZONT_Y, BUEHNE_BREITE, 90);
    ctx.restore();

    // Abgedunkelte Ränder lenken den Blick in die Mitte
    const rand = ctx.createRadialGradient(640, 420, 300, 640, 420, 860);
    rand.addColorStop(0, "rgba(0, 0, 20, 0)");
    rand.addColorStop(1, "rgba(0, 0, 20, 0.45)");
    ctx.fillStyle = rand;
    ctx.fillRect(0, 0, BUEHNE_BREITE, BUEHNE_HOEHE);
  }

  function fahre(
    strecke: number,
    ms: number,
    verlaufFn: (t: number) => number,
    proBild?: (gefahren: number) => void,
  ): Promise<void> {
    const start = performance.now();
    const ausgang = gefahrenGesamt;
    const gesamt = Math.max(1, dauer(ms));
    return new Promise((fertig) => {
      const bild = (jetzt: number) => {
        if (signal.aborted) return fertig();
        const t = Math.min(1, (jetzt - start) / gesamt);
        const gefahren = strecke * verlaufFn(t);
        gefahrenGesamt = ausgang + gefahren;
        zeichne();
        proBild?.(gefahren);
        if (t < 1) requestAnimationFrame(bild);
        else fertig();
      };
      requestAnimationFrame(bild);
    });
  }

  window.addEventListener("resize", passeGroesseAn, { signal });
  passeGroesseAn();
  return { canvas, fahre };
}
