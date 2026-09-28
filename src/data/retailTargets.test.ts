import { describe, expect, it } from "vitest";
import { retailProductTargets, retailStores } from "./retailTargets";

describe("live retail target registry", () => {
  it("keeps retailer target product ids unique", () => {
    const ids = retailProductTargets.map((target) => target.productId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(retailProductTargets.length).toBeGreaterThanOrEqual(15);
  });

  it("retains explicit Halifax store identities", () => {
    expect(retailStores.atlanticBarrington.storeId).toBe("0369");
    expect(retailStores.sobeysQueen.storeId).toBe("0574");
    expect(retailStores.atlanticBarrington.storeAddress).toMatch(/Halifax/i);
    expect(retailStores.sobeysQueen.storeAddress).toMatch(/Halifax/i);
  });

  it("uses product-specific Gala aliases", () => {
    const gala = retailProductTargets.find(
      (target) => target.productId === "gala-apples",
    );
    expect(gala?.atlanticAliases).toContain("Royal Gala Apples");
    expect(gala?.atlanticAliases).not.toContain("Royal Gala");
  });
});
