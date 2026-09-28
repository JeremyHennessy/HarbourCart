import { cardFee, type BuyDecision } from "./economics";

export type BasketItemEconomics = {
  id: string;
  label: string;
  customerPrice: number;
  comparableRetail: number;
  procurementCost: number;
  freightCost: number;
  shrinkCost: number;
  itemPackagingCost?: number;
  evidenceReady: boolean;
};

export type BasketEconomicsInput = {
  items: BasketItemEconomics[];
  labourMinutes: number;
  labourHourlyRate: number;
  basketPackagingCost: number;
  cardRate?: number;
  cardFixed?: number;
  minimumSavingsRate?: number;
  minimumContribution?: number;
};

export type BasketEconomics = {
  itemCount: number;
  customerRevenue: number;
  comparableRetail: number;
  savingsAmount: number;
  savingsRate: number;
  itemVariableCost: number;
  processingCost: number;
  labourCost: number;
  basketPackagingCost: number;
  landedVariableCost: number;
  contribution: number;
  allEvidenceReady: boolean;
  decision: BuyDecision;
  decisionReasons: string[];
};

export function itemContributionBeforeBasketOverhead(
  item: BasketItemEconomics,
): number {
  return (
    item.customerPrice -
    item.procurementCost -
    item.freightCost -
    item.shrinkCost -
    (item.itemPackagingCost ?? 0)
  );
}

export function evaluateBasket(input: BasketEconomicsInput): BasketEconomics {
  if (input.labourMinutes < 0 || input.labourHourlyRate < 0) {
    throw new Error("Basket labour inputs must be non-negative.");
  }
  if (input.basketPackagingCost < 0) {
    throw new Error("Basket packaging cost must be non-negative.");
  }

  const minimumSavingsRate = input.minimumSavingsRate ?? 0.15;
  const minimumContribution = input.minimumContribution ?? 5;
  const customerRevenue = input.items.reduce(
    (sum, item) => sum + item.customerPrice,
    0,
  );
  const comparableRetail = input.items.reduce(
    (sum, item) => sum + item.comparableRetail,
    0,
  );
  const procurement = input.items.reduce(
    (sum, item) => sum + item.procurementCost,
    0,
  );
  const freight = input.items.reduce((sum, item) => sum + item.freightCost, 0);
  const shrink = input.items.reduce((sum, item) => sum + item.shrinkCost, 0);
  const itemPackaging = input.items.reduce(
    (sum, item) => sum + (item.itemPackagingCost ?? 0),
    0,
  );
  const itemVariableCost = procurement + freight + shrink + itemPackaging;
  const processingCost =
    customerRevenue > 0
      ? cardFee(
          customerRevenue,
          input.cardRate ?? 0.029,
          input.cardFixed ?? 0.3,
        )
      : 0;
  const labourCost =
    (input.labourMinutes / 60) * input.labourHourlyRate;
  const landedVariableCost =
    itemVariableCost +
    processingCost +
    labourCost +
    input.basketPackagingCost;
  const contribution = customerRevenue - landedVariableCost;
  const savingsAmount = comparableRetail - customerRevenue;
  const savingsRate =
    comparableRetail > 0 ? savingsAmount / comparableRetail : 0;
  const allEvidenceReady =
    input.items.length > 0 && input.items.every((item) => item.evidenceReady);
  const reasons: string[] = [];

  if (input.items.length === 0) {
    reasons.push("No evidence-ready items are available for this basket.");
  } else if (!allEvidenceReady) {
    reasons.push("Every basket item needs complete quote, retail, handling, and measurement evidence.");
  }

  if (input.items.length > 0 && savingsRate < minimumSavingsRate) {
    reasons.push(
      "Basket saving " +
        Math.round(savingsRate * 100) +
        "% is below the " +
        Math.round(minimumSavingsRate * 100) +
        "% target.",
    );
  }

  if (input.items.length > 0 && contribution < 0) {
    reasons.push("Basket loses money before weekly fixed costs.");
  } else if (
    input.items.length > 0 &&
    contribution < minimumContribution
  ) {
    reasons.push(
      "Basket contribution is below the $" +
        minimumContribution.toFixed(2) +
        " normal gate.",
    );
  }

  let decision: BuyDecision;
  if (input.items.length === 0 || !allEvidenceReady) {
    decision = "BLOCKED";
  } else if (savingsRate < minimumSavingsRate || contribution < 0) {
    decision = "REJECT";
  } else if (contribution < minimumContribution) {
    decision = "REVIEW";
  } else {
    decision = "PUBLISH";
  }

  return {
    itemCount: input.items.length,
    customerRevenue,
    comparableRetail,
    savingsAmount,
    savingsRate,
    itemVariableCost,
    processingCost,
    labourCost,
    basketPackagingCost: input.basketPackagingCost,
    landedVariableCost,
    contribution,
    allEvidenceReady,
    decision,
    decisionReasons: reasons,
  };
}
