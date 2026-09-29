import { describe, expect, it } from "vitest";
import { localSupportPrograms } from "./localSupport";

describe("local support program evidence", () => {
  it("keeps program ids unique and sources current", () => {
    const ids = localSupportPrograms.map((program) => program.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const program of localSupportPrograms) {
      expect(program.sourceUrl).toMatch(/^https:\/\//);
      expect(program.currentAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("does not represent structure-dependent funding as a current HarbourCart benefit", () => {
    const strategic = localSupportPrograms.find(
      (program) => program.id === "strategic-funding-initiatives-2026",
    );
    expect(strategic?.status).toBe("STRUCTURE_DEPENDENT");
  });

  it("marks closed agriculture intakes as closed rather than available funding", () => {
    for (const id of [
      "planning-new-opportunities-2026",
      "market-opportunities-diversification-2026",
      "local-food-security-initiatives-2026",
    ]) {
      expect(
        localSupportPrograms.find((program) => program.id === id)?.status,
      ).toBe("CLOSED_INTAKE");
    }
  });

  it("keeps the farm-only Get Growing program out of HarbourCart direct economics", () => {
    expect(
      localSupportPrograms.find(
        (program) => program.id === "get-growing-2026",
      )?.status,
    ).toBe("NOT_HARBOURCART_DIRECT");
  });
});
