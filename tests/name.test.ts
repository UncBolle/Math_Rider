import { describe, expect, it } from "vitest";
import { pruefeName } from "../src/logik/name";

describe("T8: Name prüfen", () => {
  it("N-01: Leerzeichen am Rand werden entfernt", () => {
    expect(pruefeName("  Lena  ")).toBe("Lena");
  });

  it("N-02: leerer Name oder nur Leerzeichen wird abgelehnt", () => {
    expect(pruefeName("")).toBeNull();
    expect(pruefeName("    ")).toBeNull();
  });

  it("N-03: 20 Zeichen sind erlaubt, 21 nicht", () => {
    expect(pruefeName("a".repeat(20))).toBe("a".repeat(20));
    expect(pruefeName("a".repeat(21))).toBeNull();
  });

  it("N-04: Umlaute und ß bleiben unverändert", () => {
    expect(pruefeName("Jürgen")).toBe("Jürgen");
    expect(pruefeName("Groß")).toBe("Groß");
  });
});
