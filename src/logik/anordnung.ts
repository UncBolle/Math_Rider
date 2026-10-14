import type { Zufall } from "./zufall";

export type Seite = "links" | "rechts";

export interface Anordnung {
  links: number;
  rechts: number;
  richtigeSeite: Seite;
}

export function andereSeite(seite: Seite): Seite {
  return seite === "links" ? "rechts" : "links";
}

export function ordneLoesungenAn(richtig: number, falsch: number, zufall: Zufall): Anordnung {
  return zufall() < 0.5
    ? { links: richtig, rechts: falsch, richtigeSeite: "links" }
    : { links: falsch, rechts: richtig, richtigeSeite: "rechts" };
}
