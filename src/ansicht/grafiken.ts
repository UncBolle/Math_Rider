import type { Figur } from "../logik/figuren";
import asteroid from "../grafiken/asteroid.svg";
import graben from "../grafiken/graben.svg";
import hecke from "../grafiken/hecke.svg";
import prinzessin from "../grafiken/prinzessin.svg";
import rakete from "../grafiken/rakete.svg";
import schwarzesLoch from "../grafiken/schwarzesLoch.svg";
import type { Thema } from "./kulisse";

export const FIGUR_BILD: Record<Figur, string> = { rakete, prinzessin };

export const FIGUR_NAME: Record<Figur, string> = {
  rakete: "Rakete",
  prinzessin: "Prinzessin auf dem Einhorn",
};

export const FIGUR_THEMA: Record<Figur, Thema> = {
  rakete: "weltraum",
  prinzessin: "maerchenland",
};

// Ein neues Hindernis braucht einen Eintrag in logik/figuren.ts und hier ein Bild
export const HINDERNIS_BILD: Record<string, string> = { schwarzesLoch, asteroid, hecke, graben };

export const HINDERNIS_NAME: Record<string, string> = {
  schwarzesLoch: "Schwarzes Loch",
  asteroid: "Asteroid",
  hecke: "Hecke",
  graben: "Graben",
};
