export type FarmSourceStatus =
  | "SUCCESS"
  | "PARTIAL"
  | "FAILED"
  | "STALE_RETAINED"
  | "PENDING";

export type HarbourCartFarmFitBand = "HIGH" | "MEDIUM" | "DISCOVERY";

export type FarmEvidence = {
  sourceId: string;
  sourceLabel: string;
  recordName?: string;
  recordUrl?: string;
  observedAt: string;
  fields?: string[];
  note?: string;
  staleRetained?: boolean;
};

export type FarmDirectoryRecord = {
  id: string;
  canonicalName: string;
  aliases: string[];
  roles: string[];
  address?: string;
  locations: string[];
  regions: string[];
  products: string[];
  productCategories: string[];
  contacts: {
    phones: string[];
    emails: string[];
    websites: string[];
  };
  whereToBuy: string[];
  attributes: string[];
  marketAssociations?: string[];
  signals: {
    foodHubProducer: boolean;
    buyLocalFarm: boolean;
    buyLocalProducer: boolean;
    buyLocalSupplier: boolean;
    buyLocalWholesaler: boolean;
    csa2026: boolean;
    acornDirectory: boolean;
    acornMember: boolean;
    agricultureFundingRecipient: boolean;
    delivery: boolean;
    onlineShop: boolean;
  };
  funding: {
    records: number;
    totalKnownAmount: number;
    latestYear?: string;
  };
  evidence: FarmEvidence[];
  currentSeasonScreen: {
    season: string;
    status: "SEASONAL_MATCH" | "NO_MATCH" | "UNSCREENED";
    matchedProducts: string[];
    sourceId: string;
    note?: string;
  };
  harbourCart: {
    fitScore: number;
    fitBand: HarbourCartFarmFitBand;
    reasons: string[];
    phase1ProductMatches: string[];
    laterPhaseProductMatches: string[];
  };
  lastObservedAt: string;
};

export type FarmMarketRecord = {
  name: string;
  region?: string;
  schedule?: string;
  sourceUrl: string;
};

export type FarmDirectorySource = {
  id: string;
  label: string;
  url: string;
  status: FarmSourceStatus;
  fetchedAt: string;
  recordCount: number;
  requestCount: number;
  retainedRecordCount?: number;
  errors: string[];
};

export type FarmDirectoryFeed = {
  schemaVersion: number;
  generatedAt: string;
  currentNovaScotiaSeason: string;
  refreshCadence: string;
  evidenceContract: {
    discoveryListingIsNotWholesaleEvidence: boolean;
    fundingRecipientIsNotSupplierEvidence: boolean;
    seasonalMatchIsNotInventoryConfirmation: boolean;
    foodHubProducerIsWholesaleChannelEvidence: boolean;
    currentPriceRequiresSeparateQuoteEvidence: boolean;
  };
  stats: {
    farms: number;
    highFit: number;
    mediumFit: number;
    foodHubProducers: number;
    buyLocalSuppliers: number;
    buyLocalWholesalers: number;
    csa2026: number;
    acornDirectory: number;
    fundingRecipients: number;
    markets: number;
    sourceCounts: Record<string, number>;
  };
  sources: FarmDirectorySource[];
  seasonality: Record<string, string[]>;
  markets: FarmMarketRecord[];
  farms: FarmDirectoryRecord[];
};

export function farmDirectoryAgeDays(
  feed: FarmDirectoryFeed,
  now = new Date(),
) {
  const generated = Date.parse(feed.generatedAt);
  if (!Number.isFinite(generated)) return Number.POSITIVE_INFINITY;
  return (now.getTime() - generated) / 86_400_000;
}

export function farmDirectoryIsFresh(
  feed: FarmDirectoryFeed,
  now = new Date(),
  maximumAgeDays = 14,
) {
  const age = farmDirectoryAgeDays(feed, now);
  return age >= 0 && age <= maximumAgeDays;
}

export function farmMatchesQuery(
  farm: FarmDirectoryRecord,
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    farm.canonicalName,
    ...farm.aliases,
    farm.address ?? "",
    ...farm.locations,
    ...farm.regions,
    ...farm.products,
    ...farm.roles,
    ...farm.whereToBuy,
    ...(farm.marketAssociations ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

export function filterFarmDirectory(
  farms: FarmDirectoryRecord[],
  options: {
    query?: string;
    fitBand?: HarbourCartFarmFitBand | "ALL";
    foodHubOnly?: boolean;
    phase1Only?: boolean;
  } = {},
) {
  return farms.filter((farm) => {
    if (options.query && !farmMatchesQuery(farm, options.query)) return false;
    if (
      options.fitBand &&
      options.fitBand !== "ALL" &&
      farm.harbourCart.fitBand !== options.fitBand
    ) {
      return false;
    }
    if (options.foodHubOnly && !farm.signals.foodHubProducer) return false;
    if (
      options.phase1Only &&
      farm.harbourCart.phase1ProductMatches.length === 0
    ) {
      return false;
    }
    return true;
  });
}

export function sourceHealthSummary(feed: FarmDirectoryFeed) {
  const healthy = feed.sources.filter(
    (source) => source.status === "SUCCESS",
  ).length;
  const retained = feed.sources.filter(
    (source) => source.status === "STALE_RETAINED",
  ).length;
  const partial = feed.sources.filter(
    (source) => source.status === "PARTIAL",
  ).length;
  const failed = feed.sources.filter(
    (source) => source.status === "FAILED",
  ).length;

  return {
    healthy,
    retained,
    partial,
    failed,
    total: feed.sources.length,
  };
}
