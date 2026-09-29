import fs from "node:fs/promises";
import path from "node:path";
import {
  currentNovaScotiaSeason,
  extractIframeUrls,
  fundingRecipientLooksAgricultural,
  hasAnyTerm,
  looksFarmLike,
  normalizeBusinessName,
  parseAcornPage,
  parseAgricultureFundingCsv,
  parseBuyLocalDetail,
  parseBuyLocalSearchPage,
  parseFmnsMarkets,
  parseFmnsSeasonality,
  parseFoodHubProducerNames,
  parseGenericNamedDirectory,
  productTokens,
  slugify,
} from "./farm-parser.mjs";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "config", "farm-directory.json");
const OUTPUT_PATH = path.join(ROOT, "public", "data", "farm-directory.json");
const USER_AGENT =
  "HarbourCartFarmDirectory/0.1 (+https://github.com/JeremyHennessy/HarbourCart; public-source research; weekly refresh)";

const config = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
const generatedAt = new Date().toISOString();
const season = currentNovaScotiaSeason(new Date(generatedAt));

async function readPrevious() {
  try {
    return JSON.parse(await fs.readFile(OUTPUT_PATH, "utf8"));
  } catch {
    return undefined;
  }
}

const previous = await readPrevious();
const farms = new Map();
const markets = [];
let seasonality = {};
const sourceHealth = [];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url, options = {}) {
  let lastError;
  const attempts = options.attempts ?? 2;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(
          options.timeoutMs ?? config.sourceTimeoutMs ?? 20_000,
        ),
        headers: {
          "user-agent": USER_AGENT,
          accept: options.accept ?? "text/html,application/xhtml+xml,text/plain,*/*",
        },
      });
      if (!response.ok) {
        throw new Error("HTTP " + response.status + " for " + url);
      }
      return {
        url: response.url,
        text: await response.text(),
        contentType: response.headers.get("content-type") ?? "",
      };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(500 * attempt);
    }
  }

  throw lastError;
}

function sourceEntry(id, label, url) {
  return {
    id,
    label,
    url,
    status: "PENDING",
    fetchedAt: generatedAt,
    recordCount: 0,
    requestCount: 0,
    errors: [],
  };
}

function recordSource(source) {
  const existing = sourceHealth.find((item) => item.id === source.id);
  if (existing) Object.assign(existing, source);
  else sourceHealth.push(source);
}

function canonicalKey(name) {
  const normalized = normalizeBusinessName(name);
  return config.manualAliases?.[normalized] ?? normalized;
}

function ensureFarm(name) {
  const key = canonicalKey(name);
  if (!key) return undefined;
  if (!farms.has(key)) {
    farms.set(key, {
      id: "farm-" + slugify(key),
      canonicalName: String(name).trim(),
      aliases: [],
      roles: [],
      address: undefined,
      locations: [],
      regions: [],
      products: [],
      productCategories: [],
      contacts: {
        phones: [],
        emails: [],
        websites: [],
      },
      whereToBuy: [],
      attributes: [],
      signals: {
        foodHubProducer: false,
        buyLocalFarm: false,
        buyLocalProducer: false,
        buyLocalSupplier: false,
        buyLocalWholesaler: false,
        csa2026: false,
        acornDirectory: false,
        acornMember: false,
        agricultureFundingRecipient: false,
        delivery: false,
        onlineShop: false,
      },
      funding: {
        records: 0,
        totalKnownAmount: 0,
        latestYear: undefined,
      },
      evidence: [],
      currentSeasonScreen: {
        season,
        status: "UNSCREENED",
        matchedProducts: [],
        sourceId: "FMNS_SEASONALITY",
      },
      harbourCart: {
        fitScore: 0,
        fitBand: "DISCOVERY",
        reasons: [],
        phase1ProductMatches: [],
        laterPhaseProductMatches: [],
      },
      lastObservedAt: generatedAt,
    });
  }

  const farm = farms.get(key);
  if (
    normalizeBusinessName(farm.canonicalName) !== normalizeBusinessName(name) &&
    !farm.aliases.includes(name)
  ) {
    farm.aliases.push(name);
  }
  return farm;
}

function addUnique(target, values = []) {
  for (const value of values.filter(Boolean)) {
    if (!target.includes(value)) target.push(value);
  }
}

function addEvidence(farm, evidence) {
  const signature =
    evidence.sourceId +
    "|" +
    (evidence.recordUrl ?? "") +
    "|" +
    (evidence.recordName ?? farm.canonicalName);
  if (
    farm.evidence.some(
      (item) =>
        item.sourceId +
          "|" +
          (item.recordUrl ?? "") +
          "|" +
          (item.recordName ?? farm.canonicalName) ===
        signature,
    )
  ) {
    return;
  }

  farm.evidence.push({
    observedAt: generatedAt.slice(0, 10),
    ...evidence,
  });
}

function mergeFarm(name, incoming = {}, evidence) {
  const farm = ensureFarm(name);
  if (!farm) return undefined;

  addUnique(farm.roles, incoming.roles);
  addUnique(farm.regions, incoming.regions);
  addUnique(farm.products, incoming.products);
  addUnique(farm.locations, incoming.locations);
  addUnique(farm.whereToBuy, incoming.whereToBuy);
  addUnique(farm.attributes, incoming.attributes);
  addUnique(farm.contacts.phones, incoming.phones);
  addUnique(farm.contacts.emails, incoming.emails);
  addUnique(farm.contacts.websites, incoming.websites);

  if (!farm.address && incoming.address) farm.address = incoming.address;

  if (incoming.signals) {
    for (const [key, value] of Object.entries(incoming.signals)) {
      if (value === true) farm.signals[key] = true;
    }
  }

  if (incoming.funding) {
    farm.funding.records += incoming.funding.records ?? 0;
    farm.funding.totalKnownAmount += incoming.funding.totalKnownAmount ?? 0;
    if (
      incoming.funding.latestYear &&
      (!farm.funding.latestYear ||
        String(incoming.funding.latestYear) > String(farm.funding.latestYear))
    ) {
      farm.funding.latestYear = incoming.funding.latestYear;
    }
  }

  if (evidence) addEvidence(farm, evidence);
  farm.lastObservedAt = generatedAt;
  return farm;
}

function classifyProducts(products) {
  const text = products.join(" ").toLowerCase();
  const categories = [];

  const rules = [
    ["VEGETABLES", /\bvegetable|potato|onion|carrot|cabbage|broccoli|cauliflower|celery|cucumber|squash|zucchini|pepper|tomato|turnip|rutabaga|beet|lettuce|kale|greens\b/],
    ["FRUIT", /\bfruit|apple|pear|peach|plum|berry|berries|cranberry|blueberry|raspberry|strawberry|melon|grape\b/],
    ["GRAINS_PANTRY", /\bflour|grain|oat|rice|bean|lentil|cereal\b/],
    ["MUSHROOMS", /\bmushroom\b/],
    ["HONEY_MAPLE", /\bhoney|maple\b/],
    ["HERBS", /\bherb|spice\b/],
    ["EGGS", /\begg\b/],
    ["DAIRY", /\bdairy|milk|cheese|cream\b/],
    ["MEAT_POULTRY", /\bmeat|beef|pork|lamb|chicken|turkey|poultry\b/],
    ["SEAFOOD", /\bseafood|fish|salmon|mussel|lobster\b/],
    ["BAKERY_PREPARED", /\bbakery|baked|prepared|meal\b/],
    ["BEVERAGES", /\bbeverage|juice|cider|coffee|tea\b/],
  ];

  for (const [category, regex] of rules) {
    if (regex.test(text)) categories.push(category);
  }
  return categories;
}

function regionBonus(farm) {
  const text = [farm.address, ...farm.regions, ...farm.locations]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /halifax|dartmouth|bedford|sackville|annapolis|valley|truro|hants/.test(
    text,
  );
}

function stableStapleMatch(products) {
  return hasAnyTerm(products, [
    "apple",
    "potato",
    "onion",
    "carrot",
    "cabbage",
    "squash",
    "flour",
    "grain",
    "oats",
    "rice",
  ]);
}

function scoreFarm(farm) {
  let score = 0;
  const reasons = [];
  const phase1 = productTokens(farm.products).filter((product) =>
    config.phase1ProductTerms.some((term) =>
      product.includes(String(term).toLowerCase()),
    ),
  );
  const later = productTokens(farm.products).filter((product) =>
    config.laterPhaseProductTerms.some((term) =>
      product.includes(String(term).toLowerCase()),
    ),
  );

  if (farm.signals.foodHubProducer) {
    score += 40;
    reasons.push("Halifax Food Hub producer");
  }
  if (farm.signals.buyLocalWholesaler) {
    score += 25;
    reasons.push("Buy Local NS wholesaler");
  }
  if (farm.signals.buyLocalSupplier) {
    score += 18;
    reasons.push("Buy Local NS supplier");
  }
  if (phase1.length) {
    score += 15;
    reasons.push("phase-1 compatible product evidence");
  }
  if (stableStapleMatch(farm.products)) {
    score += 10;
    reasons.push("storage-stable staple products");
  }
  if (farm.signals.delivery) {
    score += 8;
    reasons.push("public delivery signal");
  }
  if (farm.signals.csa2026) {
    score += 7;
    reasons.push("2026 CSA program participant");
  }
  if (farm.signals.acornDirectory) {
    score += 5;
    reasons.push("organic-directory evidence");
  }
  if (regionBonus(farm)) {
    score += 5;
    reasons.push("Halifax/central/Valley proximity");
  }
  if (farm.signals.agricultureFundingRecipient) {
    score += 2;
    reasons.push("agriculture-program recipient record");
  }
  if (!phase1.length && later.length) {
    score -= 15;
    reasons.push("current products are mainly later-phase categories");
  }

  score = Math.max(0, Math.min(100, score));
  farm.harbourCart = {
    fitScore: score,
    fitBand: score >= 65 ? "HIGH" : score >= 40 ? "MEDIUM" : "DISCOVERY",
    reasons,
    phase1ProductMatches: [...new Set(phase1)].slice(0, 12),
    laterPhaseProductMatches: [...new Set(later)].slice(0, 12),
  };
}

function applySeasonality(farm) {
  const current = seasonality[season] ?? [];
  const normalizedFarmProducts = productTokens(farm.products);
  const matches = [];

  for (const seasonalProduct of current) {
    const seasonal = seasonalProduct.toLowerCase();
    if (
      normalizedFarmProducts.some(
        (product) =>
          product.includes(seasonal) ||
          seasonal.includes(product.replace(/s$/, "")),
      )
    ) {
      matches.push(seasonalProduct);
    }
  }

  farm.currentSeasonScreen = {
    season,
    status: matches.length ? "SEASONAL_MATCH" : "NO_MATCH",
    matchedProducts: [...new Set(matches)],
    sourceId: "FMNS_SEASONALITY",
    note:
      "Province-wide seasonality screen only; it does not confirm this farm's current-week inventory.",
  };
}

async function runSource(source, fn) {
  recordSource(source);
  try {
    const result = await fn(source);
    source.status = result.status ?? "SUCCESS";
    source.recordCount = result.recordCount ?? 0;
    source.requestCount = result.requestCount ?? source.requestCount;
    if (result.errors?.length) source.errors.push(...result.errors);
  } catch (error) {
    source.status = "FAILED";
    source.errors.push(error instanceof Error ? error.message : String(error));
  }
  recordSource(source);
}

async function ingestBuyLocal(source) {
  const summaries = new Map();
  let requestCount = 0;
  let emptyPages = 0;

  for (let page = 0; page < config.buyLocal.maxPages; page += 1) {
    const url = config.buyLocal.searchUrlTemplate.replace("{page}", String(page));
    const response = await fetchText(url);
    requestCount += 1;
    const rows = parseBuyLocalSearchPage(response.text, response.url);

    if (!rows.length) {
      emptyPages += 1;
      if (emptyPages >= 2) break;
    } else {
      emptyPages = 0;
    }

    let newCount = 0;
    for (const row of rows) {
      if (!summaries.has(row.detailUrl)) {
        summaries.set(row.detailUrl, row);
        newCount += 1;
      }
    }
    if (page > 0 && newCount === 0) break;
    await delay(config.requestDelayMs);
  }

  const candidates = [...summaries.values()].filter(
    (row) =>
      looksFarmLike(row.name, config) ||
      hasAnyTerm(row.products, [
        ...config.phase1ProductTerms,
        ...config.laterPhaseProductTerms,
      ]),
  );

  let detailsFetched = 0;
  for (const summary of candidates.slice(0, config.buyLocal.maxDetailPages)) {
    let detail = summary;
    try {
      const response = await fetchText(summary.detailUrl);
      requestCount += 1;
      detail = parseBuyLocalDetail(response.text, response.url, summary);
      detailsFetched += 1;
      await delay(config.requestDelayMs);
    } catch (error) {
      source.errors.push(
        "detail " +
          summary.detailUrl +
          ": " +
          (error instanceof Error ? error.message : String(error)),
      );
    }

    const relevantRole = (detail.roles ?? []).some((role) =>
      ["FARM", "PRODUCER", "SUPPLIER", "WHOLESALER", "PROCESSOR"].includes(role),
    );
    const relevantProduct = hasAnyTerm(detail.products ?? [], [
      ...config.phase1ProductTerms,
      ...config.laterPhaseProductTerms,
    ]);
    if (!relevantRole && !relevantProduct && !looksFarmLike(detail.name, config)) {
      continue;
    }

    mergeFarm(
      detail.name,
      {
        roles: detail.roles,
        address: detail.address,
        regions: detail.regions,
        products: detail.products,
        whereToBuy: detail.whereToBuy,
        attributes: detail.attributes,
        phones: [detail.phone],
        emails: [detail.email],
        websites: [detail.website],
        signals: {
          buyLocalFarm: detail.roles?.includes("FARM"),
          buyLocalProducer: detail.roles?.includes("PRODUCER"),
          buyLocalSupplier: detail.roles?.includes("SUPPLIER"),
          buyLocalWholesaler: detail.roles?.includes("WHOLESALER"),
          delivery: detail.delivery,
          onlineShop: detail.onlineShop,
        },
      },
      {
        sourceId: "BUY_LOCAL_NS",
        sourceLabel: "Buy Local NS",
        recordName: detail.name,
        recordUrl: detail.detailUrl,
        fields: [
          "roles",
          "address",
          "regions",
          "products",
          "contacts",
          "whereToBuy",
          "attributes",
        ],
      },
    );
  }

  return {
    status: detailsFetched ? "SUCCESS" : "PARTIAL",
    recordCount: farmsWithSource("BUY_LOCAL_NS"),
    requestCount,
    errors: source.errors,
  };
}

function farmsWithSource(sourceId) {
  return [...farms.values()].filter((farm) =>
    farm.evidence.some((evidence) => evidence.sourceId === sourceId),
  ).length;
}

async function ingestFoodHub(source) {
  const response = await fetchText(config.foodHub.url);
  const names = parseFoodHubProducerNames(response.text);

  for (const name of names) {
    mergeFarm(
      name,
      {
        roles: ["FOOD_HUB_PRODUCER"],
        signals: { foodHubProducer: true },
      },
      {
        sourceId: "HALIFAX_FOOD_HUB",
        sourceLabel: "Halifax Regional Food Hub producer roster",
        recordName: name,
        recordUrl: response.url,
        fields: ["foodHubProducer"],
      },
    );
  }

  return {
    status: names.length >= 10 ? "SUCCESS" : "PARTIAL",
    recordCount: names.length,
    requestCount: 1,
    errors: names.length ? [] : ["No producer names parsed."],
  };
}

async function ingestAcorn(source) {
  let requestCount = 0;
  let empty = 0;
  const seen = new Set();

  for (
    let offset = 0;
    offset <= config.acorn.maxOffset;
    offset += config.acorn.pageSize
  ) {
    const url = config.acorn.urlTemplate.replace("{offset}", String(offset));
    const response = await fetchText(url);
    requestCount += 1;
    const rows = parseAcornPage(response.text, response.url);

    if (!rows.length) {
      empty += 1;
      if (empty >= 2) break;
    } else {
      empty = 0;
    }

    for (const row of rows) {
      const signature = canonicalKey(row.name);
      if (seen.has(signature)) continue;
      seen.add(signature);

      mergeFarm(
        row.name,
        {
          roles: ["ORGANIC_DIRECTORY"],
          locations: [row.location],
          products: row.summary ? [row.summary] : [],
          phones: [row.phone],
          emails: [row.email],
          websites: [row.website],
          signals: {
            acornDirectory: true,
            acornMember: row.member,
          },
        },
        {
          sourceId: "ACORN_ORGANIC",
          sourceLabel: "ACORN Organic Directory",
          recordName: row.name,
          recordUrl: row.sourceUrl,
          fields: ["location", "organicDirectory", "products", "contacts"],
        },
      );
    }
    await delay(config.requestDelayMs);
  }

  return {
    status: seen.size ? "SUCCESS" : "PARTIAL",
    recordCount: seen.size,
    requestCount,
    errors: seen.size ? [] : ["No Nova Scotia ACORN records parsed."],
  };
}

async function ingestCsa(source) {
  const response = await fetchText(config.nsfaCsa.url);
  let rows = parseGenericNamedDirectory(response.text, response.url);
  let requestCount = 1;
  const iframeUrls = extractIframeUrls(response.text, response.url);

  for (const iframeUrl of iframeUrls.slice(0, 5)) {
    try {
      const frame = await fetchText(iframeUrl);
      requestCount += 1;
      rows = rows.concat(parseGenericNamedDirectory(frame.text, frame.url));
    } catch (error) {
      source.errors.push(
        "iframe " +
          iframeUrl +
          ": " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  const uniqueRows = new Map();
  for (const row of rows) uniqueRows.set(canonicalKey(row.name), row);

  for (const row of uniqueRows.values()) {
    mergeFarm(
      row.name,
      {
        roles: ["CSA_2026"],
        locations: [row.location],
        phones: [row.phone],
        emails: [row.email],
        websites: [row.website],
        signals: { csa2026: true },
      },
      {
        sourceId: "NSFA_CSA_2026",
        sourceLabel: "NSFA 2026 CSA Directory",
        recordName: row.name,
        recordUrl: row.sourceUrl,
        fields: ["csa2026", "location", "contacts"],
      },
    );
  }

  return {
    status: uniqueRows.size ? "SUCCESS" : "PARTIAL",
    recordCount: uniqueRows.size,
    requestCount,
    errors: uniqueRows.size
      ? source.errors
      : source.errors.concat(
          "CSA directory wrapper loaded but no farm records were machine-readable.",
        ),
  };
}

async function ingestFmns(source) {
  const [marketResponse, seasonResponse] = await Promise.all([
    fetchText(config.fmns.marketsUrl),
    fetchText(config.fmns.seasonalityUrl),
  ]);
  const parsedMarkets = parseFmnsMarkets(
    marketResponse.text,
    marketResponse.url,
  );
  markets.push(...parsedMarkets);
  seasonality = parseFmnsSeasonality(seasonResponse.text);

  return {
    status:
      parsedMarkets.length >= 30 && Object.keys(seasonality).length >= 4
        ? "SUCCESS"
        : "PARTIAL",
    recordCount: parsedMarkets.length,
    requestCount: 2,
    errors: [],
  };
}

async function ingestFunding(source) {
  const response = await fetchText(config.agFunding.csvUrl, {
    accept: "text/csv,text/plain,*/*",
    timeoutMs: 30_000,
  });
  const rows = parseAgricultureFundingCsv(response.text);
  const grouped = new Map();

  for (const row of rows) {
    const key = canonicalKey(row.recipient);
    if (!grouped.has(key)) {
      grouped.set(key, {
        name: row.recipient,
        records: 0,
        totalKnownAmount: 0,
        latestYear: undefined,
        programs: new Set(),
      });
    }
    const group = grouped.get(key);
    group.records += 1;
    if (Number.isFinite(row.amount)) group.totalKnownAmount += row.amount;
    if (row.year && (!group.latestYear || row.year > group.latestYear)) {
      group.latestYear = row.year;
    }
    if (row.program) group.programs.add(row.program);
  }

  let attached = 0;
  let created = 0;
  for (const [key, group] of grouped) {
    const existing = farms.get(key);
    if (!existing && !fundingRecipientLooksAgricultural(group.name)) continue;
    if (!existing) created += 1;

    mergeFarm(
      group.name,
      {
        roles: existing ? [] : ["AGRICULTURE_FUNDING_RECIPIENT"],
        signals: { agricultureFundingRecipient: true },
        funding: {
          records: group.records,
          totalKnownAmount: group.totalKnownAmount,
          latestYear: group.latestYear,
        },
      },
      {
        sourceId: "NS_AG_FUNDING",
        sourceLabel: "Nova Scotia Agriculture Funding Programs Details",
        recordName: group.name,
        recordUrl: config.agFunding.csvUrl,
        fields: ["recipient", "fundingHistory"],
        note:
          "Funding history is a discovery/backfill signal only and does not establish current operations, products, wholesale availability, or HarbourCart eligibility.",
      },
    );
    attached += 1;
  }

  return {
    status: rows.length ? "SUCCESS" : "PARTIAL",
    recordCount: attached,
    requestCount: 1,
    errors: rows.length
      ? []
      : ["Agriculture funding CSV contained no parseable recipient rows."],
    created,
  };
}

function retainPreviousForFailedSources() {
  if (!previous?.farms?.length) return;
  const failed = new Set(
    sourceHealth
      .filter((source) => source.status === "FAILED")
      .map((source) => source.id),
  );
  if (!failed.size) return;

  for (const previousFarm of previous.farms) {
    const retainedEvidence = (previousFarm.evidence ?? []).filter((evidence) =>
      failed.has(evidence.sourceId),
    );
    if (!retainedEvidence.length) continue;

    const farm = ensureFarm(previousFarm.canonicalName);
    addUnique(farm.aliases, previousFarm.aliases);
    addUnique(farm.roles, previousFarm.roles);
    addUnique(farm.regions, previousFarm.regions);
    addUnique(farm.locations, previousFarm.locations);
    addUnique(farm.products, previousFarm.products);
    addUnique(farm.whereToBuy, previousFarm.whereToBuy);
    addUnique(farm.attributes, previousFarm.attributes);
    addUnique(farm.contacts.phones, previousFarm.contacts?.phones);
    addUnique(farm.contacts.emails, previousFarm.contacts?.emails);
    addUnique(farm.contacts.websites, previousFarm.contacts?.websites);
    if (!farm.address) farm.address = previousFarm.address;

    for (const [key, value] of Object.entries(previousFarm.signals ?? {})) {
      if (value === true) farm.signals[key] = true;
    }

    for (const evidence of retainedEvidence) {
      addEvidence(farm, {
        ...evidence,
        staleRetained: true,
        observedAt: evidence.observedAt,
      });
    }
  }

  for (const source of sourceHealth) {
    if (source.status === "FAILED") {
      const retained = [...farms.values()].filter((farm) =>
        farm.evidence.some(
          (evidence) =>
            evidence.sourceId === source.id && evidence.staleRetained,
        ),
      ).length;
      if (retained) {
        source.status = "STALE_RETAINED";
        source.retainedRecordCount = retained;
      }
    }
  }
}

function attachMarketMatches() {
  if (!markets.length) return;
  for (const farm of farms.values()) {
    const matched = [];
    for (const location of farm.whereToBuy) {
      const normalized = normalizeBusinessName(location);
      const market = markets.find((candidate) => {
        const marketName = normalizeBusinessName(candidate.name);
        return (
          marketName === normalized ||
          marketName.includes(normalized) ||
          normalized.includes(marketName)
        );
      });
      if (market) matched.push(market.name);
    }
    farm.marketAssociations = [...new Set(matched)];
  }
}

await runSource(
  sourceEntry(
    "BUY_LOCAL_NS",
    "Buy Local NS",
    "https://buylocal.novascotia.ca/business-search",
  ),
  ingestBuyLocal,
);

await runSource(
  sourceEntry(
    "HALIFAX_FOOD_HUB",
    "Halifax Regional Food Hub producer roster",
    config.foodHub.url,
  ),
  ingestFoodHub,
);

await runSource(
  sourceEntry(
    "ACORN_ORGANIC",
    "ACORN Organic Directory",
    "https://acornorganic.org/resources/organicdirectory",
  ),
  ingestAcorn,
);

await runSource(
  sourceEntry(
    "NSFA_CSA_2026",
    "NSFA 2026 CSA Directory",
    config.nsfaCsa.url,
  ),
  ingestCsa,
);

await runSource(
  sourceEntry(
    "FMNS_MARKETS",
    "Farmers' Markets of Nova Scotia",
    config.fmns.marketsUrl,
  ),
  ingestFmns,
);

await runSource(
  sourceEntry(
    "NS_AG_FUNDING",
    "Nova Scotia Agriculture Funding Programs Details",
    config.agFunding.csvUrl,
  ),
  ingestFunding,
);

retainPreviousForFailedSources();
attachMarketMatches();

for (const farm of farms.values()) {
  farm.productCategories = classifyProducts(farm.products);
  applySeasonality(farm);
  scoreFarm(farm);
  farm.aliases.sort();
  farm.roles.sort();
  farm.regions.sort();
  farm.locations.sort();
  farm.products.sort();
  farm.productCategories.sort();
  farm.whereToBuy.sort();
  farm.attributes.sort();
  farm.contacts.phones.sort();
  farm.contacts.emails.sort();
  farm.contacts.websites.sort();
  farm.evidence.sort((a, b) =>
    (a.sourceId + (a.recordUrl ?? "")).localeCompare(
      b.sourceId + (b.recordUrl ?? ""),
    ),
  );
}

const farmList = [...farms.values()].sort(
  (a, b) =>
    b.harbourCart.fitScore - a.harbourCart.fitScore ||
    a.canonicalName.localeCompare(b.canonicalName),
);

const sourceCounts = Object.fromEntries(
  sourceHealth.map((source) => [source.id, source.recordCount]),
);

const feed = {
  schemaVersion: 1,
  generatedAt,
  currentNovaScotiaSeason: season,
  refreshCadence: config.refreshCadence,
  evidenceContract: {
    discoveryListingIsNotWholesaleEvidence: true,
    fundingRecipientIsNotSupplierEvidence: true,
    seasonalMatchIsNotInventoryConfirmation: true,
    foodHubProducerIsWholesaleChannelEvidence: true,
    currentPriceRequiresSeparateQuoteEvidence: true,
  },
  stats: {
    farms: farmList.length,
    highFit: farmList.filter(
      (farm) => farm.harbourCart.fitBand === "HIGH",
    ).length,
    mediumFit: farmList.filter(
      (farm) => farm.harbourCart.fitBand === "MEDIUM",
    ).length,
    foodHubProducers: farmList.filter(
      (farm) => farm.signals.foodHubProducer,
    ).length,
    buyLocalSuppliers: farmList.filter(
      (farm) => farm.signals.buyLocalSupplier,
    ).length,
    buyLocalWholesalers: farmList.filter(
      (farm) => farm.signals.buyLocalWholesaler,
    ).length,
    csa2026: farmList.filter((farm) => farm.signals.csa2026).length,
    acornDirectory: farmList.filter(
      (farm) => farm.signals.acornDirectory,
    ).length,
    fundingRecipients: farmList.filter(
      (farm) => farm.signals.agricultureFundingRecipient,
    ).length,
    markets: markets.length,
    sourceCounts,
  },
  sources: sourceHealth,
  seasonality,
  markets: markets.sort((a, b) => a.name.localeCompare(b.name)),
  farms: farmList,
};

await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await fs.writeFile(OUTPUT_PATH, JSON.stringify(feed, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      generatedAt,
      farms: feed.stats.farms,
      highFit: feed.stats.highFit,
      foodHubProducers: feed.stats.foodHubProducers,
      markets: feed.stats.markets,
      sources: sourceHealth.map((source) => ({
        id: source.id,
        status: source.status,
        records: source.recordCount,
        requests: source.requestCount,
        errors: source.errors.length,
      })),
    },
    null,
    2,
  ),
);
