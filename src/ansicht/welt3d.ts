import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BUEHNE_BREITE, BUEHNE_HOEHE, buehnenSkala } from "./buehne";
import { dauer } from "./hilfen";

// Gemeinsamer 3D-Rahmen für beide Themen: Renderer, Kamera, Leuchteffekte, Bewegung.
// Die Figur steht bei z = 0 und schaut nach -z. Hindernisse kommen von weit hinten (START_Z)
// auf sie zu, halten bei RUHE_Z an und ziehen danach an ihr vorbei.

export const START_Z = -150;
export const RUHE_Z = -9.5;
export const ENDE_Z = 14;
// Seitlicher Abstand der beiden Lösungen von der Mitte
export const SPUR_X = 3.7;

// Was ein Thema (Weltraum, Märchenwald) beisteuert
export interface ThemaSzene {
  figur: THREE.Object3D;
  // Stelle an der Figur, an der die Zahl angezeigt wird
  zahlPunkt: THREE.Object3D;
  erzeugeHindernis(name: string): THREE.Object3D;
  // Markierung, durch die die Figur bei einer Lösung fährt
  erzeugeLoesungsMarke(): THREE.Object3D;
  // Die Kulisse um dz nach vorn (zur Kamera) schieben
  bewegeKulisse(dz: number): void;
  setzeFahrt(faehrt: boolean): void;
  aktualisiere(dt: number, zeit: number): void;
  // Neigung der Figur beim Ausweichen (-1 links … 1 rechts)
  neige?(richtung: number): void;
}

export interface Anker {
  x: number;
  y: number;
  skala: number;
  sichtbar: boolean;
}

export interface Anzeigepunkte {
  links: Anker;
  rechts: Anker;
  schild: Anker;
  zahl: Anker;
}

interface Runde {
  gruppe: THREE.Group;
  links: THREE.Object3D;
  rechts: THREE.Object3D;
}

export interface Welt {
  canvas: HTMLCanvasElement;
  szene: THREE.Scene;
  setzeThema(thema: ThemaSzene): void;
  neueRunde(hindernis: string): void;
  entferneRunde(): void;
  fahre(bisZ: number, ms: number, verlauf: (t: number) => number): Promise<void>;
  weiche(zielX: number, ms: number): Promise<void>;
  sturz(): Promise<void>;
  markiere(seite: "links" | "rechts", art: "richtig" | "falsch"): void;
  proBild(fn: (punkte: Anzeigepunkte) => void): void;
}

export const verlauf = {
  bremsen: (t: number) => 1 - (1 - t) ** 3,
  beschleunigen: (t: number) => t * t,
  weich: (t: number) => t * t * (3 - 2 * t),
};

interface Tween {
  start: number;
  ms: number;
  schritt: (t: number) => void;
  fertig: () => void;
}

export function erstelleWelt(signal: AbortSignal): Welt {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = "welt3d";

  const szene = new THREE.Scene();
  // Nur beim Entwickeln: Szene für Prüfskripte erreichbar machen
  if (import.meta.env.DEV) Object.assign(window, { __szene: szene, __THREE: THREE });
  const pmrem = new THREE.PMREMGenerator(renderer);
  szene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  szene.environmentIntensity = 0.35;

  const kamera = new THREE.PerspectiveCamera(42, BUEHNE_BREITE / BUEHNE_HOEHE, 0.1, 900);
  const KAMERA_RUHE = new THREE.Vector3(1.8, 6.0, 9.4);
  const BLICK = new THREE.Vector3(0.4, 0.6, -11);
  kamera.position.copy(KAMERA_RUHE);
  kamera.lookAt(BLICK);

  const komponist = new EffectComposer(renderer);
  komponist.addPass(new RenderPass(szene, kamera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(BUEHNE_BREITE / 2, BUEHNE_HOEHE / 2), 0.6, 0.45, 0.9);
  komponist.addPass(bloom);
  komponist.addPass(new OutputPass());

  function passeGroesseAn() {
    const pixel = Math.min(2, Math.max(0.75, buehnenSkala() * window.devicePixelRatio));
    renderer.setPixelRatio(pixel);
    renderer.setSize(BUEHNE_BREITE, BUEHNE_HOEHE, false);
    komponist.setPixelRatio(pixel);
    komponist.setSize(BUEHNE_BREITE, BUEHNE_HOEHE);
    bloom.resolution.set((BUEHNE_BREITE * pixel) / 2, (BUEHNE_HOEHE * pixel) / 2);
  }
  passeGroesseAn();
  window.addEventListener("resize", passeGroesseAn, { signal });

  let thema: ThemaSzene | null = null;
  let runde: Runde | null = null;
  let figurX = 0;
  let wackeln = 0;
  let beiBild: ((punkte: Anzeigepunkte) => void) | null = null;
  const tweens: Tween[] = [];

  function animiere(ms: number, schritt: (t: number) => void): Promise<void> {
    return new Promise((fertig) => {
      tweens.push({ start: performance.now(), ms: Math.max(1, dauer(ms)), schritt, fertig });
    });
  }

  const hilfsVektor = new THREE.Vector3();
  const RUHE_ABSTAND = new THREE.Vector3(SPUR_X, 1.6, RUHE_Z).distanceTo(KAMERA_RUHE);

  function anker(objekt: THREE.Object3D | undefined, versatzY = 0): Anker {
    if (!objekt) return { x: 0, y: 0, skala: 1, sichtbar: false };
    objekt.getWorldPosition(hilfsVektor);
    hilfsVektor.y += versatzY;
    const abstand = hilfsVektor.distanceTo(kamera.position);
    hilfsVektor.project(kamera);
    return {
      x: ((hilfsVektor.x + 1) / 2) * BUEHNE_BREITE,
      y: ((1 - hilfsVektor.y) / 2) * BUEHNE_HOEHE,
      skala: RUHE_ABSTAND / abstand,
      sichtbar: hilfsVektor.z < 1 && abstand > 2.5,
    };
  }

  const schildPunkt = new THREE.Object3D();
  // Das Aufgabenschild steht vor dem Hindernis, zwischen Hindernis und Figur
  schildPunkt.position.set(0, 0.3, 2.7);

  let letzteZeit = performance.now();
  const uhr = { zeit: 0 };

  function bild(jetzt: number) {
    if (signal.aborted) {
      renderer.dispose();
      komponist.dispose();
      pmrem.dispose();
      return;
    }
    const dt = Math.min(0.05, (jetzt - letzteZeit) / 1000);
    letzteZeit = jetzt;
    uhr.zeit += dt;

    for (const tween of [...tweens]) {
      const t = Math.min(1, (jetzt - tween.start) / tween.ms);
      tween.schritt(t);
      if (t >= 1) {
        tweens.splice(tweens.indexOf(tween), 1);
        tween.fertig();
      }
    }

    if (thema) {
      thema.figur.position.x = figurX;
      thema.aktualisiere(dt, uhr.zeit);
    }

    // Kamera folgt der Figur ein wenig zur Seite, beim Sturz wackelt sie
    const zitter = wackeln > 0 ? (Math.random() - 0.5) * wackeln : 0;
    kamera.position.set(KAMERA_RUHE.x + figurX * 0.35 + zitter, KAMERA_RUHE.y + zitter * 0.6, KAMERA_RUHE.z);
    kamera.lookAt(BLICK.x + figurX * 0.25, BLICK.y, BLICK.z);
    wackeln = Math.max(0, wackeln - dt * 1.2);

    komponist.render(dt);

    beiBild?.({
      links: anker(runde?.links),
      rechts: anker(runde?.rechts),
      schild: anker(runde ? schildPunkt : undefined),
      zahl: anker(thema?.zahlPunkt),
    });
    requestAnimationFrame(bild);
  }
  requestAnimationFrame(bild);

  return {
    canvas,
    szene,
    setzeThema(neu) {
      thema = neu;
      szene.add(neu.figur);
    },
    neueRunde(hindernis) {
      if (!thema) return;
      const gruppe = new THREE.Group();
      gruppe.add(thema.erzeugeHindernis(hindernis));
      const links = thema.erzeugeLoesungsMarke();
      links.position.set(-SPUR_X, 1.6, 0);
      const rechts = thema.erzeugeLoesungsMarke();
      rechts.position.set(SPUR_X, 1.6, 0);
      gruppe.add(links, rechts, schildPunkt);
      gruppe.position.z = START_Z;
      szene.add(gruppe);
      runde = { gruppe, links, rechts };
    },
    entferneRunde() {
      if (runde) szene.remove(runde.gruppe);
      runde = null;
    },
    fahre(bisZ, ms, verlaufFn) {
      const gruppe = runde?.gruppe;
      if (!gruppe || !thema) return Promise.resolve();
      const vonZ = gruppe.position.z;
      thema.setzeFahrt(true);
      return animiere(ms, (t) => {
        const z = vonZ + (bisZ - vonZ) * verlaufFn(t);
        thema!.bewegeKulisse(z - gruppe.position.z);
        gruppe.position.z = z;
      }).then(() => thema?.setzeFahrt(false));
    },
    weiche(zielX, ms) {
      const vonX = figurX;
      return animiere(ms, (t) => {
        const w = verlauf.weich(t);
        figurX = vonX + (zielX - vonX) * w;
        thema?.neige?.(Math.sin(t * Math.PI) * Math.sign(zielX - vonX));
      });
    },
    sturz() {
      wackeln = 0.35;
      const figur = thema?.figur;
      if (!figur) return Promise.resolve();
      const start = figur.rotation.clone();
      return animiere(900, (t) => {
        figur.rotation.z = start.z + Math.sin(t * 9) * 0.35 * (1 - t);
        figur.rotation.x = start.x - t * 0.5;
        figur.position.y = -t * 0.6;
      });
    },
    markiere(seite, art) {
      const marke = runde?.[seite];
      marke?.userData.markiere?.(art);
    },
    proBild(fn) {
      beiBild = fn;
    },
  };
}

// Wartet, bis alle Promises fertig sind, und meldet den Fortschritt
export async function ladeAlles<T>(aufgaben: Promise<T>[], fortschritt: (anteil: number) => void): Promise<T[]> {
  let fertig = 0;
  return Promise.all(
    aufgaben.map((a) =>
      a.then((wert) => {
        fortschritt(++fertig / aufgaben.length);
        return wert;
      }),
    ),
  );
}
