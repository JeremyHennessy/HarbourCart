import { describe, expect, it } from "vitest";
import {
  activePriceTier,
  contributionPerOrder,
  evaluateCandidate,
  nextPriceTier,
  structuralSpread,
} from "./economics";

describe("HarbourCart economics", () => {
  it("calculates the Roma tomato public structural spread", () => {
    const spread = structuralSpread(
      { price: 6.61, quantity: 1 },
      { price: 3.08, quantity: 1 },
    );
    expect(spread).toBeCloseTo(0.5340, 3);
  });

  it("preserves the original $80 basket contribution model", () => {
    const contribution = contributionPerOrder({
      comparableRetail: 80,
      customerSavingsRate: 0.15,
      procurementRateOfRetail: 0.7,
      labourMinutes: 4,
      labourHourlyRate: 17,
      packagingCost: 0.75,
      shrinkRate: 0.01,
    });
    expect(contribution).toBeCloseTo(7.2847, 3);
  });

  it("selects active and next price tiers from household demand", () => {
    const tiers = [
      { minimumHouseholds: 1, customerPrice: 12 },
      { minimumHouseholds: 50, customerPrice: 10 },
      { minimumHouseholds: 100, customerPrice: 9 },
    ];
    expect(activePriceTier(tiers, 67).customerPrice).toBe(10);
    expect(nextPriceTier(tiers, 67)?.minimumHouseholds).toBe(100);
  });

  it("blocks structurally attractive products without evidence", () => {
    const result = evaluateCandidate({
      comparableRetail: 20,
      procurementCost: 10,
      targetSavingsRate: 0.15,
      customerPriceOverride: 16,
      labourMinutes: 2,
      labourHourlyRate: 17,
      packagingCost: 0.5,
      shrinkRate: 0.01,
      freightCost: 0.25,
      handlingStatus: "CONFIRMED_PHASE_1",
      measurementStatus: "NOT_REQUIRED",
      supplierEvidence: "CURRENT_PUBLIC",
      benchmarkEvidence: "CURRENT_PUBLIC",
    });

    expect(result.contribution).toBeGreaterThan(0);
    expect(result.decision).toBe("BLOCKED");
    expect(result.decisionReasons.join(" ")).toMatch(/supplier quote/i);
    expect(result.decisionReasons.join(" ")).toMatch(/Halifax retail comparator/i);
  });

  it("publishes only when economics and all evidence gates pass", () => {
    const result = evaluateCandidate({
      comparableRetail: 20,
      procurementCost: 8,
      targetSavingsRate: 0.15,
      customerPriceOverride: 16,
      labourMinutes: 2,
      labourHourlyRate: 17,
      packagingCost: 0.5,
      shrinkRate: 0.01,
      freightCost: 0.25,
      handlingStatus: "CONFIRMED_PHASE_1",
      measurementStatus: "NOT_REQUIRED",
      supplierEvidence: "VERIFIED_QUOTE",
      benchmarkEvidence: "CURRENT_LOCAL",
      minimumSavingsRate: 0.15,
      minimumContribution: 5,
    });

    expect(result.savingsRate).toBeCloseTo(0.2, 3);
    expect(result.contribution).toBeGreaterThan(5);
    expect(result.decision).toBe("PUBLISH");
  });

  it("rejects a verified buy that loses money", () => {
    const result = evaluateCandidate({
      comparableRetail: 20,
      procurementCost: 18,
      targetSavingsRate: 0.15,
      customerPriceOverride: 16,
      labourMinutes: 4,
      labourHourlyRate: 17,
      packagingCost: 0.75,
      shrinkRate: 0.01,
      freightCost: 0.5,
      handlingStatus: "CONFIRMED_PHASE_1",
      measurementStatus: "NOT_REQUIRED",
      supplierEvidence: "VERIFIED_QUOTE",
      benchmarkEvidence: "CURRENT_LOCAL",
    });

    expect(result.contribution).toBeLessThan(0);
    expect(result.decision).toBe("REJECT");
  });

  it("blocks a product whose handling class is not phase-1 confirmed", () => {
    const result = evaluateCandidate({
      comparableRetail: 30,
      procurementCost: 12,
      targetSavingsRate: 0.15,
      customerPriceOverride: 24,
      labourMinutes: 2,
      labourHourlyRate: 17,
      packagingCost: 0.5,
      shrinkRate: 0.01,
      freightCost: 0.25,
      handlingStatus: "REQUIRES_CONFIRMATION",
      measurementStatus: "NOT_REQUIRED",
      supplierEvidence: "VERIFIED_QUOTE",
      benchmarkEvidence: "CURRENT_LOCAL",
    });

    expect(result.decision).toBe("BLOCKED");
    expect(result.decisionReasons.join(" ")).toMatch(/regulatory confirmation/i);
  });

  it("blocks an otherwise publishable weighed share until legal-for-trade measurement is resolved", () => {
    const result = evaluateCandidate({
      comparableRetail: 30,
      procurementCost: 10,
      targetSavingsRate: 0.15,
      customerPriceOverride: 24,
      labourMinutes: 2,
      labourHourlyRate: 17,
      packagingCost: 0.5,
      shrinkRate: 0.01,
      freightCost: 0.25,
      handlingStatus: "CONFIRMED_PHASE_1",
      measurementStatus: "TRADE_SCALE_REQUIRED",
      supplierEvidence: "VERIFIED_QUOTE",
      benchmarkEvidence: "CURRENT_LOCAL",
      minimumSavingsRate: 0.15,
      minimumContribution: 5,
    });

    expect(result.contribution).toBeGreaterThan(5);
    expect(result.decision).toBe("BLOCKED");
    expect(result.decisionReasons.join(" ")).toMatch(/Measurement Canada/i);
  });
});
