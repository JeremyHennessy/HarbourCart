export type RetailerId = "ATLANTIC_SUPERSTORE" | "SOBEYS";

export type LivePriceScope =
  | "HALIFAX_STORE"
  | "HALIFAX_FLYER"
  | "ATLANTIC_PUBLIC"
  | "RETAILER_PUBLIC";

export type LivePriceStatus =
  | "CURRENT"
  | "STALE"
  | "STORE_UNVERIFIED"
  | "PARSE_FAILED";

export type RetailComparability =
  | "EXACT"
  | "COMPARABLE"
  | "VALUE_ALTERNATIVE"
  | "NOT_COMPARABLE";

export type LiveRetailPrice = {
  id: string;
  retailer: RetailerId;
  retailerLabel: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  scope: LivePriceScope;
  status: LivePriceStatus;
  productId: string;
  comparisonProductId?: string;
  comparability?: RetailComparability;
  productName: string;
  price: number;
  quantity: number;
  unit: "ea" | "kg";
  normalizedPrice: number;
  normalizedUnit: "ea" | "kg";
  promo: boolean;
  formerPrice?: number;
  observedAt: string;
  validFrom?: string;
  validTo?: string;
  sourceUrl: string;
  sourceLabel: string;
  note?: string;
};

export type RetailResearchSignal = {
  id: string;
  retailer: RetailerId;
  retailerLabel: string;
  storeId?: string;
  storeName?: string;
  storeAddress?: string;
  scope: "HALIFAX_FLYER" | "RETAILER_PUBLIC";
  status: "UNIT_UNVERIFIED";
  productId: string;
  productName: string;
  displayName: string;
  price: number;
  observedAt: string;
  validFrom?: string;
  validTo?: string;
  sourceUrl: string;
  imageUrl?: string;
  note?: string;
};

export type LiveRetailFeed = {
  schemaVersion: 1;
  generatedAt: string;
  lastAttemptAt: string;
  lastSuccessfulAt?: string;
  prices: LiveRetailPrice[];
  signals?: RetailResearchSignal[];
  errors: Array<{
    retailer: RetailerId;
    sourceUrl: string;
    message: string;
  }>;
};

export function ageHours(observedAt: string, asOf: string): number {
  const observed = Date.parse(observedAt);
  const current = Date.parse(asOf);
  if (!Number.isFinite(observed) || !Number.isFinite(current)) {
    throw new Error("Live-price timestamps must be valid ISO timestamps.");
  }
  return (current - observed) / 3_600_000;
}

export function livePriceStatus(
  price: LiveRetailPrice,
  asOf: string,
  maxAgeHours = 36,
): LivePriceStatus {
  if (
    price.scope !== "HALIFAX_STORE" &&
    price.scope !== "HALIFAX_FLYER"
  ) {
    return "STORE_UNVERIFIED";
  }

  const age = ageHours(price.observedAt, asOf);
  if (age < 0) return "STALE";

  if (price.scope === "HALIFAX_FLYER") {
    const current = Date.parse(asOf);
    const validFrom = price.validFrom ? Date.parse(price.validFrom) : -Infinity;
    const validTo = price.validTo
      ? Date.parse(price.validTo + "T23:59:59Z")
      : Date.parse(price.observedAt) + 7 * 86_400_000;

    return validFrom <= current && current <= validTo ? "CURRENT" : "STALE";
  }

  return age <= maxAgeHours ? "CURRENT" : "STALE";
}

function comparisonProductId(price: LiveRetailPrice): string {
  return price.comparisonProductId ?? price.productId;
}

function comparabilityRank(price: LiveRetailPrice): number {
  switch (price.comparability ?? "EXACT") {
    case "EXACT":
      return 0;
    case "COMPARABLE":
      return 1;
    case "VALUE_ALTERNATIVE":
      return 2;
    case "NOT_COMPARABLE":
      return 99;
  }
}

export function lowestCurrentComparator(
  prices: LiveRetailPrice[],
  productId: string,
  asOf: string,
): LiveRetailPrice | undefined {
  return prices
    .filter(
      (price) =>
        comparisonProductId(price) === productId &&
        (price.comparability ?? "EXACT") !== "NOT_COMPARABLE" &&
        livePriceStatus(price, asOf) === "CURRENT",
    )
    .sort((a, b) => {
      if (a.normalizedPrice !== b.normalizedPrice) {
        return a.normalizedPrice - b.normalizedPrice;
      }
      return comparabilityRank(a) - comparabilityRank(b);
    })[0];
}

export function lowestResearchSignal(
  prices: LiveRetailPrice[],
  productId: string,
): LiveRetailPrice | undefined {
  return prices
    .filter(
      (price) =>
        comparisonProductId(price) === productId &&
        (price.comparability ?? "EXACT") !== "NOT_COMPARABLE",
    )
    .sort((a, b) => {
      if (a.normalizedPrice !== b.normalizedPrice) {
        return a.normalizedPrice - b.normalizedPrice;
      }
      return comparabilityRank(a) - comparabilityRank(b);
    })[0];
}
