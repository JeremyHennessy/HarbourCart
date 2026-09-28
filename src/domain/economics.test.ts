import { describe, expect, it } from "vitest";
import {
  activePriceTier,
  contributionPerOrder,
  structuralSpread,
} from "./economics";

describe("HarbourCart economics", () => {
  it("calculates the Roma tomato public structural spread used in the research screen", () => {
    const spread = structuralSpread(
      { price: 6.61, quantity: 1 },
      { price: 3.08, quantity: 1 },
    );

    expect(spread).toBeCloseTo(0.534039, 5);
  });

  it("reproduces the 65% procurement scenario from the feasibility model", () => {
    const contribution = contributionPerOrder({
      comparableRetail: 80,
      customerSavingsRate: 0.15,
      procurementRateOfRetail: 0.65,
      labourMinutes: 4,
      labourHourlyRate: 17,
      packagingCost: 0.75,
      shrinkRate: 0.01,
    });

    expect(contribution).toBeCloseTo(11.324667, 5);
  });

  it("rejects the 80% procurement scenario economically before fixed costs", () => {
    const contribution = contributionPerOrder({
      comparableRetail: 80,
      customerSavingsRate: 0.15,
      procurementRateOfRetail: 0.8,
      labourMinutes: 4,
      labourHourlyRate: 17,
      packagingCost: 0.75,
      shrinkRate: 0.01,
    });

    expect(contribution).toBeLessThan(0);
  });

  it("selects the best unlocked group-price tier", () => {
    const tier = activePriceTier(
      [
        { minimumHouseholds: 1, customerPrice: 12.5 },
        { minimumHouseholds: 50, customerPrice: 10.75 },
        { minimumHouseholds: 100, customerPrice: 9.25 },
      ],
      73,
    );

    expect(tier.customerPrice).toBe(10.75);
  });
});
