import { describe, expect, it } from "vitest";
import { demandIdeas, pilotCandidates } from "./pilot";
import { structuralSpread } from "../domain/economics";

describe("pilot research data", () => {
  it("has unique candidate ids and a pilot-sized catalogue", () => {
    const ids = pilotCandidates.map((candidate) => candidate.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(pilotCandidates.length).toBeGreaterThanOrEqual(12);
    expect(demandIdeas.length).toBeGreaterThanOrEqual(10);
  });

  it("keeps every candidate tied to dated evidence", () => {
    for (const candidate of pilotCandidates) {
      expect(candidate.sourceUrl).toMatch(/^https:\/\//);
      expect(candidate.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(candidate.publicReferenceUnitPrice).toBeGreaterThan(0);
      expect(candidate.publicCaseUnitPrice).toBeGreaterThan(0);
      expect(candidate.householdQuantity).toBeGreaterThan(0);
      expect(["COUNT", "WEIGHED_SHARE", "SEALED_PACK"]).toContain(
        candidate.saleBasis,
      );
      if (candidate.saleBasis === "WEIGHED_SHARE") {
        expect(candidate.measurementStatus).toBe("TRADE_SCALE_REQUIRED");
      } else {
        expect(candidate.measurementStatus).toBe("NOT_REQUIRED");
      }
    }
  });

  it("prioritizes multiple candidates that avoid HarbourCart trade weighing", () => {
    expect(
      pilotCandidates.filter(
        (candidate) =>
          candidate.saleBasis === "COUNT" ||
          candidate.saleBasis === "SEALED_PACK",
      ).length,
    ).toBeGreaterThanOrEqual(6);
  });

  it("does not represent public structural screens as verified supplier quotes", () => {
    for (const candidate of pilotCandidates) {
      expect(candidate.supplierEvidence).not.toBe("VERIFIED_QUOTE");
    }
  });

  it("contains positive and negative controls for bulk economics", () => {
    const spreads = pilotCandidates.map((candidate) =>
      structuralSpread(
        { price: candidate.publicReferenceUnitPrice, quantity: 1 },
        { price: candidate.publicCaseUnitPrice, quantity: 1 },
      ),
    );
    expect(Math.max(...spreads)).toBeGreaterThan(0.4);
    expect(Math.min(...spreads)).toBeLessThan(0.15);
  });
});
