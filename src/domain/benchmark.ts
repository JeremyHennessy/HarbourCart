export type BenchmarkComparability = "EXACT" | "COMPARABLE" | "NOT_COMPARABLE";
export type BenchmarkKind = "CURRENT_LOCAL" | "MONTHLY_BASELINE" | "STRUCTURAL_PUBLIC";

export type RetailBenchmarkObservation = {
  id: string;
  productId: string;
  retailer: string;
  geography: string;
  observedAt: string;
  kind: BenchmarkKind;
  comparability: BenchmarkComparability;
  price: number;
  quantity: number;
  unit: string;
  promo: boolean;
  promoLimit?: string;
  sourceUrl: string;
};

export type SelectedBenchmark = RetailBenchmarkObservation & {
  normalizedUnitPrice: number;
  ageDays: number;
};

export function normalizeBenchmarkUnit(
  observation: RetailBenchmarkObservation,
): number {
  if (observation.quantity <= 0) {
    throw new Error("Benchmark quantity must be greater than zero.");
  }
  return observation.price / observation.quantity;
}

export function ageInDays(observedAt: string, asOf: string): number {
  const observed = new Date(observedAt + "T00:00:00Z").getTime();
  const reference = new Date(asOf + "T00:00:00Z").getTime();
  if (!Number.isFinite(observed) || !Number.isFinite(reference)) {
    throw new Error("Dates must use YYYY-MM-DD.");
  }
  return Math.floor((reference - observed) / 86_400_000);
}

export function isEligibleWeeklyBenchmark(
  observation: RetailBenchmarkObservation,
  asOf: string,
  maxAgeDays = 7,
): boolean {
  if (observation.kind !== "CURRENT_LOCAL") return false;
  if (observation.comparability === "NOT_COMPARABLE") return false;
  const ageDays = ageInDays(observation.observedAt, asOf);
  return ageDays >= 0 && ageDays <= maxAgeDays;
}

export function selectConservativeBenchmark(
  observations: RetailBenchmarkObservation[],
  asOf: string,
  maxAgeDays = 7,
): SelectedBenchmark | undefined {
  const eligible = observations
    .filter((observation) =>
      isEligibleWeeklyBenchmark(observation, asOf, maxAgeDays),
    )
    .map((observation) => ({
      ...observation,
      normalizedUnitPrice: normalizeBenchmarkUnit(observation),
      ageDays: ageInDays(observation.observedAt, asOf),
    }))
    .sort((a, b) => {
      if (a.normalizedUnitPrice !== b.normalizedUnitPrice) {
        return a.normalizedUnitPrice - b.normalizedUnitPrice;
      }
      if (a.comparability !== b.comparability) {
        return a.comparability === "EXACT" ? -1 : 1;
      }
      return a.ageDays - b.ageDays;
    });

  return eligible[0];
}
