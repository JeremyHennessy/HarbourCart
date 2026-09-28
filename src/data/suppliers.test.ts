import { describe, expect, it } from "vitest";
import { supplierTargets } from "./suppliers";

describe("supplier research targets", () => {
  it("keeps every supplier lead tied to dated public evidence", () => {
    for (const supplier of supplierTargets) {
      expect(supplier.sourceUrl).toMatch(/^https:\/\//);
      expect(supplier.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(supplier.products.length).toBeGreaterThan(0);
      expect(supplier.note.length).toBeGreaterThan(20);
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
  });
});
