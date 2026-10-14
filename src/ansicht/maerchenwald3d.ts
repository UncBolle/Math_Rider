import * as THREE from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import {
  alleMeshes,
  befestige,
  aufHoehe,
  farbtonGedreht,
  festerZufall,
  glaette,
  kopie,
  ladeModell,
  lichtschein,
  richteAus,
  weichesLicht,
} from "./modelle3d";
import { ladeAlles, type ThemaSzene } from "./welt3d";

// Ein leuchtender Märchenwald bei Nacht: Waldweg, Bäume, Farne, Blumen, leuchtende Pilze,
// Glühwürmchen und Mondlicht. Die Prinzessin reitet auf einem Einhorn hindurch.

const NATUR = [
  "CommonTree_1",
  "CommonTree_3",
  "CommonTree_5",
  "Pine_1",
  "Pine_3",
  "TwistedTree_1",
  "TwistedTree_3",
  "Bush_Common",
  "Bush_Common_Flowers",
  "Fern_1",
  "Flower_3_Group",
  "Flower_4_Group",
  "Grass_Common_Tall",
  "Grass_Wispy_Tall",
  "Mushroom_Common",
  "Mushroom_Laetiporus",
  "Rock_Medium_1",
  "Rock_Medium_2",
  "Rock_Medium_3",
  "Clover_1",
  "Plant_1_Big",
] as const;
type Natur = (typeof NATUR)[number];

// Länge eines Kulissen-Abschnitts; drei Abschnitte laufen im Kreis
const ABSCHNITT = 60;
const ABSCHNITTE = 3;
const WEG_BREITE = 5.4;

export async function baueMaerchenwald(szene: THREE.Scene, fortschritt: (anteil: number) => void): Promise<ThemaSzene> {
  const [pferd, prinzessin, krone, ...natur] = await ladeAlles(
    [
      ladeModell("figuren/pferd.glb"),
      ladeModell("figuren/prinzessin.glb"),
      ladeModell("figuren/krone.glb"),
      ...NATUR.map((n) => ladeModell(`natur/${n}.gltf`)),
    ],
    fortschritt,
  );
  const modelle = Object.fromEntries(NATUR.map((n, i) => [n, natur[i]])) as Record<Natur, GLTF>;
  verzaubereBlaetter(modelle);

  baueHimmel(szene);
  baueLicht(szene);
  baueFernenWald(szene);
  const weg = baueBoden(szene);
  const abschnitte = baueAbschnitte(szene, modelle);
  const gluehwuermchen = baueGluehwuermchen(szene);
  const reiter = baueEinhorn(pferd, prinzessin, krone);
  const rindenMaterial = findeMaterial(modelle.CommonTree_1, (m) => !m.transparent && m.alphaTest === 0);

  let faehrt = false;
  let neigung = 0;

  return {
    figur: reiter.wurzel,
    zahlPunkt: reiter.zahlPunkt,

    erzeugeHindernis(name) {
      const hindernis =
        name === "baumstamm"
          ? baueBaumstamm(rindenMaterial, modelle)
          : name === "felsen"
            ? baueFelsen(modelle)
            : baueDornen(modelle);
      hindernis.scale.setScalar(1.5);
      return hindernis;
    },

    erzeugeLoesungsMarke() {
      return baueLeuchtkugel();
    },

    bewegeKulisse(dz) {
      for (const abschnitt of abschnitte) {
        abschnitt.position.z += dz;
        if (abschnitt.position.z > ABSCHNITT + 12) abschnitt.position.z -= ABSCHNITT * ABSCHNITTE;
      }
      weg.offset.y += (dz * 70) / 420;
      gluehwuermchen.verschiebe(dz);
    },

    setzeFahrt(an) {
      if (an === faehrt) return;
      faehrt = an;
      reiter.galopp(an);
    },

    aktualisiere(dt, zeit) {
      reiter.mixer.update(dt);
      gluehwuermchen.aktualisiere(zeit);
      reiter.wurzel.rotation.z = THREE.MathUtils.lerp(reiter.wurzel.rotation.z, -neigung * 0.12, 0.2);
      reiter.horn.material.emissiveIntensity = 2.2 + Math.sin(zeit * 3) * 0.6;
    },

    neige(richtung) {
      neigung = richtung;
    },
  };
}

// Färbt die roten Blätter der verwunschenen Bäume violett und die Büsche türkis und lässt sie
// leicht glimmen. Geschieht einmal am geladenen Modell; alle Kopien teilen das Material.
function verzaubereBlaetter(m: Record<Natur, GLTF>) {
  const plan: [Natur[], number, number, number][] = [
    [["TwistedTree_1", "TwistedTree_3"], 285, 0x9a5cff, 0.35],
    [["Bush_Common"], 170, 0x3fe0d0, 0.25],
  ];
  for (const [namen, grad, glimmen, staerke] of plan) {
    for (const name of namen) {
      if (m[name].userData.verzaubert) continue;
      m[name].userData.verzaubert = true;
      for (const mesh of alleMeshes(m[name].scene)) {
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (!material.map || material.alphaTest === 0) continue;
        material.map = farbtonGedreht(material.map, grad, 1.1);
        material.emissive = new THREE.Color(glimmen);
        material.emissiveMap = material.map;
        material.emissiveIntensity = staerke;
        material.needsUpdate = true;
      }
    }
  }
}

function findeMaterial(gltf: GLTF, passt: (m: THREE.MeshStandardMaterial) => boolean): THREE.MeshStandardMaterial {
  for (const mesh of alleMeshes(gltf.scene)) {
    const m = mesh.material as THREE.MeshStandardMaterial;
    if (passt(m)) return m;
  }
  return new THREE.MeshStandardMaterial({ color: 0x6b4a33 });
}

// ---------- Himmel, Licht, Boden ----------

function baueHimmel(szene: THREE.Scene) {
  szene.background = new THREE.Color(0x070a20);
  // Nebel in der Farbe des Horizonts, damit der Boden in der Ferne unsichtbar ausläuft
  szene.fog = new THREE.FogExp2(0x1c1a44, 0.034);

  const kuppel = new THREE.Mesh(
    new THREE.SphereGeometry(420, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
      uniforms: {},
      vertexShader: `varying vec3 vRichtung;
        void main() { vRichtung = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vRichtung;
        void main() {
          float h = vRichtung.y;
          vec3 oben = vec3(0.005, 0.008, 0.04);
          vec3 mitte = vec3(0.04, 0.05, 0.17);
          vec3 horizont = vec3(0.11, 0.10, 0.27);
          vec3 farbe = mix(horizont, mitte, smoothstep(0.0, 0.22, h));
          farbe = mix(farbe, oben, smoothstep(0.22, 0.75, h));
          vec3 mond = normalize(vec3(-0.25, 0.32, -1.0));
          float m = max(dot(normalize(vRichtung), mond), 0.0);
          farbe += vec3(0.55, 0.62, 0.9) * pow(m, 60.0) * 0.8 + vec3(0.3, 0.35, 0.7) * pow(m, 8.0) * 0.25;
          gl_FragColor = vec4(farbe, 1.0);
        }`,
    }),
  );
  kuppel.renderOrder = -1;
  szene.add(kuppel);

  const mond = new THREE.Mesh(
    new THREE.CircleGeometry(9, 32),
    new THREE.MeshBasicMaterial({ color: 0xf4f1ff, fog: false }),
  );
  mond.position.set(-95, 125, -380);
  mond.lookAt(0, 0, 0);
  szene.add(mond);
  const mondschein = lichtschein(0xb8c6ff, 70, 0.35);
  mondschein.material.fog = false;
  mondschein.position.copy(mond.position);
  szene.add(mondschein);

  // Ferne Sterne
  const zufall = festerZufall(7);
  const punkte: number[] = [];
  for (let i = 0; i < 500; i++) {
    const winkel = zufall() * Math.PI * 2;
    const hoehe = 0.15 + zufall() * 0.85;
    const r = 400;
    punkte.push(Math.cos(winkel) * r * Math.sqrt(1 - hoehe * hoehe), hoehe * r, Math.sin(winkel) * r * Math.sqrt(1 - hoehe * hoehe));
  }
  const sterne = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(punkte, 3)),
    new THREE.PointsMaterial({ color: 0xdfe6ff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }),
  );
  szene.add(sterne);
}

// Dunkle Tannen-Silhouetten weit hinten, damit der Horizont nicht als gerade Linie endet
function baueFernenWald(szene: THREE.Scene) {
  const zufall = festerZufall(77);
  const anzahl = 260;
  const tanne = new THREE.InstancedMesh(
    new THREE.ConeGeometry(1, 1, 7),
    new THREE.MeshStandardMaterial({ color: 0x141a2e, roughness: 1 }),
    anzahl,
  );
  const matrix = new THREE.Matrix4();
  for (let i = 0; i < anzahl; i++) {
    const winkel = -Math.PI * 0.95 + zufall() * Math.PI * 0.9;
    const abstand = 110 + zufall() * 80;
    const hoehe = 7 + zufall() * 9;
    matrix.compose(
      new THREE.Vector3(Math.cos(winkel) * abstand, hoehe / 2 - 1, Math.sin(winkel) * abstand - 20),
      new THREE.Quaternion(),
      new THREE.Vector3(hoehe * 0.28, hoehe, hoehe * 0.28),
    );
    tanne.setMatrixAt(i, matrix);
  }
  szene.add(tanne);
}

function baueLicht(szene: THREE.Scene) {
  szene.add(new THREE.HemisphereLight(0x7f96ff, 0x140b26, 0.75));
  const mondlicht = new THREE.DirectionalLight(0xb8caff, 1.6);
  mondlicht.position.set(-10, 16, -8);
  szene.add(mondlicht);
  // Warmes Licht von vorn, damit Einhorn und Prinzessin gut zu sehen sind
  const fuelllicht = new THREE.DirectionalLight(0xffcfa8, 0.85);
  fuelllicht.position.set(5, 7, 12);
  szene.add(fuelllicht);
  const reiterLicht = new THREE.PointLight(0xffc58a, 3, 9, 2);
  reiterLicht.position.set(0, 3.2, 2.5);
  szene.add(reiterLicht);
}

function rauschTextur(grundfarbe: [number, number, number], streuung: number, steine = 0): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const zufall = festerZufall(grundfarbe[0] * 7 + grundfarbe[1]);
  const bild = g.createImageData(256, 256);
  for (let i = 0; i < 256 * 256; i++) {
    const n = (zufall() - 0.5) * streuung;
    bild.data[i * 4] = grundfarbe[0] + n;
    bild.data[i * 4 + 1] = grundfarbe[1] + n;
    bild.data[i * 4 + 2] = grundfarbe[2] + n * 0.6;
    bild.data[i * 4 + 3] = 255;
  }
  g.putImageData(bild, 0, 0);
  for (let i = 0; i < steine; i++) {
    const x = zufall() * 256;
    const y = zufall() * 256;
    const r = 2 + zufall() * 7;
    const hell = 110 + zufall() * 60;
    g.fillStyle = `rgb(${hell},${hell * 0.92},${hell * 0.85})`;
    g.beginPath();
    g.ellipse(x, y, r, r * (0.6 + zufall() * 0.4), zufall() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const textur = new THREE.CanvasTexture(c);
  textur.colorSpace = THREE.SRGBColorSpace;
  textur.wrapS = textur.wrapT = THREE.RepeatWrapping;
  textur.anisotropy = 4;
  return textur;
}

function baueBoden(szene: THREE.Scene): THREE.Texture {
  const moos = rauschTextur([52, 82, 46], 40);
  moos.repeat.set(30, 100);
  const boden = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 420),
    new THREE.MeshStandardMaterial({ map: moos, roughness: 1, color: 0x6f8a6a }),
  );
  boden.rotation.x = -Math.PI / 2;
  boden.position.z = -150;
  szene.add(boden);

  // Waldweg mit weichen Rändern
  const weg = rauschTextur([120, 92, 66], 34, 160);
  weg.repeat.set(1, 70);
  const rand = document.createElement("canvas");
  rand.width = 64;
  rand.height = 4;
  const rg = rand.getContext("2d")!;
  const verlauf = rg.createLinearGradient(0, 0, 64, 0);
  verlauf.addColorStop(0, "#000");
  verlauf.addColorStop(0.18, "#fff");
  verlauf.addColorStop(0.82, "#fff");
  verlauf.addColorStop(1, "#000");
  rg.fillStyle = verlauf;
  rg.fillRect(0, 0, 64, 4);
  const pfad = new THREE.Mesh(
    new THREE.PlaneGeometry(WEG_BREITE, 420),
    new THREE.MeshStandardMaterial({
      map: weg,
      alphaMap: new THREE.CanvasTexture(rand),
      transparent: true,
      roughness: 0.95,
      color: 0x9c8672,
    }),
  );
  pfad.rotation.x = -Math.PI / 2;
  pfad.position.set(0, 0.02, -150);
  szene.add(pfad);
  return weg;
}

// ---------- Kulisse in Abschnitten ----------

function platziere(
  gruppe: THREE.Object3D,
  gltf: GLTF,
  x: number,
  z: number,
  hoehe: number,
  drehung: number,
): THREE.Object3D {
  const teil = aufHoehe(kopie(gltf), hoehe);
  const halter = new THREE.Group();
  halter.add(teil);
  halter.position.set(x, 0, z);
  halter.rotation.y = drehung;
  gruppe.add(halter);
  return halter;
}

function leuchtePilz(pilz: THREE.Object3D, farbe: THREE.Color) {
  for (const mesh of alleMeshes(pilz)) {
    const alt = mesh.material as THREE.MeshStandardMaterial;
    const neu = alt.clone();
    neu.emissive = farbe;
    neu.emissiveMap = alt.map;
    neu.emissiveIntensity = 1.6;
    mesh.material = neu;
  }
}

function baueAbschnitte(szene: THREE.Scene, m: Record<Natur, GLTF>): THREE.Group[] {
  const abschnitte: THREE.Group[] = [];
  const baeume: [Natur, number][] = [
    ["CommonTree_1", 3],
    ["CommonTree_3", 3],
    ["CommonTree_5", 2],
    ["Pine_1", 2],
    ["Pine_3", 2],
    ["TwistedTree_1", 1],
    ["TwistedTree_3", 1],
  ];
  const unterholz: [Natur, number, number][] = [
    ["Fern_1", 4, 1.1],
    ["Bush_Common_Flowers", 2, 1.4],
    ["Bush_Common", 2, 1.6],
    ["Flower_3_Group", 3, 0.7],
    ["Flower_4_Group", 3, 0.8],
    ["Grass_Common_Tall", 4, 0.7],
    ["Grass_Wispy_Tall", 3, 0.8],
    ["Clover_1", 3, 0.25],
    ["Plant_1_Big", 2, 1.0],
  ];
  const ziehe = <T extends [Natur, number, ...unknown[]]>(liste: T[], zufall: () => number): T => {
    const summe = liste.reduce((s, e) => s + e[1], 0);
    let wahl = zufall() * summe;
    for (const eintrag of liste) {
      wahl -= eintrag[1];
      if (wahl <= 0) return eintrag;
    }
    return liste[0];
  };
  const farben = [new THREE.Color(0x3ff2ff), new THREE.Color(0xff5fd8), new THREE.Color(0x9b7bff)];

  for (let a = 0; a < ABSCHNITTE; a++) {
    const gruppe = new THREE.Group();
    const zufall = festerZufall(100 + a);
    for (const seite of [-1, 1]) {
      // Bäume in zwei Reihen, die vordere dichter am Weg
      for (let i = 0; i < 11; i++) {
        const [art] = ziehe(baeume, zufall);
        const nah = i < 6;
        const x = seite * (nah ? 5.2 + zufall() * 3.5 : 9 + zufall() * 14);
        const z = 10 - zufall() * ABSCHNITT;
        platziere(gruppe, m[art], x, z, (art.startsWith("Pine") ? 9 : 7) + zufall() * 4, zufall() * Math.PI * 2);
      }
      for (let i = 0; i < 22; i++) {
        const [art, , hoehe] = ziehe(unterholz, zufall);
        const x = seite * (WEG_BREITE / 2 + 0.2 + zufall() * 4.5);
        platziere(gruppe, m[art], x, 10 - zufall() * ABSCHNITT, hoehe * (0.8 + zufall() * 0.6), zufall() * Math.PI * 2);
      }
      for (let i = 0; i < 4; i++) {
        const art = zufall() < 0.7 ? "Mushroom_Common" : "Mushroom_Laetiporus";
        const pilz = platziere(
          gruppe,
          m[art],
          seite * (WEG_BREITE / 2 + 0.4 + zufall() * 2.5),
          10 - zufall() * ABSCHNITT,
          0.5 + zufall() * 0.5,
          zufall() * 6,
        );
        const farbe = farben[Math.floor(zufall() * farben.length)];
        leuchtePilz(pilz, farbe);
        const schein = lichtschein(farbe, 1.6, 0.55);
        schein.position.y = 0.4;
        pilz.add(schein);
      }
      const stein = zufall() < 0.5 ? "Rock_Medium_1" : "Rock_Medium_2";
      platziere(gruppe, m[stein], seite * (4 + zufall() * 3), 10 - zufall() * ABSCHNITT, 0.6 + zufall() * 0.7, zufall() * 6);
    }

    // Mondstrahlen zwischen den Bäumen
    for (let i = 0; i < 3; i++) {
      const strahl = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 26), strahlMaterial());
      strahl.position.set((zufall() - 0.5) * 18, 9, 5 - zufall() * ABSCHNITT);
      strahl.rotation.set(0, (zufall() - 0.5) * 0.6, 0.35);
      gruppe.add(strahl);
    }

    gruppe.position.z = -a * ABSCHNITT;
    szene.add(gruppe);
    abschnitte.push(gruppe);
  }
  return abschnitte;
}

let strahlMat: THREE.MeshBasicMaterial | null = null;
function strahlMaterial(): THREE.MeshBasicMaterial {
  if (strahlMat) return strahlMat;
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 128;
  const g = c.getContext("2d")!;
  const quer = g.createLinearGradient(0, 0, 32, 0);
  quer.addColorStop(0, "rgba(255,255,255,0)");
  quer.addColorStop(0.5, "rgba(255,255,255,1)");
  quer.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = quer;
  g.fillRect(0, 0, 32, 128);
  g.globalCompositeOperation = "destination-in";
  const laengs = g.createLinearGradient(0, 0, 0, 128);
  laengs.addColorStop(0, "rgba(0,0,0,0.9)");
  laengs.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = laengs;
  g.fillRect(0, 0, 32, 128);
  strahlMat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(c),
    color: 0x9fb4ff,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  return strahlMat;
}

function baueGluehwuermchen(szene: THREE.Scene) {
  const anzahl = 260;
  const zufall = festerZufall(42);
  const basis = new Float32Array(anzahl * 3);
  const phase = new Float32Array(anzahl);
  for (let i = 0; i < anzahl; i++) {
    basis[i * 3] = (zufall() - 0.5) * 30;
    basis[i * 3 + 1] = 0.3 + zufall() * 4.5;
    basis[i * 3 + 2] = 10 - zufall() * 90;
    phase[i] = zufall() * 100;
  }
  const positionen = new Float32Array(basis);
  const geometrie = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(positionen, 3));
  const punkte = new THREE.Points(
    geometrie,
    new THREE.PointsMaterial({
      map: weichesLicht(),
      color: 0xfff28a,
      size: 0.32,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  szene.add(punkte);
  return {
    verschiebe(dz: number) {
      for (let i = 0; i < anzahl; i++) {
        basis[i * 3 + 2] += dz;
        if (basis[i * 3 + 2] > 12) basis[i * 3 + 2] -= 90;
      }
    },
    aktualisiere(zeit: number) {
      for (let i = 0; i < anzahl; i++) {
        const p = phase[i];
        positionen[i * 3] = basis[i * 3] + Math.sin(zeit * 0.7 + p) * 0.6;
        positionen[i * 3 + 1] = basis[i * 3 + 1] + Math.sin(zeit * 1.1 + p * 1.3) * 0.35;
        positionen[i * 3 + 2] = basis[i * 3 + 2] + Math.cos(zeit * 0.5 + p) * 0.6;
      }
      geometrie.attributes.position.needsUpdate = true;
    },
  };
}

// ---------- Einhorn mit Prinzessin ----------

function baueEinhorn(pferdGltf: GLTF, prinzessinGltf: GLTF, kroneGltf: GLTF) {
  const wurzel = new THREE.Group();

  const pferd = kopie(pferdGltf);
  glaette(pferd);
  const fell = new THREE.MeshPhysicalMaterial({
    color: 0xe9e2f6,
    roughness: 0.42,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xffd8f6),
    sheenRoughness: 0.5,
  });
  const maehne = new THREE.MeshPhysicalMaterial({
    color: 0xff9ae0,
    emissive: 0x9a4dff,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    sheen: 1,
    sheenColor: new THREE.Color(0x9ff6ff),
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffcf4a, metalness: 0.9, roughness: 0.25 });
  for (const mesh of alleMeshes(pferd)) {
    const name = (mesh.material as THREE.Material).name;
    if (name === "Hair") mesh.material = maehne;
    else if (name === "Hooves") mesh.material = gold;
    else if (name === "Muzzle") mesh.material = new THREE.MeshStandardMaterial({ color: 0xffd6e8, roughness: 0.5 });
    else if (name.startsWith("Eye")) mesh.material = new THREE.MeshStandardMaterial({ color: name === "Eye_White" ? 0xffffff : 0x1b1033, roughness: 0.2 });
    else mesh.material = fell;
  }

  // Erst das Pferd allein auf Größe bringen, dann Reiterin, Horn und Krone anhängen
  const halter = new THREE.Group();
  halter.add(pferd);
  // Das Pferdemodell blickt nach +z; gedreht schaut es in Fahrtrichtung (-z)
  aufHoehe(halter, 3.0);
  const dreher = new THREE.Group();
  dreher.add(halter);
  dreher.rotation.y = Math.PI;
  wurzel.add(dreher);
  wurzel.updateMatrixWorld(true);

  const nachVorn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
  const kopf = pferd.getObjectByName("Head")!;
  const horn = new THREE.Mesh(
    new THREE.ConeGeometry(0.07, 0.62, 24, 8),
    new THREE.MeshStandardMaterial({ color: 0xffe9a0, emissive: 0xffb84d, emissiveIntensity: 2.2, metalness: 0.6, roughness: 0.3 }),
  );
  horn.geometry.translate(0, 0.31, 0);
  befestige(
    kopf,
    horn,
    new THREE.Vector3(0, 0.3, -0.32),
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0.8, -0.6).normalize()),
    1,
  );
  const hornSchein = lichtschein(0xffd27a, 0.9, 0.6);
  hornSchein.position.y = 0.45;
  horn.add(hornSchein);

  const reiterin = kopie(prinzessinGltf);
  glaette(reiterin);
  for (const mesh of alleMeshes(reiterin)) {
    const name = (mesh.material as THREE.Material).name;
    mesh.material =
      name === "Dress"
        ? new THREE.MeshPhysicalMaterial({ color: 0xff6fbe, roughness: 0.35, sheen: 1, sheenColor: new THREE.Color(0xffd0f0) })
        : name === "Hair"
          ? new THREE.MeshPhysicalMaterial({ color: 0xffd25e, roughness: 0.4, sheen: 0.8, sheenColor: new THREE.Color(0xfff1b0) })
          : name === "Skin"
            ? new THREE.MeshStandardMaterial({ color: 0xffd3b8, roughness: 0.6 })
            : name === "Shoes"
              ? gold
              : new THREE.MeshStandardMaterial({ color: 0x2a1840 });
  }

  const mixer = new THREE.AnimationMixer(pferd);
  const clip = (name: string) => pferdGltf.animations.find((a) => a.name === name)!;
  const galopp = mixer.clipAction(clip("Gallop"));
  const stehen = mixer.clipAction(clip("Idle"));
  stehen.play();
  const sitzen = mixer.clipAction(
    prinzessinGltf.animations.find((a) => a.name.endsWith("Female_Sitting"))!,
    reiterin,
  );
  sitzen.play();

  // Die Reiterin sitzt auf dem Rücken und schwingt beim Galopp mit
  const ruecken = pferd.getObjectByName("Torso")!;
  befestige(ruecken, reiterin, new THREE.Vector3(), nachVorn, 0.43);
  mixer.update(0);
  const huefte = reiterin.getObjectByName("Hips")!;
  const sattel = ruecken.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.38, -0.75));
  richteAus(ruecken, reiterin, huefte, sattel);

  const krone = kopie(kroneGltf);
  for (const mesh of alleMeshes(krone)) {
    const alt = mesh.material as THREE.MeshStandardMaterial;
    mesh.material =
      alt.color.r > alt.color.g * 1.6
        ? new THREE.MeshStandardMaterial({ color: 0xff3d9a, emissive: 0xff3d9a, emissiveIntensity: 0.8, roughness: 0.2 })
        : gold;
  }
  const reiterKopf = reiterin.getObjectByName("Head")!;
  reiterin.updateMatrixWorld(true);
  befestige(reiterKopf, krone, new THREE.Vector3(0, 0.26, 0), nachVorn, 0.13);

  const zahlPunkt = new THREE.Object3D();
  zahlPunkt.position.set(0, 1.95, 1.45);
  wurzel.add(zahlPunkt);

  return {
    wurzel,
    zahlPunkt,
    horn,
    mixer,
    galopp(an: boolean) {
      const von = an ? stehen : galopp;
      const zu = an ? galopp : stehen;
      zu.reset().play();
      von.crossFadeTo(zu, 0.3, false);
    },
  };
}

// ---------- Hindernisse ----------

function baueBaumstamm(rinde: THREE.MeshStandardMaterial, m: Record<Natur, GLTF>): THREE.Object3D {
  const gruppe = new THREE.Group();
  const material = rinde.clone();
  for (const karte of [material.map, material.normalMap]) {
    if (!karte) continue;
    const kopie = karte.clone();
    kopie.wrapS = kopie.wrapT = THREE.RepeatWrapping;
    kopie.repeat.set(3, 1);
    kopie.needsUpdate = true;
    if (karte === material.map) material.map = kopie;
    else material.normalMap = kopie;
  }
  const stamm = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 5.2, 28, 1), material);
  stamm.rotation.z = Math.PI / 2;
  stamm.rotation.y = 0.12;
  stamm.position.y = 0.62;
  gruppe.add(stamm);
  const schnitt = new THREE.MeshStandardMaterial({ color: 0xc9a27a, roughness: 0.9 });
  for (const seite of [-1, 1]) {
    const scheibe = new THREE.Mesh(new THREE.CircleGeometry(seite < 0 ? 0.72 : 0.62, 28), schnitt);
    scheibe.position.set(seite * 2.6, 0.62, -seite * 0.3);
    scheibe.rotation.y = (seite * Math.PI) / 2 + 0.12;
    gruppe.add(scheibe);
  }
  const zufall = festerZufall(3);
  for (let i = 0; i < 5; i++) {
    const pilz = aufHoehe(kopie(m.Mushroom_Common), 0.35 + zufall() * 0.25);
    pilz.position.set(-1.8 + i * 0.9, 1.15, (zufall() - 0.5) * 0.4);
    leuchtePilz(pilz, new THREE.Color(i % 2 ? 0x3ff2ff : 0xff5fd8));
    gruppe.add(pilz);
  }
  for (const x of [-2.2, 2.0]) {
    const farn = aufHoehe(kopie(m.Fern_1), 1.1);
    farn.position.set(x, 0, 0.6);
    gruppe.add(farn);
  }
  return gruppe;
}

function baueFelsen(m: Record<Natur, GLTF>): THREE.Object3D {
  const gruppe = new THREE.Group();
  const gross = aufHoehe(kopie(m.Rock_Medium_3), 2.4);
  gross.scale.x *= 1.25;
  gruppe.add(gross);
  const klein = aufHoehe(kopie(m.Rock_Medium_1), 1.1);
  klein.position.set(1.4, 0, 0.9);
  gruppe.add(klein);
  const pilz = aufHoehe(kopie(m.Mushroom_Laetiporus), 0.6);
  pilz.position.set(-1.2, 0.1, 0.9);
  leuchtePilz(pilz, new THREE.Color(0xffa83f));
  gruppe.add(pilz);
  const moos = aufHoehe(kopie(m.Clover_1), 0.3);
  moos.position.set(-0.6, 0, 1.2);
  gruppe.add(moos);
  return gruppe;
}

function baueDornen(m: Record<Natur, GLTF>): THREE.Object3D {
  const gruppe = new THREE.Group();
  const dunkel = new THREE.Color(0x6a3a8a);
  for (const [x, z, h] of [
    [-1.3, 0, 1.9],
    [0.2, -0.3, 2.3],
    [1.5, 0.1, 1.8],
  ] as const) {
    const busch = aufHoehe(kopie(m.Bush_Common), h);
    busch.position.set(x, 0, z);
    for (const mesh of alleMeshes(busch)) {
      const neu = (mesh.material as THREE.MeshStandardMaterial).clone();
      neu.color.copy(dunkel);
      mesh.material = neu;
    }
    gruppe.add(busch);
  }
  const beere = new THREE.MeshStandardMaterial({ color: 0xff3dd2, emissive: 0xff3dd2, emissiveIntensity: 2 });
  const zufall = festerZufall(9);
  for (let i = 0; i < 18; i++) {
    const kugel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), beere);
    kugel.position.set((zufall() - 0.5) * 3.8, 0.4 + zufall() * 1.6, 0.6 + zufall() * 0.4);
    gruppe.add(kugel);
  }
  return gruppe;
}

// ---------- Lösungsmarke ----------

function baueLeuchtkugel(): THREE.Object3D {
  const gruppe = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xffe08a });
  const kern = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 16), material);
  const schein = lichtschein(0xffc85a, 3.2, 0.9);
  gruppe.add(kern, schein);
  const start = Math.random() * 10;
  gruppe.onBeforeRender = () => {
    kern.position.y = Math.sin(performance.now() / 500 + start) * 0.12;
  };
  kern.onBeforeRender = gruppe.onBeforeRender;
  gruppe.userData.markiere = (art: "richtig" | "falsch") => {
    const farbe = art === "richtig" ? 0x5dffa8 : 0xff4d6a;
    material.color.set(farbe);
    schein.material.color.set(farbe);
    schein.scale.setScalar(4.2);
  };
  return gruppe;
}
