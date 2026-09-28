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

export type SupplierOfferProjection = {
  offer: SupplierOffer;
  requiredQuantity: number;
  casesNeeded: number;
  casesPurchased: number;
  purchasedQuantity: number;
  surplusQuantity: number;
  procurementTotal: number;
  deliveryTotal: number;
  procurementPerHousehold: number;
  deliveryPerHousehold: number;
  effectiveUnitProcurementCost: number;
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

export function projectSupplierOffer(
  offer: SupplierOffer,
  householdQuantity: number,
  householdCount: number,
): SupplierOfferProjection {
  if (householdQuantity <= 0 || householdCount <= 0) {
    throw new Error("Household quantity and household count must be greater than zero.");
  }
  if (offer.caseQuantity <= 0 || offer.minimumOrderCases <= 0) {
    throw new Error("Offer case quantity and minimum order must be greater than zero.");
  }

  const requiredQuantity = householdQuantity * householdCount;
  const casesNeeded = Math.ceil(requiredQuantity / offer.caseQuantity);
  const casesPurchased = Math.max(casesNeeded, offer.minimumOrderCases);
  const purchasedQuantity = casesPurchased * offer.caseQuantity;
  const surplusQuantity = Math.max(0, purchasedQuantity - requiredQuantity);
  const procurementTotal = casesPurchased * offer.casePrice;
  const deliveryTotal = offer.deliveryCost ?? 0;
  const procurementPerHousehold = procurementTotal / householdCount;
  const deliveryPerHousehold = deliveryTotal / householdCount;
  const effectiveUnitProcurementCost =
    procurementTotal / requiredQuantity;

  return {
    offer,
    requiredQuantity,
    casesNeeded,
    casesPurchased,
    purchasedQuantity,
    surplusQuantity,
    procurementTotal,
    deliveryTotal,
    procurementPerHousehold,
    deliveryPerHousehold,
    effectiveUnitProcurementCost,
  };
}

export function selectBestSupplierProjection(
  offers: SupplierOffer[],
  input: {
    productId: string;
    unit: string;
    householdQuantity: number;
    householdCount: number;
    asOf: string;
  },
): SupplierOfferProjection | undefined {
  return offers
    .filter(
      (offer) =>
        offer.productId === input.productId &&
        offer.unit === input.unit &&
        validateSupplierOffer(offer, input.asOf).valid,
    )
    .map((offer) =>
      projectSupplierOffer(
        offer,
        input.householdQuantity,
        input.householdCount,
      ),
    )
    .sort(
      (a, b) =>
        a.procurementPerHousehold +
        a.deliveryPerHousehold -
        (b.procurementPerHousehold + b.deliveryPerHousehold),
    )[0];
}
