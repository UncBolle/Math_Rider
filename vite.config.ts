import { defineConfig } from "vite";

export default defineConfig({
  // Relative Pfade: die Seite läuft so lokal und unter https://uncbolle.github.io/Math_Rider/
  base: "./",
  build: {
    // Three.js allein ist gut 600 kB groß; das ist für ein 3D-Spiel erwartet
    chunkSizeWarningLimit: 900,
  },
});
