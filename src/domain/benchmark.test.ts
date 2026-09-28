import { describe, expect, it } from "vitest";
import {
  isEligibleWeeklyBenchmark,
  selectConservativeBenchmark,
  type RetailBenchmarkObservation,
} from "./benchmark";

const base: RetailBenchmarkObservation = {
  id: "regular",
  productId: "potatoes",
  retailer: "Example Halifax Retailer",
  geography: "Halifax, NS",
  observedAt: "2026-09-28",
  kind: "CURRENT_LOCAL",
  comparability: "EXACT",
  price: 10,
  quantity: 4.54,
  unit: "kg",
  promo: false,
  sourceUrl: "https://example.com",
};

describe("weekly retail benchmark selection", () => {
  it("selects the lowest credible current local comparator including promotions", () => {
    const selected = selectConservativeBenchmark(
      [
        base,
        {
          ...base,
          id: "promo",
          price: 6,
          promo: true,
          promoLimit: "Limit 2",
        },
      ],
      "2026-09-28",
    );
    expect(selected?.id).toBe("promo");
  });

  it("rejects stale or non-local baseline evidence for a weekly savings claim", () => {
    expect(
      isEligibleWeeklyBenchmark(
        { ...base, observedAt: "2026-09-10" },
        "2026-09-28",
      ),
    ).toBe(false);

    expect(
      isEligibleWeeklyBenchmark(
        { ...base, kind: "MONTHLY_BASELINE" },
        "2026-09-28",
      ),
    ).toBe(false);
  });
});
