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

  it("marks old observations stale", () => {
    expect(livePriceStatus(base, "2026-10-01T12:00:00Z")).toBe("STALE");
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
});
