export type PriceTier = {
  minimumHouseholds: number;
  customerPrice: number;
};

export type UnitPrice = {
  price: number;
  quantity: number;
};

export type HandlingStatus =
  | "CONFIRMED_PHASE_1"
  | "REQUIRES_CONFIRMATION"
  | "NOT_PHASE_1";

export type EvidenceStatus =
  | "VERIFIED_QUOTE"
  | "CURRENT_LOCAL"
  | "CURRENT_PUBLIC"
  | "MONTHLY_BASELINE"
  | "MODEL"
  | "QUOTE_REQUIRED";

export type BuyDecision = "PUBLISH" | "REVIEW" | "REJECT" | "BLOCKED";

export type CandidateEconomicsInput = {
  comparableRetail: number;
  procurementCost: number;
  targetSavingsRate: number;
  labourMinutes: number;
  labourHourlyRate: number;
  packagingCost: number;
  shrinkRate: number;
  freightCost: number;
  handlingStatus: HandlingStatus;
  supplierEvidence: EvidenceStatus;
  benchmarkEvidence: EvidenceStatus;
  minimumSavingsRate?: number;
  minimumContribution?: number;
  cardRate?: number;
  cardFixed?: number;
};

export type CandidateEconomics = {
  comparableRetail: number;
  customerPrice: number;
  procurementCost: number;
  processingCost: number;
  labourCost: number;
  packagingCost: number;
  shrinkCost: number;
  freightCost: number;
  landedVariableCost: number;
  contribution: number;
  savingsAmount: number;
  savingsRate: number;
  decision: BuyDecision;
  decisionReasons: string[];
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
  if (comparableRetail < 0) {
    throw new Error("Comparable retail must not be negative.");
  }
  if (targetSavingsRate < 0 || targetSavingsRate >= 1) {
    throw new Error("Target savings rate must be between 0 and 1.");
  }
  return comparableRetail * (1 - targetSavingsRate);
}

export function cardFee(
  customerPrice: number,
  rate = 0.029,
  fixed = 0.3,
): number {
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
  freightCost?: number;
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
    shrinkCost -
    (input.freightCost ?? 0)
  );
}

export function evaluateCandidate(
  input: CandidateEconomicsInput,
): CandidateEconomics {
  const minimumSavingsRate = input.minimumSavingsRate ?? 0.15;
  const minimumContribution = input.minimumContribution ?? 5;
  const customerPrice = customerPriceFromSavings(
    input.comparableRetail,
    input.targetSavingsRate,
  );
  const processingCost = cardFee(
    customerPrice,
    input.cardRate ?? 0.029,
    input.cardFixed ?? 0.3,
  );
  const labourCost = (input.labourMinutes / 60) * input.labourHourlyRate;
  const shrinkCost = input.procurementCost * input.shrinkRate;
  const landedVariableCost =
    input.procurementCost +
    processingCost +
    labourCost +
    input.packagingCost +
    shrinkCost +
    input.freightCost;
  const contribution = customerPrice - landedVariableCost;
  const savingsAmount = input.comparableRetail - customerPrice;
  const savingsRate =
    input.comparableRetail > 0 ? savingsAmount / input.comparableRetail : 0;

  const reasons: string[] = [];

  if (input.handlingStatus !== "CONFIRMED_PHASE_1") {
    reasons.push(
      input.handlingStatus === "NOT_PHASE_1"
        ? "Handling class is intentionally outside the phase-1 pilot."
        : "Handling classification still requires written regulatory confirmation.",
    );
  }

  if (input.supplierEvidence !== "VERIFIED_QUOTE") {
    reasons.push("A real supplier quote is required before publication.");
  }

  if (input.benchmarkEvidence !== "CURRENT_LOCAL") {
    reasons.push("A current Halifax retail comparator is required before a savings claim.");
  }

  if (savingsRate < minimumSavingsRate) {
    reasons.push(
      `Customer saving ${Math.round(savingsRate * 100)}% is below the ${Math.round(
        minimumSavingsRate * 100,
      )}% publish gate.`,
    );
  }

  if (contribution < 0) {
    reasons.push("The buy loses money before fixed costs.");
  } else if (contribution < minimumContribution) {
    reasons.push(
      `Variable contribution is below the $${minimumContribution.toFixed(
        2,
      )} normal publish gate.`,
    );
  }

  let decision: BuyDecision;
  if (
    input.handlingStatus !== "CONFIRMED_PHASE_1" ||
    input.supplierEvidence !== "VERIFIED_QUOTE" ||
    input.benchmarkEvidence !== "CURRENT_LOCAL"
  ) {
    decision = "BLOCKED";
  } else if (savingsRate < minimumSavingsRate || contribution < 0) {
    decision = "REJECT";
  } else if (contribution < minimumContribution) {
    decision = "REVIEW";
  } else {
    decision = "PUBLISH";
  }

  return {
    comparableRetail: input.comparableRetail,
    customerPrice,
    procurementCost: input.procurementCost,
    processingCost,
    labourCost,
    packagingCost: input.packagingCost,
    shrinkCost,
    freightCost: input.freightCost,
    landedVariableCost,
    contribution,
    savingsAmount,
    savingsRate,
    decision,
    decisionReasons: reasons,
  };
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
