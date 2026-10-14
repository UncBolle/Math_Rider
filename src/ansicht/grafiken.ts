import type { Figur } from "../logik/figuren";
import prinzessin from "../grafiken/prinzessin.png";
import rakete from "../grafiken/rakete.png";

export type Thema = "weltraum" | "maerchenwald";

export const FIGUR_BILD: Record<Figur, string> = { rakete, prinzessin };

export const FIGUR_NAME: Record<Figur, string> = {
  rakete: "Rakete",
  prinzessin: "Prinzessin auf dem Einhorn",
};

export const FIGUR_THEMA: Record<Figur, Thema> = {
  rakete: "weltraum",
  prinzessin: "maerchenwald",
};
