export type PriceTier = {
  minimumHouseholds: number;
  customerPrice: number;
};

export type UnitPrice = {
  price: number;
  quantity: number;
};

export function normalizeUnitPrice(input: UnitPrice): number {
  if (input.quantity <= 0) {
    throw new Error("Quantity must be greater than zero.");
  }

  return input.price / input.quantity;
}

export function structuralSpread(
  smallOrLoose: UnitPrice,
  bulkOrCase: UnitPrice,
): number {
  const reference = normalizeUnitPrice(smallOrLoose);
  const bulk = normalizeUnitPrice(bulkOrCase);

  if (reference <= 0) {
    throw new Error("Reference unit price must be greater than zero.");
  }

  return 1 - bulk / reference;
}

export function customerPriceFromSavings(
  comparableRetail: number,
  targetSavingsRate: number,
): number {
  return comparableRetail * (1 - targetSavingsRate);
}

export function cardFee(customerPrice: number, rate = 0.029, fixed = 0.3): number {
  return customerPrice * rate + fixed;
}

export type ContributionInput = {
  comparableRetail: number;
  customerSavingsRate: number;
  procurementRateOfRetail: number;
  labourMinutes: number;
  labourHourlyRate: number;
  packagingCost: number;
  shrinkRate: number;
  cardRate?: number;
  cardFixed?: number;
};

export function contributionPerOrder(input: ContributionInput): number {
  const customerPrice = customerPriceFromSavings(
    input.comparableRetail,
    input.customerSavingsRate,
  );
  const procurementCost =
    input.comparableRetail * input.procurementRateOfRetail;
  const processing = cardFee(
    customerPrice,
    input.cardRate ?? 0.029,
    input.cardFixed ?? 0.3,
  );
  const labourCost = (input.labourMinutes / 60) * input.labourHourlyRate;
  const shrinkCost = procurementCost * input.shrinkRate;

  return (
    customerPrice -
    procurementCost -
    processing -
    labourCost -
    input.packagingCost -
    shrinkCost
  );
}

export function activePriceTier(
  tiers: PriceTier[],
  households: number,
): PriceTier {
  const sorted = [...tiers].sort(
    (a, b) => a.minimumHouseholds - b.minimumHouseholds,
  );

  if (sorted.length === 0) {
    throw new Error("At least one price tier is required.");
  }

  return (
    [...sorted]
      .reverse()
      .find((tier) => households >= tier.minimumHouseholds) ?? sorted[0]
  );
}

export function nextPriceTier(
  tiers: PriceTier[],
  households: number,
): PriceTier | undefined {
  return [...tiers]
    .sort((a, b) => a.minimumHouseholds - b.minimumHouseholds)
    .find((tier) => tier.minimumHouseholds > households);
}
