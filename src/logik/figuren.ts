export type Figur = "rakete" | "prinzessin";

export const FIGUREN: readonly Figur[] = ["rakete", "prinzessin"];

// Hindernisse je Figur, passend zu ihrem Thema (Weltraum, Märchenland).
// Neue passende Hindernisse dürfen hier ergänzt werden, siehe SPIELDESIGN.md.
export const HINDERNISSE: Record<Figur, readonly string[]> = {
  rakete: ["schwarzesLoch", "asteroid"],
  prinzessin: ["hecke", "graben"],
};
