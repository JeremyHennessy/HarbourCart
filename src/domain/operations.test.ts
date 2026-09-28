import { describe, expect, it } from "vitest";
import {
  breakEvenHouseholds,
  fixedCostPerHousehold,
  weeklyFixedCosts,
  weeklyOperatingContribution,
} from "./operations";

describe("weekly operations economics", () => {
  it("calculates pickup, transport, and software separately", () => {
    const costs = weeklyFixedCosts({
      pickupHourlyRate: 40,
      pickupHours: 4,
      transportKm: 100,
      transportRatePerKm: 0.73,
      softwareWeeklyCost: 23.12,
    });

    expect(costs.pickupSite).toBe(160);
    expect(costs.transport).toBe(73);
    expect(costs.software).toBe(23.12);
    expect(costs.total).toBeCloseTo(256.12, 2);
  });

  it("keeps unresolved insurance and admin at zero rather than inventing values", () => {
    const costs = weeklyFixedCosts({
      pickupHourlyRate: 40,
      pickupHours: 4,
      transportKm: 25,
      transportRatePerKm: 0.73,
      softwareWeeklyCost: 23.12,
    });

    expect(costs.insurance).toBe(0);
    expect(costs.admin).toBe(0);
    expect(costs.total).toBeCloseTo(201.37, 2);
  });

  it("calculates the household count needed to cover known weekly costs", () => {
    expect(breakEvenHouseholds(201.37, 7.2847)).toBe(28);
    expect(breakEvenHouseholds(329.12, 7.2847)).toBe(46);
  });

  it("returns infinity when variable contribution cannot cover fixed costs", () => {
    expect(breakEvenHouseholds(200, 0)).toBe(Number.POSITIVE_INFINITY);
    expect(breakEvenHouseholds(200, -1)).toBe(Number.POSITIVE_INFINITY);
  });

  it("shows weekly surplus after known fixed costs", () => {
    expect(
      weeklyOperatingContribution(50, 7.2847, 201.37),
    ).toBeCloseTo(162.865, 3);

    expect(
      weeklyOperatingContribution(50, 3.2447, 201.37),
    ).toBeCloseTo(-39.135, 3);
  });

  it("can model a percentage-of-sales platform separately", () => {
    expect(
      weeklyOperatingContribution(50, 7.2847, 160, 68, 0.02),
    ).toBeCloseTo(136.235, 3);
  });

  it("allocates fixed costs across households", () => {
    expect(fixedCostPerHousehold(201.37, 50)).toBeCloseTo(4.0274, 4);
    expect(fixedCostPerHousehold(201.37, 100)).toBeCloseTo(2.0137, 4);
  });
});
