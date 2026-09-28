import type { PriceTier } from "../domain/economics";

export type EvidenceStatus =
  | "PUBLIC_SCREEN"
  | "ILLUSTRATIVE_MODEL"
  | "QUOTE_REQUIRED";

export type CandidateBuy = {
  id: string;
  title: string;
  unitLabel: string;
  category: string;
  locationLabel: string;
  households: number;
  goal: number;
  publicReferencePrice: number;
  publicCasePrice: number;
  structuralSpread: number;
  tiers: PriceTier[];
  evidenceStatus: EvidenceStatus;
  evidenceLabel: string;
  sourceUrl: string;
  sourceObserved: string;
  note: string;
};

export const candidateBuys: CandidateBuy[] = [
  {
    id: "roma-tomatoes",
    title: "Roma tomatoes",
    unitLabel: "candidate case split",
    category: "Produce",
    locationLabel: "Halifax pilot",
    households: 67,
    goal: 100,
    publicReferencePrice: 6.61,
    publicCasePrice: 3.08,
    structuralSpread: 0.534,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 22 },
      { minimumHouseholds: 50, customerPrice: 19 },
      { minimumHouseholds: 100, customerPrice: 17 },
    ],
    evidenceStatus: "PUBLIC_SCREEN",
    evidenceLabel: "Public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/fresh-vegetables/tomatoes-peppers/tomatoes/c/34502",
    sourceObserved: "2026-09-28",
    note:
      "This is not yet a Halifax supplier quote. It is a public pack-size signal that tells procurement where to ask for a real quote.",
  },
  {
    id: "broccoli-crowns",
    title: "Broccoli crowns",
    unitLabel: "candidate case split",
    category: "Produce",
    locationLabel: "Halifax pilot",
    households: 41,
    goal: 100,
    publicReferencePrice: 8.82,
    publicCasePrice: 3.75,
    structuralSpread: 0.575,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 24 },
      { minimumHouseholds: 50, customerPrice: 21 },
      { minimumHouseholds: 100, customerPrice: 18 },
    ],
    evidenceStatus: "PUBLIC_SCREEN",
    evidenceLabel: "Public structural screen",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/fresh-vegetables/broccoli-cabbage-cauliflower/broccoli/c/34495",
    sourceObserved: "2026-09-28",
    note:
      "Promising structural spread; handling and a real local supplier price remain evidence gates.",
  },
  {
    id: "english-cucumber",
    title: "English cucumber",
    unitLabel: "candidate 3-pack share",
    category: "Produce",
    locationLabel: "Halifax pilot",
    households: 83,
    goal: 100,
    publicReferencePrice: 1.75,
    publicCasePrice: 17.99 / 12,
    structuralSpread: 0.143,
    tiers: [
      { minimumHouseholds: 1, customerPrice: 5.25 },
      { minimumHouseholds: 50, customerPrice: 4.85 },
      { minimumHouseholds: 100, customerPrice: 4.5 },
    ],
    evidenceStatus: "QUOTE_REQUIRED",
    evidenceLabel: "Margin likely too thin",
    sourceUrl:
      "https://www.wholesaleclub.ca/en/food/fruits-vegetables/fresh-vegetables/c/28195",
    sourceObserved: "2026-09-28",
    note:
      "A useful negative control: group buying should not publish a buy merely because a case is available.",
  },
];

export const demandIdeas = [
  { name: "Eggs", households: 196, target: 220 },
  { name: "Chicken breasts", households: 142, target: 180 },
  { name: "Apples", households: 128, target: 150 },
  { name: "Rice & pantry staples", households: 113, target: 150 },
];
