import { describe, expect, it } from "vitest";
import { supplierTargets } from "./suppliers";

describe("supplier research targets", () => {
  it("keeps every supplier lead tied to dated public evidence", () => {
    for (const supplier of supplierTargets) {
      expect(supplier.sourceUrl).toMatch(/^https:\/\//);
      expect(supplier.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(supplier.products.length).toBeGreaterThan(0);
      expect(supplier.note.length).toBeGreaterThan(20);
      expect(supplier.availabilityBasis.length).toBeGreaterThan(20);
      expect(supplier.priority).toMatch(/^P[1-3]$/);
    }
  });

  it("contains multiple distinct quote channels", () => {
    expect(new Set(supplierTargets.map((supplier) => supplier.id)).size).toBe(
      supplierTargets.length,
    );
    expect(
      supplierTargets.some((supplier) => supplier.kind === "WHOLESALER"),
    ).toBe(true);
    expect(
      supplierTargets.some((supplier) => supplier.kind === "FARM_WHOLESALE"),
    ).toBe(true);
    expect(
      supplierTargets.some((supplier) => supplier.kind === "FOOD_HUB"),
    ).toBe(true);
    expect(
      supplierTargets.some((supplier) => supplier.kind === "DIRECT_FARM"),
    ).toBe(true);
  });

  it("separates availability evidence from verified pricing", () => {
    expect(
      supplierTargets.some(
        (supplier) => supplier.availabilityStatus === "CURRENT_SEASON",
      ),
    ).toBe(true);
    expect(
      supplierTargets.some(
        (supplier) => (supplier.publicPackFormats?.length ?? 0) > 0,
      ),
    ).toBe(true);
    expect(
      supplierTargets.every(
        (supplier) => supplier.quoteStatus !== "VERIFIED_QUOTE",
      ),
    ).toBe(true);
  });

  it("includes the expanded priority procurement network", () => {
    const ids = new Set(supplierTargets.map((supplier) => supplier.id));
    for (const expected of [
      "four-seasons-farm",
      "kings-produce",
      "taproot-farms",
      "vermeulen-farms",
      "agri-growers",
      "good-clean-farm",
    ]) {
      expect(ids.has(expected)).toBe(true);
    }
  });
});
