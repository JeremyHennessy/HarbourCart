export type DemandIntent = {
  sessionId: string;
  productId: string;
  joined: boolean;
  maximumPrice: number;
  pickupPreference?: string;
  createdAt: string;
  updatedAt: string;
};

export type DemandAggregate = {
  productId: string;
  interestedHouseholds: number;
  medianMaximumPrice?: number;
};

export function aggregateDemand(
  intents: DemandIntent[],
  productId: string,
): DemandAggregate {
  const currentBySession = new Map<string, DemandIntent>();

  for (const intent of intents) {
    if (intent.productId !== productId) continue;
    if (!Number.isFinite(intent.maximumPrice) || intent.maximumPrice < 0) continue;

    const existing = currentBySession.get(intent.sessionId);
    if (
      !existing ||
      Date.parse(intent.updatedAt) >= Date.parse(existing.updatedAt)
    ) {
      currentBySession.set(intent.sessionId, intent);
    }
  }

  const joined = [...currentBySession.values()].filter((intent) => intent.joined);
  const prices = joined
    .map((intent) => intent.maximumPrice)
    .sort((a, b) => a - b);

  let medianMaximumPrice: number | undefined;
  if (prices.length > 0) {
    const middle = Math.floor(prices.length / 2);
    medianMaximumPrice =
      prices.length % 2 === 0
        ? (prices[middle - 1] + prices[middle]) / 2
        : prices[middle];
  }

  return {
    productId,
    interestedHouseholds: joined.length,
    medianMaximumPrice,
  };
}
