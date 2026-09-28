export type SupplierOfferEvidence = "VERIFIED_QUOTE" | "PUBLIC_CATALOGUE" | "MODEL";

export type SupplierOffer = {
  id: string;
  supplierId: string;
  productId: string;
  productDescription: string;
  casePrice: number;
  caseQuantity: number;
  unit: string;
  minimumOrderCases: number;
  observedAt: string;
  validUntil?: string;
  deliveryCost?: number;
  pickupAvailable: boolean;
  evidence: SupplierOfferEvidence;
  sourceReference: string;
};

export type OfferValidation = {
  valid: boolean;
  reasons: string[];
};

export function validateSupplierOffer(
  offer: SupplierOffer,
  asOf: string,
): OfferValidation {
  const reasons: string[] = [];

  if (offer.casePrice <= 0) reasons.push("Case price must be positive.");
  if (offer.caseQuantity <= 0) reasons.push("Case quantity must be positive.");
  if (offer.minimumOrderCases <= 0) {
    reasons.push("Minimum order must be at least one case.");
  }
  if (offer.evidence !== "VERIFIED_QUOTE") {
    reasons.push("Offer is not backed by a verified supplier quote.");
  }
  if (!offer.sourceReference.trim()) {
    reasons.push("Offer evidence reference is required.");
  }

  if (offer.validUntil) {
    const asOfTime = new Date(asOf + "T00:00:00Z").getTime();
    const validUntil = new Date(offer.validUntil + "T23:59:59Z").getTime();
    if (asOfTime > validUntil) reasons.push("Supplier quote has expired.");
  } else {
    reasons.push("Supplier quote requires manual freshness review because it has no expiry.");
  }

  return { valid: reasons.length === 0, reasons };
}

export function offerUnitPrice(offer: SupplierOffer): number {
  if (offer.caseQuantity <= 0) {
    throw new Error("Case quantity must be greater than zero.");
  }
  return offer.casePrice / offer.caseQuantity;
}
