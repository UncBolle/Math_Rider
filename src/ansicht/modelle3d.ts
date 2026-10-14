import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { clone as klonMitSkelett } from "three/addons/utils/SkeletonUtils.js";

// Lädt die 3D-Modelle aus public/modelle. Jedes Modell wird nur einmal geladen
// und danach geklont, damit „Nochmal“ sofort startet.

const lader = new GLTFLoader();
const zwischenspeicher = new Map<string, Promise<GLTF>>();

export function ladeModell(pfad: string): Promise<GLTF> {
  const url = `${import.meta.env.BASE_URL}modelle/${pfad}`;
  let gltf = zwischenspeicher.get(url);
  if (!gltf) {
    gltf = lader.loadAsync(url);
    zwischenspeicher.set(url, gltf);
  }
  return gltf;
}

// Eigene Kopie der Szene eines geladenen Modells (Geometrie und Texturen werden geteilt)
export function kopie(gltf: GLTF): THREE.Object3D {
  return klonMitSkelett(gltf.scene);
}

// Macht kantige Low-Poly-Flächen weich, indem gleiche Eckpunkte verschmolzen werden
export function glaette(objekt: THREE.Object3D): void {
  objekt.traverse((teil) => {
    if (!(teil instanceof THREE.Mesh) || teil.userData.geglaettet) return;
    const geometrie = teil.geometry as THREE.BufferGeometry;
    geometrie.deleteAttribute("normal");
    const neu = mergeVertices(geometrie, 1e-4);
    neu.computeVertexNormals();
    teil.geometry = neu;
    teil.userData.geglaettet = true;
  });
}

export function alleMeshes(objekt: THREE.Object3D): THREE.Mesh[] {
  const liste: THREE.Mesh[] = [];
  objekt.traverse((teil) => {
    if (teil instanceof THREE.Mesh) liste.push(teil);
  });
  return liste;
}

// Skaliert ein Objekt auf die gewünschte Höhe und stellt es mit der Unterseite auf y = 0
export function aufHoehe(objekt: THREE.Object3D, hoehe: number): THREE.Object3D {
  // Animierte Modelle erst in ihre Pose bringen, sonst misst Box3 das ungestellte Skelett
  objekt.updateMatrixWorld(true);
  objekt.traverse((teil) => {
    if (teil instanceof THREE.SkinnedMesh) teil.skeleton.update();
  });
  const box = new THREE.Box3().setFromObject(objekt);
  const groesse = box.getSize(new THREE.Vector3());
  const faktor = hoehe / groesse.y;
  objekt.scale.multiplyScalar(faktor);
  const neu = new THREE.Box3().setFromObject(objekt);
  objekt.position.y -= neu.min.y;
  const mitte = neu.getCenter(new THREE.Vector3());
  objekt.position.x -= mitte.x;
  objekt.position.z -= mitte.z;
  return objekt;
}

// Hängt ein Objekt an einen Knochen eines animierten Modells. Lage, Ausrichtung und Größe
// werden in Weltkoordinaten angegeben; die (oft winzige) Skalierung und Drehung des Knochens
// wird herausgerechnet. Danach bewegt sich das Objekt mit dem Knochen mit.
export function befestige(
  knochen: THREE.Object3D,
  objekt: THREE.Object3D,
  versatzWelt: THREE.Vector3,
  ausrichtungWelt: THREE.Quaternion,
  skalaWelt: number,
): void {
  knochen.updateWorldMatrix(true, false);
  const umkehr = knochen.getWorldQuaternion(new THREE.Quaternion()).invert();
  const skala = knochen.getWorldScale(new THREE.Vector3()).x;
  objekt.position.copy(versatzWelt).applyQuaternion(umkehr).divideScalar(skala);
  objekt.quaternion.copy(umkehr).multiply(ausrichtungWelt);
  objekt.scale.setScalar(skalaWelt / skala);
  knochen.add(objekt);
}

// Verschiebt ein an einem Knochen hängendes Objekt so, dass sein Punkt `teil` bei `ziel` (Welt) liegt
export function richteAus(knochen: THREE.Object3D, objekt: THREE.Object3D, teil: THREE.Object3D, ziel: THREE.Vector3): void {
  objekt.updateWorldMatrix(true, true);
  const ist = teil.getWorldPosition(new THREE.Vector3());
  const umkehr = knochen.getWorldQuaternion(new THREE.Quaternion()).invert();
  const skala = knochen.getWorldScale(new THREE.Vector3()).x;
  objekt.position.add(ziel.clone().sub(ist).applyQuaternion(umkehr).divideScalar(skala));
}

// Dreht den Farbton einer Textur (z. B. rote Blätter → violett); Transparenz bleibt erhalten
export function farbtonGedreht(textur: THREE.Texture, grad: number, saettigung = 1): THREE.Texture {
  const bild = textur.image as CanvasImageSource & { width: number; height: number };
  const c = document.createElement("canvas");
  c.width = bild.width;
  c.height = bild.height;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(bild, 0, 0);
  const daten = g.getImageData(0, 0, c.width, c.height);
  const p = daten.data;
  const farbe = new THREE.Color();
  const hsl = { h: 0, s: 0, l: 0 };
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] === 0) continue;
    farbe.setRGB(p[i] / 255, p[i + 1] / 255, p[i + 2] / 255, THREE.LinearSRGBColorSpace);
    farbe.getHSL(hsl, THREE.LinearSRGBColorSpace);
    farbe.setHSL((hsl.h + grad / 360) % 1, Math.min(1, hsl.s * saettigung), hsl.l, THREE.LinearSRGBColorSpace);
    p[i] = farbe.r * 255;
    p[i + 1] = farbe.g * 255;
    p[i + 2] = farbe.b * 255;
  }
  g.putImageData(daten, 0, 0);
  const neu = new THREE.CanvasTexture(c);
  neu.colorSpace = textur.colorSpace;
  neu.flipY = textur.flipY;
  neu.wrapS = textur.wrapS;
  neu.wrapT = textur.wrapT;
  return neu;
}

// Weiches, rundes Leuchten als Textur (für Glühwürmchen, Sterne, Lichtschein)
let lichtTextur: THREE.Texture | null = null;
export function weichesLicht(): THREE.Texture {
  if (lichtTextur) return lichtTextur;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const verlauf = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  verlauf.addColorStop(0, "rgba(255,255,255,1)");
  verlauf.addColorStop(0.25, "rgba(255,255,255,0.75)");
  verlauf.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = verlauf;
  g.fillRect(0, 0, 64, 64);
  lichtTextur = new THREE.CanvasTexture(c);
  lichtTextur.colorSpace = THREE.SRGBColorSpace;
  return lichtTextur;
}

// Leuchtender Schein (Billboard), z. B. um Lösungsmarken oder Pilze
export function lichtschein(farbe: THREE.ColorRepresentation, groesse: number, staerke = 1): THREE.Sprite {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: weichesLicht(),
      color: farbe,
      transparent: true,
      opacity: staerke,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  sprite.scale.setScalar(groesse);
  return sprite;
}

// Zufallszahlen mit festem Startwert, damit die Kulisse jedes Mal gleich aussieht
export function festerZufall(startwert: number): () => number {
  let s = startwert >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
