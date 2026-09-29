import { describe, expect, it } from "vitest";
import {
  evaluateBasket,
  itemContributionBeforeBasketOverhead,
  type BasketItemEconomics,
} from "./basket";

const item = (
  overrides: Partial<BasketItemEconomics> = {},
): BasketItemEconomics => ({
  id: "item",
  label: "Pilot item",
  customerPrice: 20,
  comparableRetail: 25,
  procurementCost: 12,
  freightCost: 0.5,
  shrinkCost: 0.12,
  evidenceReady: true,
  ...overrides,
});

describe("basket economics", () => {
  it("applies the fixed card fee only once to the whole basket", () => {
    const result = evaluateBasket({
      items: [
        item({ id: "a", customerPrice: 20 }),
        item({ id: "b", customerPrice: 30, comparableRetail: 37 }),
      ],
      labourMinutes: 4,
      labourHourlyRate: 17,
      basketPackagingCost: 0.75,
    });

    expect(result.customerRevenue).toBe(50);
    expect(result.processingCost).toBeCloseTo(50 * 0.029 + 0.3, 6);
  });

  it("applies household-order labour and basket packaging once", () => {
    const result = evaluateBasket({
      items: [item({ customerPrice: 40, comparableRetail: 50 })],
      labourMinutes: 4,
      labourHourlyRate: 17,
      basketPackagingCost: 0.75,
    });

    expect(result.labourCost).toBeCloseTo((4 / 60) * 17, 6);
    expect(result.basketPackagingCost).toBe(0.75);
  });

  it("does not require every individual item to earn five dollars", () => {
    const lowMargin = item({
      id: "low",
      customerPrice: 6,
      comparableRetail: 8,
      procurementCost: 4.6,
      freightCost: 0.1,
      shrinkCost: 0.05,
    });
    const highMargin = item({
      id: "high",
      customerPrice: 40,
      comparableRetail: 50,
      procurementCost: 20,
      freightCost: 0.5,
      shrinkCost: 0.2,
    });

    expect(itemContributionBeforeBasketOverhead(lowMargin)).toBeLessThan(5);

    const result = evaluateBasket({
      items: [lowMargin, highMargin],
      labourMinutes: 4,
      labourHourlyRate: 17,
      basketPackagingCost: 0.75,
      minimumSavingsRate: 0.15,
      minimumContribution: 5,
    });

    expect(result.contribution).toBeGreaterThan(5);
    expect(result.decision).toBe("PUBLISH");
  });

  it("blocks a basket with incomplete evidence even if the math is strong", () => {
    const result = evaluateBasket({
      items: [item({ evidenceReady: false, procurementCost: 5 })],
      labourMinutes: 1,
      labourHourlyRate: 17,
      basketPackagingCost: 0,
    });

    expect(result.contribution).toBeGreaterThan(5);
    expect(result.decision).toBe("BLOCKED");
  });

  it("rejects a basket that loses money before fixed weekly costs", () => {
    const result = evaluateBasket({
      items: [
        item({
          customerPrice: 20,
          comparableRetail: 30,
          procurementCost: 21,
          freightCost: 1,
          shrinkCost: 0.2,
        }),
      ],
      labourMinutes: 4,
      labourHourlyRate: 17,
      basketPackagingCost: 0.75,
    });

    expect(result.contribution).toBeLessThan(0);
    expect(result.decision).toBe("REJECT");
  });
});
