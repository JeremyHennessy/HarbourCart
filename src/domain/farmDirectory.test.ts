import { describe, expect, it } from "vitest";
import {
  farmDirectoryIsFresh,
  filterFarmDirectory,
  sourceHealthSummary,
  type FarmDirectoryFeed,
  type FarmDirectoryRecord,
} from "./farmDirectory";

function farm(
  overrides: Partial<FarmDirectoryRecord> = {},
): FarmDirectoryRecord {
  return {
    id: "farm-test",
    canonicalName: "Test Farm",
    aliases: [],
    roles: [],
    locations: [],
    regions: ["Halifax Metro"],
    products: ["Vegetables", "Apples"],
    productCategories: ["VEGETABLES", "FRUIT"],
    contacts: { phones: [], emails: [], websites: [] },
    whereToBuy: [],
    attributes: [],
    signals: {
      foodHubProducer: false,
      buyLocalFarm: true,
      buyLocalProducer: false,
      buyLocalSupplier: false,
      buyLocalWholesaler: false,
      csa2026: false,
      acornDirectory: false,
      acornMember: false,
      agricultureFundingRecipient: false,
      delivery: false,
      onlineShop: false,
    },
    funding: { records: 0, totalKnownAmount: 0 },
    evidence: [],
    currentSeasonScreen: {
      season: "FALL",
      status: "SEASONAL_MATCH",
      matchedProducts: ["Apples"],
      sourceId: "FMNS_SEASONALITY",
    },
    harbourCart: {
      fitScore: 50,
      fitBand: "MEDIUM",
      reasons: [],
      phase1ProductMatches: ["vegetables", "apples"],
      laterPhaseProductMatches: [],
    },
    lastObservedAt: "2026-09-29T00:00:00Z",
    ...overrides,
  };
}

describe("farm directory domain", () => {
  it("filters by query, fit, Food Hub and phase-1 evidence", () => {
    const rows = [
      farm({
        id: "one",
        canonicalName: "Apple Lane Farm",
        signals: { ...farm().signals, foodHubProducer: true },
        harbourCart: {
          ...farm().harbourCart,
          fitBand: "HIGH",
          fitScore: 75,
        },
      }),
      farm({
        id: "two",
        canonicalName: "Later Phase Dairy",
        products: ["Dairy"],
        harbourCart: {
          fitScore: 20,
          fitBand: "DISCOVERY",
          reasons: [],
          phase1ProductMatches: [],
          laterPhaseProductMatches: ["dairy"],
        },
      }),
    ];

    expect(
      filterFarmDirectory(rows, {
        query: "apple",
        fitBand: "HIGH",
        foodHubOnly: true,
        phase1Only: true,
      }),
    ).toHaveLength(1);
  });

  it("uses a 14-day directory freshness window by default", () => {
    const feed = {
      generatedAt: "2026-09-20T00:00:00Z",
    } as FarmDirectoryFeed;
    expect(
      farmDirectoryIsFresh(feed, new Date("2026-09-29T00:00:00Z")),
    ).toBe(true);
    expect(
      farmDirectoryIsFresh(feed, new Date("2026-10-10T00:00:00Z")),
    ).toBe(false);
  });

  it("summarizes source health without treating stale retention as success", () => {
    const feed = {
      sources: [
        { status: "SUCCESS" },
        { status: "PARTIAL" },
        { status: "STALE_RETAINED" },
        { status: "FAILED" },
      ],
    } as FarmDirectoryFeed;

    expect(sourceHealthSummary(feed)).toEqual({
      healthy: 1,
      partial: 1,
      retained: 1,
      failed: 1,
      total: 4,
    });
  });
});
