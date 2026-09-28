import type {
  EvidenceStatus,
  HandlingStatus,
  MeasurementStatus,
  PriceTier,
} from "../domain/economics";

export type PilotCandidate = {
  id: string;
  product: string;
  category: string;
  householdQuantity: number;
  unit: "kg" | "ea";
  sourceLabel: string;
  sourceUrl: string;
  observedAt: string;
  publicReferenceUnitPrice: number;
  publicCaseUnitPrice: number;
  supplierEvidence: EvidenceStatus;
  benchmarkEvidence: EvidenceStatus;
  handlingStatus: HandlingStatus;
  measurementStatus: MeasurementStatus;
  saleBasis: "COUNT" | "WEIGHED_SHARE" | "SEALED_PACK";
  handlingLabel: string;
  householdsInterested: number;
  targetHouseholds: number;
  tiers: PriceTier[];
  freightPerHousehold: number;
  note: string;
};

export type DemandIdea = {
  id: string;
  name: string;
  unitLabel: string;
  targetPrice: number;
  baseHouseholds: number;
  targetHouseholds: number;
  handlingStatus: HandlingStatus;
};

export const pilotCandidates: PilotCandidate[] = [
  {
    id: "roma-tomatoes",
    product: "Roma tomatoes",
    category: "Produce",
    householdQuantity: 2,
    unit: "kg",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/international-foods/south-asian-foods/c/58045",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 6.61,
    publicCaseUnitPrice: 3.08,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "REQUIRES_CONFIRMATION",
    measurementStatus: "TRADE_SCALE_REQUIRED",
    saleBasis: "WEIGHED_SHARE",
    handlingLabel: "Loose whole-produce case split needs written classification",
    householdsInterested: 67,
    targetHouseholds: 100,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 11.25 },
      { minimumHouseholds: 50, customerPrice: 10.5 },
      { minimumHouseholds: 100, customerPrice: 9.95 },
    ],
    freightPerHousehold: 0.35,
    note:
      "Strong structural spread. This is a procurement lead, not a Halifax supplier quote or customer savings claim.",
  },
  {
    id: "broccoli-crowns",
    product: "Broccoli crowns",
    category: "Produce",
    householdQuantity: 1.5,
    unit: "kg",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/fresh-vegetables/broccoli-cabbage-cauliflower/broccoli/c/34495",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 8.82,
    publicCaseUnitPrice: 3.75,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "REQUIRES_CONFIRMATION",
    measurementStatus: "TRADE_SCALE_REQUIRED",
    saleBasis: "WEIGHED_SHARE",
    handlingLabel: "Loose whole-produce case split needs written classification",
    householdsInterested: 41,
    targetHouseholds: 100,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 11.25 },
      { minimumHouseholds: 50, customerPrice: 10.5 },
      { minimumHouseholds: 100, customerPrice: 9.95 },
    ],
    freightPerHousehold: 0.35,
    note:
      "Large public loose-vs-case spread, but publication remains blocked until quote, local comparator, and handling evidence are complete.",
  },
  {
    id: "broccoli-heads",
    product: "Broccoli heads",
    category: "Produce",
    householdQuantity: 3,
    unit: "ea",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/fresh-vegetables/broccoli-cabbage-cauliflower/broccoli/c/34495",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 5,
    publicCaseUnitPrice: 2.89,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "COUNT",
    handlingLabel: "Whole unprocessed produce; no cutting or washing by HarbourCart",
    householdsInterested: 58,
    targetHouseholds: 90,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 12.75 },
      { minimumHouseholds: 50, customerPrice: 12 },
      { minimumHouseholds: 90, customerPrice: 11.5 },
    ],
    freightPerHousehold: 0.35,
    note:
      "Whole heads are operationally simpler than weighed case splits, but real procurement and Halifax benchmark evidence are still required.",
  },
  {
    id: "green-cabbage",
    product: "Green cabbage",
    category: "Produce",
    householdQuantity: 2,
    unit: "kg",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/clpplp/clpplp/food/c/27985?page=2",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 3.28,
    publicCaseUnitPrice: 1.91,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "REQUIRES_CONFIRMATION",
    measurementStatus: "TRADE_SCALE_REQUIRED",
    saleBasis: "WEIGHED_SHARE",
    handlingLabel: "Case split by weight needs written classification",
    householdsInterested: 52,
    targetHouseholds: 90,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 5.55 },
      { minimumHouseholds: 50, customerPrice: 5.25 },
      { minimumHouseholds: 90, customerPrice: 4.95 },
    ],
    freightPerHousehold: 0.3,
    note:
      "Promising public spread, but current weekly sales can materially change the comparator.",
  },
  {
    id: "gala-apples",
    product: "Royal Gala apples",
    category: "Produce",
    householdQuantity: 2.5,
    unit: "kg",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/clpplp/clpplp/food/c/27985?page=2",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 6.61,
    publicCaseUnitPrice: 3.63,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "REQUIRES_CONFIRMATION",
    measurementStatus: "TRADE_SCALE_REQUIRED",
    saleBasis: "WEIGHED_SHARE",
    handlingLabel: "Loose case split / customer bagging needs written classification",
    householdsInterested: 128,
    targetHouseholds: 150,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 14 },
      { minimumHouseholds: 100, customerPrice: 13.25 },
      { minimumHouseholds: 150, customerPrice: 12.75 },
    ],
    freightPerHousehold: 0.35,
    note:
      "Demand signal is illustrative. A Nova Scotia orchard quote is higher-priority evidence than this public screen.",
  },
  {
    id: "english-cucumber",
    product: "English cucumbers",
    category: "Produce",
    householdQuantity: 3,
    unit: "ea",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/clpplp/food/fruits-vegetables/fresh-vegetables/cucumber-celery-leeks/cucumber/c/34503",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 1.75,
    publicCaseUnitPrice: 17.99 / 12,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "COUNT",
    handlingLabel: "Whole produce; customer receives whole cucumbers",
    householdsInterested: 83,
    targetHouseholds: 100,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 4.45 },
      { minimumHouseholds: 50, customerPrice: 4.25 },
      { minimumHouseholds: 100, customerPrice: 4.05 },
    ],
    freightPerHousehold: 0.25,
    note:
      "Useful negative control. The structural spread is only about 14%, before payment and fulfilment costs.",
  },
  {
    id: "green-beans",
    product: "Green beans",
    category: "Produce",
    householdQuantity: 1,
    unit: "kg",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/clpplp/clpplp/food/c/27985?page=2",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 11,
    publicCaseUnitPrice: 5.01,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "REQUIRES_CONFIRMATION",
    measurementStatus: "TRADE_SCALE_REQUIRED",
    saleBasis: "WEIGHED_SHARE",
    handlingLabel: "Loose case split / weighed customer bag needs written classification",
    householdsInterested: 36,
    targetHouseholds: 80,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 9.35 },
      { minimumHouseholds: 50, customerPrice: 8.75 },
      { minimumHouseholds: 80, customerPrice: 8.35 },
    ],
    freightPerHousehold: 0.3,
    note:
      "Strong public spread, but fragile produce quality and shrink need to be measured in the pilot.",
  },
  {
    id: "jasmine-rice",
    product: "Jasmine rice",
    category: "Pantry",
    householdQuantity: 8,
    unit: "kg",
    sourceLabel: "Wholesale Club public pack-size screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/clpplp/clpplp/food/c/27985?page=2",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 19 / 8,
    publicCaseUnitPrice: 40 / 18.1,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "SEALED_PACK",
    handlingLabel: "Phase 1 only if sold in an intact manufacturer-sealed pack",
    householdsInterested: 113,
    targetHouseholds: 150,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 16.15 },
      { minimumHouseholds: 100, customerPrice: 15.75 },
      { minimumHouseholds: 150, customerPrice: 15.5 },
    ],
    freightPerHousehold: 0.4,
    note:
      "A larger package is only modestly cheaper per kilogram. Do not assume wholesale-size pantry goods create a worthwhile deal.",
  },,
  {
    id: "yellow-onions",
    product: "Yellow onions · supplier-packed 10 lb bag",
    category: "Produce",
    householdQuantity: 4.54,
    unit: "kg",
    sourceLabel: "Wholesale Club public pack-size screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/search?search-bar=onions",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 3.5 / 1.36,
    publicCaseUnitPrice: 10 / 4.54,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "SEALED_PACK",
    handlingLabel:
      "Phase 1 only as an intact supplier-packed bag; HarbourCart does not weigh the share",
    householdsInterested: 137,
    targetHouseholds: 180,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 9.5 },
      { minimumHouseholds: 100, customerPrice: 8.5 },
      { minimumHouseholds: 180, customerPrice: 7.5 },
    ],
    freightPerHousehold: 0.35,
    note:
      "The public pack-size spread is modest and current grocery promotions can beat it. This candidate should survive only if a real supplier quote beats the live local comparator.",
  },
  {
    id: "russet-potatoes",
    product: "Russet potatoes · supplier-packed 10 lb bag",
    category: "Produce",
    householdQuantity: 4.54,
    unit: "kg",
    sourceLabel: "Wholesale Club public pack-size screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/collection/shop-seasonal-fruits-vegetables",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 7 / 4.54,
    publicCaseUnitPrice: 8.48 / 9.07,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "SEALED_PACK",
    handlingLabel:
      "Phase 1 only as an intact supplier-packed bag; public size comparison is not a supplier quote",
    householdsInterested: 164,
    targetHouseholds: 200,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 8.5 },
      { minimumHouseholds: 100, customerPrice: 7.5 },
      { minimumHouseholds: 200, customerPrice: 6.75 },
    ],
    freightPerHousehold: 0.35,
    note:
      "The structural screen compares similar large potato packs, not a verified identical grade/brand. Real supplier terms control.",
  },
  {
    id: "cauliflower",
    product: "Cauliflower · 2 heads",
    category: "Produce",
    householdQuantity: 2,
    unit: "ea",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/c/28000",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 6,
    publicCaseUnitPrice: 3.92,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "COUNT",
    handlingLabel: "Whole produce sold by fixed count",
    householdsInterested: 74,
    targetHouseholds: 100,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 10 },
      { minimumHouseholds: 75, customerPrice: 9 },
      { minimumHouseholds: 100, customerPrice: 8.5 },
    ],
    freightPerHousehold: 0.3,
    note:
      "Fixed-count produce avoids HarbourCart trade weighing. A real supplier quote and live local comparison are still required.",
  },
  {
    id: "celery",
    product: "Celery · 2 stalks",
    category: "Produce",
    householdQuantity: 2,
    unit: "ea",
    sourceLabel: "Wholesale Club public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/fresh-vegetables/cucumber-celery-leeks/c/29615",
    observedAt: "2026-09-28",
    publicReferenceUnitPrice: 4.5,
    publicCaseUnitPrice: 2.2,
    supplierEvidence: "CURRENT_PUBLIC",
    benchmarkEvidence: "CURRENT_PUBLIC",
    handlingStatus: "CONFIRMED_PHASE_1",
    measurementStatus: "NOT_REQUIRED",
    saleBasis: "COUNT",
    handlingLabel: "Whole produce sold by fixed count",
    householdsInterested: 61,
    targetHouseholds: 90,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 7.5 },
      { minimumHouseholds: 60, customerPrice: 6.75 },
      { minimumHouseholds: 90, customerPrice: 6.25 },
    ],
    freightPerHousehold: 0.3,
    note:
      "Fixed-count candidate selected because its operating path is simpler than a weighed share.",
  }
];

export const demandIdeas: DemandIdea[] = [
  {
    id: "russet-potatoes",
    name: "10 lb potatoes",
    unitLabel: "supplier-packed 10 lb bag",
    targetPrice: 7.5,
    baseHouseholds: 164,
    targetHouseholds: 200,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "yellow-onions",
    name: "10 lb onions",
    unitLabel: "supplier-packed 10 lb bag",
    targetPrice: 7,
    baseHouseholds: 137,
    targetHouseholds: 180,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "gala-apples",
    name: "Nova Scotia apples",
    unitLabel: "supplier-packed household bag",
    targetPrice: 10,
    baseHouseholds: 128,
    targetHouseholds: 150,
    handlingStatus: "REQUIRES_CONFIRMATION",
  },
  {
    id: "english-cucumber",
    name: "English cucumbers",
    unitLabel: "3 whole cucumbers",
    targetPrice: 4,
    baseHouseholds: 83,
    targetHouseholds: 100,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "broccoli-heads",
    name: "Broccoli heads",
    unitLabel: "3 whole heads",
    targetPrice: 8,
    baseHouseholds: 58,
    targetHouseholds: 90,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    unitLabel: "2 whole heads",
    targetPrice: 8,
    baseHouseholds: 74,
    targetHouseholds: 100,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "celery",
    name: "Celery",
    unitLabel: "2 whole stalks",
    targetPrice: 6,
    baseHouseholds: 61,
    targetHouseholds: 90,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "carrots",
    name: "Carrots",
    unitLabel: "supplier-packed 3 lb bag",
    targetPrice: 4,
    baseHouseholds: 109,
    targetHouseholds: 140,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "sweet-peppers",
    name: "Sweet peppers",
    unitLabel: "intact supplier-packed bag",
    targetPrice: 6,
    baseHouseholds: 91,
    targetHouseholds: 120,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "jasmine-rice",
    name: "Jasmine rice",
    unitLabel: "8 kg sealed bag",
    targetPrice: 16,
    baseHouseholds: 113,
    targetHouseholds: 150,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "flour",
    name: "All-purpose flour",
    unitLabel: "10 kg sealed bag",
    targetPrice: 10,
    baseHouseholds: 86,
    targetHouseholds: 120,
    handlingStatus: "CONFIRMED_PHASE_1",
  },
  {
    id: "eggs",
    name: "30 eggs",
    unitLabel: "30-count flat",
    targetPrice: 10,
    baseHouseholds: 196,
    targetHouseholds: 220,
    handlingStatus: "NOT_PHASE_1",
  },
];
