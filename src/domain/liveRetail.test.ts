import { describe, expect, it } from "vitest";
import {
  livePriceStatus,
  lowestCurrentComparator,
  lowestResearchSignal,
  type LiveRetailPrice,
} from "./liveRetail";

const base: LiveRetailPrice = {
  id: "atlantic-cucumber",
  retailer: "ATLANTIC_SUPERSTORE",
  retailerLabel: "Atlantic Superstore",
  storeId: "0369",
  storeName: "Barrington Street",
  storeAddress: "1075 Barrington St, Halifax, NS",
  scope: "HALIFAX_STORE",
  status: "CURRENT",
  productId: "english-cucumber",
  productName: "English Cucumber",
  price: 1.5,
  quantity: 1,
  unit: "ea",
  normalizedPrice: 1.5,
  normalizedUnit: "ea",
  promo: true,
  observedAt: "2026-09-28T12:00:00Z",
  sourceUrl: "https://example.com",
  sourceLabel: "official retailer",
};

describe("live retail comparator", () => {
  it("requires a Halifax store-scoped observation for a publication comparator", () => {
    expect(livePriceStatus(base, "2026-09-28T20:00:00Z")).toBe("CURRENT");
    expect(
      livePriceStatus(
        { ...base, scope: "ATLANTIC_PUBLIC" },
        "2026-09-28T20:00:00Z",
      ),
    ).toBe("STORE_UNVERIFIED");
  });

  it("marks old store observations stale", () => {
    expect(livePriceStatus(base, "2026-10-01T12:00:00Z")).toBe("STALE");
  });

  it("accepts a current Halifax flyer through its validity window", () => {
    expect(
      livePriceStatus(
        {
          ...base,
          scope: "HALIFAX_FLYER",
          validFrom: "2026-09-24",
          validTo: "2026-09-30",
        },
        "2026-09-28T20:00:00Z",
      ),
    ).toBe("CURRENT");

    expect(
      livePriceStatus(
        {
          ...base,
          scope: "HALIFAX_FLYER",
          validFrom: "2026-09-24",
          validTo: "2026-09-30",
        },
        "2026-10-01T01:00:00Z",
      ),
    ).toBe("STALE");
  });

  it("selects the lowest current Halifax comparator", () => {
    const sobeys: LiveRetailPrice = {
      ...base,
      id: "sobeys-cucumber",
      retailer: "SOBEYS",
      retailerLabel: "Sobeys",
      normalizedPrice: 2.49,
      price: 2.49,
    };
    expect(
      lowestCurrentComparator(
        [sobeys, base],
        "english-cucumber",
        "2026-09-28T20:00:00Z",
      )?.retailer,
    ).toBe("ATLANTIC_SUPERSTORE");
  });

  it("allows unverified public prices only as research signals", () => {
    const publicOnly = {
      ...base,
      scope: "ATLANTIC_PUBLIC" as const,
      normalizedPrice: 1.25,
    };
    expect(
      lowestCurrentComparator(
        [publicOnly],
        "english-cucumber",
        "2026-09-28T20:00:00Z",
      ),
    ).toBeUndefined();
    expect(lowestResearchSignal([publicOnly], "english-cucumber")).toBeDefined();
  });

  it("uses a cheaper value alternative when it is explicitly mapped to the comparison product", () => {
    const valueBag: LiveRetailPrice = {
      ...base,
      id: "value-apples",
      productId: "value-apple-bag",
      comparisonProductId: "gala-apples",
      comparability: "VALUE_ALTERNATIVE",
      productName: "Value apple bag",
      normalizedPrice: 2.57,
      normalizedUnit: "kg",
      price: 7,
      quantity: 2.72,
      unit: "kg",
    };
    const looseGala: LiveRetailPrice = {
      ...base,
      id: "gala-loose",
      productId: "gala-apples",
      comparisonProductId: "gala-apples",
      comparability: "EXACT",
      productName: "Royal Gala Apples",
      normalizedPrice: 6.61,
      normalizedUnit: "kg",
      price: 6.61,
      quantity: 1,
      unit: "kg",
    };

    expect(
      lowestCurrentComparator(
        [looseGala, valueBag],
        "gala-apples",
        "2026-09-28T20:00:00Z",
      )?.id,
    ).toBe("value-apples");
  });

  it("never uses an explicitly non-comparable price as the savings benchmark", () => {
    const unrelated: LiveRetailPrice = {
      ...base,
      id: "unrelated",
      comparisonProductId: "english-cucumber",
      comparability: "NOT_COMPARABLE",
      normalizedPrice: 0.5,
      price: 0.5,
    };

    expect(
      lowestCurrentComparator(
        [unrelated, base],
        "english-cucumber",
        "2026-09-28T20:00:00Z",
      )?.id,
    ).toBe(base.id);
  });
});
