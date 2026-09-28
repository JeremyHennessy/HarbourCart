import { describe, expect, it } from "vitest";
import { offerUnitPrice, validateSupplierOffer, type SupplierOffer } from "./offers";

const offer: SupplierOffer = {
  id: "quote-1",
  supplierId: "supplier-1",
  productId: "apples",
  productDescription: "Gala apples, market grade",
  casePrice: 48,
  caseQuantity: 18,
  unit: "kg",
  minimumOrderCases: 2,
  observedAt: "2026-09-28",
  validUntil: "2026-10-05",
  pickupAvailable: true,
  evidence: "VERIFIED_QUOTE",
  sourceReference: "retained-email-2026-09-28",
};

describe("supplier offers", () => {
  it("normalizes a verified quote", () => {
    expect(offerUnitPrice(offer)).toBeCloseTo(2.6667, 3);
    expect(validateSupplierOffer(offer, "2026-09-28").valid).toBe(true);
  });

  it("does not promote a public catalogue observation to a verified quote", () => {
    const result = validateSupplierOffer(
      { ...offer, evidence: "PUBLIC_CATALOGUE" },
      "2026-09-28",
    );
    expect(result.valid).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/verified supplier quote/i);
  });

  it("rejects an expired quote", () => {
    const result = validateSupplierOffer(
      { ...offer, validUntil: "2026-09-20" },
      "2026-09-28",
    );
    expect(result.valid).toBe(false);
    expect(result.reasons.join(" ")).toMatch(/expired/i);
  });
});
