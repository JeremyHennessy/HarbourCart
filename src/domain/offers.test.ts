import { describe, expect, it } from "vitest";
import {
  offerUnitPrice,
  projectSupplierOffer,
  selectBestSupplierProjection,
  validateSupplierOffer,
  type SupplierOffer,
} from "./offers";

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
  deliveryCost: 20,
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

  it("charges MOQ surplus to the participating cohort instead of pretending perfect divisibility", () => {
    const projection = projectSupplierOffer(
      {
        ...offer,
        casePrice: 30,
        caseQuantity: 10,
        minimumOrderCases: 3,
        deliveryCost: 15,
      },
      2,
      10,
    );

    // Demand is 20 kg, but the three-case MOQ forces 30 kg to be purchased.
    expect(projection.requiredQuantity).toBe(20);
    expect(projection.casesNeeded).toBe(2);
    expect(projection.casesPurchased).toBe(3);
    expect(projection.surplusQuantity).toBe(10);
    expect(projection.procurementTotal).toBe(90);
    expect(projection.procurementPerHousehold).toBe(9);
    expect(projection.deliveryPerHousehold).toBe(1.5);
    expect(projection.effectiveUnitProcurementCost).toBe(4.5);
  });

  it("selects the lowest valid delivered supplier projection", () => {
    const best = selectBestSupplierProjection(
      [
        { ...offer, id: "a", casePrice: 48, deliveryCost: 50 },
        { ...offer, id: "b", casePrice: 52, deliveryCost: 0 },
        {
          ...offer,
          id: "expired-cheap",
          casePrice: 30,
          validUntil: "2026-09-20",
          deliveryCost: 0,
        },
      ],
      {
        productId: "apples",
        unit: "kg",
        householdQuantity: 2,
        householdCount: 50,
        asOf: "2026-09-28",
      },
    );

    expect(best?.offer.id).toBe("b");
  });

  it("does not use an offer whose unit does not match the candidate", () => {
    const best = selectBestSupplierProjection(
      [{ ...offer, unit: "ea" }],
      {
        productId: "apples",
        unit: "kg",
        householdQuantity: 2,
        householdCount: 50,
        asOf: "2026-09-28",
      },
    );
    expect(best).toBeUndefined();
  });
});
