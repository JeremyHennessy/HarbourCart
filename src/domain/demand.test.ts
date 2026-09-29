import { describe, expect, it } from "vitest";
import { aggregateDemand, type DemandIntent } from "./demand";

const make = (
  sessionId: string,
  maximumPrice: number,
  overrides: Partial<DemandIntent> = {},
): DemandIntent => ({
  sessionId,
  productId: "potatoes",
  joined: true,
  maximumPrice,
  createdAt: "2026-09-28T12:00:00Z",
  updatedAt: "2026-09-28T12:00:00Z",
  ...overrides,
});

describe("pilot demand aggregation", () => {
  it("counts distinct joined households rather than browser events", () => {
    const result = aggregateDemand(
      [
        make("a", 8),
        make("a", 7.5, { updatedAt: "2026-09-28T13:00:00Z" }),
        make("b", 9),
      ],
      "potatoes",
    );

    expect(result.interestedHouseholds).toBe(2);
    expect(result.medianMaximumPrice).toBe(8.25);
  });

  it("uses the latest intent when a household opts out", () => {
    const result = aggregateDemand(
      [
        make("a", 8),
        make("a", 8, {
          joined: false,
          updatedAt: "2026-09-28T14:00:00Z",
        }),
      ],
      "potatoes",
    );

    expect(result.interestedHouseholds).toBe(0);
    expect(result.medianMaximumPrice).toBeUndefined();
  });

  it("does not mix products", () => {
    const result = aggregateDemand(
      [
        make("a", 8),
        make("b", 12, { productId: "apples" }),
      ],
      "potatoes",
    );

    expect(result.interestedHouseholds).toBe(1);
    expect(result.medianMaximumPrice).toBe(8);
  });
});
