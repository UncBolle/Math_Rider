import { describe, expect, it } from "vitest";

// Prüft nur, dass Vitest läuft; wird mit T2 ersetzt
describe("Testumgebung", () => {
  it("rechnet", () => {
    expect(5 + 12).toBe(17);
  });
});
