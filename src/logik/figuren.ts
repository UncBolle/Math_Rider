export type Figur = "rakete" | "prinzessin";

export const FIGUREN: readonly Figur[] = ["rakete", "prinzessin"];

// Hindernisse je Figur, passend zu ihrem Thema (Weltraum, Märchenwald).
// Neue passende Hindernisse dürfen hier ergänzt werden, siehe SPIELDESIGN.md;
// ihr 3D-Modell entsteht in ansicht/weltraum3d.ts bzw. ansicht/maerchenwald3d.ts.
export const HINDERNISSE: Record<Figur, readonly string[]> = {
  rakete: ["asteroid", "schwarzesLoch", "komet"],
  prinzessin: ["baumstamm", "felsen", "dornen"],
};
