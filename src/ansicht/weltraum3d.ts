import * as THREE from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import { alleMeshes, aufHoehe, festerZufall, kopie, ladeModell, lichtschein, weichesLicht } from "./modelle3d";
import { ladeAlles, type ThemaSzene } from "./welt3d";

// Freier Flug durch den Weltraum: Nebel, Sterne, Planeten und vorbeirauschender Sternenstaub.
// Die Rakete ist direkt in Three.js gebaut.

export async function baueWeltraum(szene: THREE.Scene, fortschritt: (anteil: number) => void): Promise<ThemaSzene> {
  const steine = await ladeAlles(
    ["Rock_Medium_1", "Rock_Medium_2", "Rock_Medium_3"].map((n) => ladeModell(`natur/${n}.gltf`)),
    fortschritt,
  );

  baueHimmel(szene);
  baueLicht(szene);
  const staub = baueSternenstaub(szene);
  const rakete = baueRakete();
  const zeitUniform = { value: 0 };

  let faehrt = false;
  let schub = 0;
  let neigung = 0;

  return {
    figur: rakete.wurzel,
    zahlPunkt: rakete.zahlPunkt,

    erzeugeHindernis(name) {
      if (name === "schwarzesLoch") return baueSchwarzesLoch(zeitUniform);
      if (name === "komet") return baueKomet(steine, zeitUniform);
      return baueAsteroid(steine);
    },

    erzeugeLoesungsMarke() {
      return bauePortal();
    },

    bewegeKulisse(dz) {
      staub.verschiebe(dz);
    },

    setzeFahrt(an) {
      faehrt = an;
    },

    aktualisiere(dt, zeit) {
      zeitUniform.value = zeit;
      schub = THREE.MathUtils.lerp(schub, faehrt ? 1 : 0.35, Math.min(1, dt * 4));
      rakete.aktualisiere(zeit, schub, neigung);
      staub.aktualisiere(schub);
    },

    neige(richtung) {
      neigung = richtung;
    },
  };
}

// ---------- Himmel ----------

function baueHimmel(szene: THREE.Scene) {
  szene.background = new THREE.Color(0x02030c);

  const kuppel = new THREE.Mesh(
    new THREE.SphereGeometry(450, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `varying vec3 vRichtung;
        void main() { vRichtung = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vRichtung;
        float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float rauschen(vec3 x) {
          vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
        }
        float fbm(vec3 p) { float s = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { s += a * rauschen(p); p *= 2.03; a *= 0.5; } return s; }
        void main() {
          vec3 r = normalize(vRichtung);
          float n1 = fbm(r * 2.6 + vec3(3.1, 0.0, 1.7));
          float n2 = fbm(r * 4.2 + vec3(-2.0, 5.0, 0.3));
          vec3 farbe = vec3(0.006, 0.008, 0.03);
          farbe += vec3(0.45, 0.12, 0.62) * smoothstep(0.5, 0.9, n1) * 0.5;
          farbe += vec3(0.05, 0.42, 0.62) * smoothstep(0.55, 0.92, n2) * 0.45;
          farbe += vec3(0.9, 0.3, 0.45) * pow(smoothstep(0.6, 0.95, n1 * n2 * 1.6), 2.0) * 0.35;
          // helles Band hinter der Flugbahn
          farbe += vec3(0.25, 0.18, 0.5) * pow(max(0.0, 1.0 - abs(r.y + r.z * 0.15) * 2.4), 3.0) * 0.5;
          gl_FragColor = vec4(farbe, 1.0);
        }`,
    }),
  );
  szene.add(kuppel);

  const zufall = festerZufall(11);
  for (const [anzahl, groesse, hell] of [
    [2200, 0.9, 0.85],
    [260, 2.6, 1],
  ] as const) {
    const punkte: number[] = [];
    const farben: number[] = [];
    for (let i = 0; i < anzahl; i++) {
      const v = new THREE.Vector3(zufall() - 0.5, zufall() - 0.5, zufall() - 0.5).normalize().multiplyScalar(400);
      punkte.push(v.x, v.y, v.z);
      const c = new THREE.Color().setHSL(0.55 + zufall() * 0.2, 0.6, 0.75 + zufall() * 0.25);
      farben.push(c.r * hell, c.g * hell, c.b * hell);
    }
    const geometrie = new THREE.BufferGeometry()
      .setAttribute("position", new THREE.Float32BufferAttribute(punkte, 3))
      .setAttribute("color", new THREE.Float32BufferAttribute(farben, 3));
    szene.add(
      new THREE.Points(
        geometrie,
        new THREE.PointsMaterial({
          size: groesse,
          sizeAttenuation: false,
          vertexColors: true,
          map: weichesLicht(),
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      ),
    );
  }

  // Großer Planet links, Ringplanet rechts
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(55, 64, 32),
    new THREE.MeshStandardMaterial({ color: 0x6b4fc4, roughness: 0.85, emissive: 0x1a0d3a, emissiveIntensity: 0.15 }),
  );
  planet.position.set(-230, 70, -420);
  szene.add(planet);
  const atmosphaere = lichtschein(0x8a6bff, 150, 0.3);
  atmosphaere.position.copy(planet.position);
  szene.add(atmosphaere);

  const ringplanet = new THREE.Group();
  const kugel = new THREE.Mesh(
    new THREE.SphereGeometry(22, 48, 24),
    new THREE.MeshStandardMaterial({ color: 0xffa36b, roughness: 0.8, emissive: 0x401608, emissiveIntensity: 0.6 }),
  );
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(30, 46, 96),
    new THREE.MeshBasicMaterial({ color: 0xffd2a8, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  ring.rotation.x = 1.25;
  ringplanet.add(kugel, ring);
  ringplanet.rotation.z = 0.35;
  ringplanet.position.set(190, 95, -380);
  szene.add(ringplanet);
}

function baueLicht(szene: THREE.Scene) {
  szene.add(new THREE.HemisphereLight(0x7d8cff, 0x1a0830, 0.75));
  const sonne = new THREE.DirectionalLight(0xfff0e0, 2.0);
  sonne.position.set(7, 9, 6);
  szene.add(sonne);
  const kante = new THREE.DirectionalLight(0x6fe2ff, 2.8);
  kante.position.set(-8, 3, -12);
  szene.add(kante);
  const pink = new THREE.DirectionalLight(0xff5fb8, 1.4);
  pink.position.set(9, -2, -6);
  szene.add(pink);
}

function baueSternenstaub(szene: THREE.Scene) {
  const anzahl = 700;
  const zufall = festerZufall(5);
  const basis = new Float32Array(anzahl * 3);
  for (let i = 0; i < anzahl; i++) {
    basis[i * 3] = (zufall() - 0.5) * 60;
    basis[i * 3 + 1] = (zufall() - 0.5) * 34 + 2;
    basis[i * 3 + 2] = 10 - zufall() * 160;
  }
  // Jedes Staubkorn ist ein kurzer Strich, der beim schnellen Flug länger wird
  const linien = new Float32Array(anzahl * 6);
  const geometrie = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(linien, 3));
  const material = new THREE.LineBasicMaterial({
    color: 0xbfe6ff,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  szene.add(new THREE.LineSegments(geometrie, material));
  let tempo = 0;
  return {
    verschiebe(dz: number) {
      tempo = Math.max(tempo, Math.abs(dz));
      for (let i = 0; i < anzahl; i++) {
        basis[i * 3 + 2] += dz;
        if (basis[i * 3 + 2] > 12) basis[i * 3 + 2] -= 160;
      }
    },
    aktualisiere(schub: number) {
      const laenge = 0.15 + Math.min(6, tempo * 1.4);
      tempo *= 0.8;
      for (let i = 0; i < anzahl; i++) {
        const [x, y, z] = [basis[i * 3], basis[i * 3 + 1], basis[i * 3 + 2]];
        linien.set([x, y, z, x, y, z - laenge], i * 6);
      }
      material.opacity = 0.35 + schub * 0.45;
      geometrie.attributes.position.needsUpdate = true;
    },
  };
}

// ---------- Rakete ----------

function drehkoerper(profil: [number, number][], material: THREE.Material, segmente = 64): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.LatheGeometry(
      profil.map(([r, y]) => new THREE.Vector2(r, y)),
      segmente,
    ),
    material,
  );
}

function flammenMaterial(innen: THREE.ColorRepresentation, aussen: THREE.ColorRepresentation, zeit: { value: number }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { zeit, innen: { value: new THREE.Color(innen) }, aussen: { value: new THREE.Color(aussen) } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform float zeit; uniform vec3 innen; uniform vec3 aussen; varying vec2 vUv;
      void main() {
        float laengs = vUv.y;
        float flackern = 0.85 + 0.15 * sin(zeit * 40.0 + vUv.x * 30.0);
        vec3 farbe = mix(aussen, innen, smoothstep(0.2, 1.0, laengs));
        float alpha = smoothstep(0.0, 0.7, laengs) * flackern;
        gl_FragColor = vec4(farbe * 0.7, alpha * 0.5);
      }`,
  });
}

function baueRakete() {
  const wurzel = new THREE.Group();
  const koerper = new THREE.Group();
  const zeit = { value: 0 };

  const weiss = new THREE.MeshPhysicalMaterial({ color: 0xc9d0dc, roughness: 0.38, metalness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.3 });
  const rot = new THREE.MeshPhysicalMaterial({ color: 0xe8203f, roughness: 0.28, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.1 });
  const metall = new THREE.MeshStandardMaterial({ color: 0x8f98ad, roughness: 0.28, metalness: 1 });
  const dunkel = new THREE.MeshStandardMaterial({ color: 0x2b3042, roughness: 0.35, metalness: 0.9 });

  koerper.add(
    drehkoerper(
      [
        [0, 0],
        [0.46, 0],
        [0.54, 0.12],
        [0.6, 0.55],
        [0.61, 1.3],
        [0.57, 1.95],
        [0.5, 2.3],
      ],
      weiss,
    ),
  );
  koerper.add(
    drehkoerper(
      [
        [0.5, 2.3],
        [0.42, 2.62],
        [0.3, 2.9],
        [0.16, 3.1],
        [0.05, 3.2],
        [0, 3.22],
      ],
      rot,
    ),
  );
  for (const [y, r] of [
    [0.32, 0.585],
    [2.18, 0.535],
  ]) {
    const streifen = new THREE.Mesh(new THREE.TorusGeometry(r, 0.045, 12, 64), rot);
    streifen.rotation.x = Math.PI / 2;
    streifen.position.y = y;
    koerper.add(streifen);
  }

  // Bullaugen auf der Oberseite
  const glas = new THREE.MeshPhysicalMaterial({
    color: 0x7fe8ff,
    emissive: 0x2bbcff,
    emissiveIntensity: 0.9,
    roughness: 0.05,
    clearcoat: 1,
  });
  for (const y of [1.15, 1.7]) {
    const fenster = new THREE.Group();
    const rahmen = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.04, 12, 32), metall);
    const scheibe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), glas);
    scheibe.rotation.x = Math.PI / 2;
    scheibe.scale.z = 0.35;
    fenster.add(rahmen, scheibe);
    fenster.position.set(0, y, 0.6);
    koerper.add(fenster);
  }

  // Vier Flossen in X-Form
  const flossenForm = new THREE.Shape();
  flossenForm.moveTo(0, 0);
  flossenForm.lineTo(0.55, -0.35);
  flossenForm.lineTo(0.62, -0.05);
  flossenForm.quadraticCurveTo(0.35, 0.55, 0, 1.0);
  const flossenGeometrie = new THREE.ExtrudeGeometry(flossenForm, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 3,
  });
  flossenGeometrie.translate(0, 0, -0.035);
  for (let i = 0; i < 4; i++) {
    const flosse = new THREE.Mesh(flossenGeometrie, rot);
    const halter = new THREE.Group();
    flosse.position.set(0.52, 0.1, 0);
    halter.add(flosse);
    halter.rotation.y = Math.PI / 4 + (i * Math.PI) / 2;
    koerper.add(halter);
  }

  // Triebwerk
  koerper.add(
    drehkoerper(
      [
        [0.3, 0.02],
        [0.33, -0.12],
        [0.42, -0.32],
        [0.38, -0.34],
        [0.28, -0.16],
        [0.22, 0.0],
      ],
      dunkel,
    ),
  );
  const flamme = new THREE.Mesh(new THREE.ConeGeometry(0.36, 1.8, 32, 1, true), flammenMaterial(0xfff6d0, 0xff5a1f, zeit));
  flamme.rotation.x = Math.PI;
  flamme.position.y = -1.2;
  koerper.add(flamme);
  const kern = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.0, 24, 1, true), flammenMaterial(0xbff4ff, 0x3f9dff, zeit));
  kern.rotation.x = Math.PI;
  kern.position.y = -0.8;
  koerper.add(kern);
  const glut = lichtschein(0xff8a3d, 1.0, 0.4);
  glut.position.y = -0.45;
  koerper.add(glut);

  // Spitze zeigt nach vorn (-z), das Triebwerk zur Kamera
  koerper.rotation.x = -Math.PI / 2 - 0.3;
  const halter = new THREE.Group();
  halter.add(koerper);
  halter.position.set(0, 1.0, 1.6);
  halter.scale.setScalar(1.45);
  wurzel.add(halter);

  const zahlPunkt = new THREE.Object3D();
  zahlPunkt.position.set(0, 0.55, -1.2);
  halter.add(zahlPunkt);

  return {
    wurzel,
    zahlPunkt,
    aktualisiere(t: number, schub: number, neigung: number) {
      zeit.value = t;
      halter.position.y = 1.0 + Math.sin(t * 2.2) * 0.08;
      halter.rotation.z = THREE.MathUtils.lerp(halter.rotation.z, -neigung * 0.5, 0.15);
      const l = 0.45 + schub * 0.55 + Math.sin(t * 30) * 0.05;
      flamme.scale.set(1, l, 1);
      flamme.position.y = -0.3 - 0.9 * l;
      kern.scale.set(1, l, 1);
      kern.position.y = -0.3 - 0.5 * l;
      glut.material.opacity = 0.3 + schub * 0.3;
    },
  };
}

// ---------- Hindernisse ----------

function steinKopie(steine: GLTF[], nummer: number, farbe: number, hoehe: number): THREE.Object3D {
  const stein = aufHoehe(kopie(steine[nummer % steine.length]), hoehe);
  for (const mesh of alleMeshes(stein)) {
    const neu = (mesh.material as THREE.MeshStandardMaterial).clone();
    neu.color.set(farbe);
    neu.roughness = 0.85;
    mesh.material = neu;
  }
  return stein;
}

function baueAsteroid(steine: GLTF[]): THREE.Object3D {
  const gruppe = new THREE.Group();
  const gross = steinKopie(steine, 2, 0xc4a99a, 3.6);
  const halter = new THREE.Group();
  halter.add(gross);
  gross.position.y -= 1.7;
  halter.position.y = 2.0;
  gruppe.add(halter);
  const zufall = festerZufall(Math.floor(Math.random() * 1000));
  const brocken: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) {
    const klein = steinKopie(steine, i, 0x9d92b3, 0.3 + zufall() * 0.4);
    const bahn = new THREE.Group();
    klein.position.set(2.2 + zufall() * 0.8, (zufall() - 0.5) * 1.6, 0);
    bahn.add(klein);
    bahn.rotation.y = zufall() * Math.PI * 2;
    bahn.position.y = 2.0;
    gruppe.add(bahn);
    brocken.push(bahn);
  }
  // Langsames Taumeln; wird vor jedem Zeichnen des großen Brockens gesetzt
  const drehen = () => {
    const t = performance.now() / 1000;
    halter.rotation.set(t * 0.25, t * 0.35, 0);
    brocken.forEach((b, i) => (b.rotation.y = t * (0.4 + i * 0.07)));
  };
  for (const mesh of alleMeshes(gross)) mesh.onBeforeRender = drehen;
  return gruppe;
}

function baueKomet(steine: GLTF[], zeit: { value: number }): THREE.Object3D {
  const gruppe = new THREE.Group();
  const kern = steinKopie(steine, 1, 0xd8f2ff, 2.2);
  for (const mesh of alleMeshes(kern)) {
    const m = mesh.material as THREE.MeshStandardMaterial;
    m.emissive = new THREE.Color(0x2aa6ff);
    m.emissiveIntensity = 0.5;
  }
  kern.position.y = 1.0;
  gruppe.add(kern);
  const koma = lichtschein(0x7fe6ff, 5.5, 0.9);
  koma.position.y = 2.1;
  gruppe.add(koma);
  // Schweif nach oben hinten
  const schweif = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 9, 32, 1, true),
    flammenMaterial(0xe6fbff, 0x2f7dff, zeit),
  );
  schweif.position.set(0, 3.6, -3.4);
  schweif.rotation.x = Math.PI - 0.9;
  gruppe.add(schweif);
  return gruppe;
}

function baueSchwarzesLoch(zeit: { value: number }): THREE.Object3D {
  const gruppe = new THREE.Group();
  const mitte = new THREE.Group();
  mitte.position.y = 2.3;
  gruppe.add(mitte);

  mitte.add(new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 24), new THREE.MeshBasicMaterial({ color: 0x000000 })));
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.22, 0.05, 16, 96),
    new THREE.MeshBasicMaterial({ color: 0xffd9a0 }),
  );
  mitte.add(ring);

  const scheibe = new THREE.Mesh(
    new THREE.RingGeometry(1.35, 4.4, 160, 1),
    new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { zeit },
      vertexShader: `varying vec2 vPos; void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float zeit; varying vec2 vPos;
        void main() {
          float r = length(vPos);
          float w = atan(vPos.y, vPos.x);
          float t = (r - 1.35) / 3.05;
          float wirbel = 0.6 + 0.4 * sin(w * 7.0 - zeit * 3.0 + r * 4.0) * sin(w * 3.0 + zeit * 1.7 - r * 2.0);
          vec3 heiss = vec3(1.0, 0.95, 0.8);
          vec3 orange = vec3(1.0, 0.5, 0.15);
          vec3 pink = vec3(0.9, 0.15, 0.6);
          vec3 farbe = mix(heiss, orange, smoothstep(0.0, 0.35, t));
          farbe = mix(farbe, pink, smoothstep(0.35, 1.0, t));
          float alpha = (1.0 - smoothstep(0.55, 1.0, t)) * smoothstep(0.0, 0.04, t) * wirbel;
          gl_FragColor = vec4(farbe * 1.7, alpha);
        }`,
    }),
  );
  scheibe.rotation.x = -1.25;
  mitte.add(scheibe);
  mitte.add(lichtschein(0xff6fb8, 11, 0.55));
  mitte.add(lichtschein(0xffb35c, 5, 0.6));
  scheibe.onBeforeRender = () => {
    scheibe.rotation.z = zeit.value * 0.4;
  };
  return gruppe;
}

// ---------- Lösungsmarke ----------

function bauePortal(): THREE.Object3D {
  const gruppe = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0x45f0ff });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.07, 16, 96), material);
  const innen = new THREE.Mesh(
    new THREE.CircleGeometry(1.0, 48),
    new THREE.MeshBasicMaterial({ color: 0x1a6dff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  const schein = lichtschein(0x45f0ff, 3.6, 0.5);
  gruppe.add(innen, ring, schein);
  ring.onBeforeRender = () => {
    const t = performance.now() / 1000;
    ring.rotation.z = t * 0.8;
    ring.scale.setScalar(1 + Math.sin(t * 3) * 0.03);
  };
  gruppe.userData.markiere = (art: "richtig" | "falsch") => {
    const farbe = art === "richtig" ? 0x5dffa8 : 0xff4d6a;
    material.color.set(farbe);
    schein.material.color.set(farbe);
    (innen.material as THREE.MeshBasicMaterial).color.set(farbe);
  };
  return gruppe;
}
