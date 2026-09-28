export type RetailSignalScope =
  | "NOVA_SCOTIA_FLYER"
  | "ATLANTIC_SUPERSTORE_PUBLIC_CATALOGUE";

export type RetailPriceSignal = {
  id: string;
  product: string;
  price: number;
  quantity?: number;
  unit?: string;
  promo: boolean;
  scope: RetailSignalScope;
  validFrom?: string;
  validTo?: string;
  observedAt: string;
  sourceUrl: string;
  normalizationStatus: "READY" | "UNIT_REQUIRED" | "STORE_CONFIRMATION_REQUIRED";
  note: string;
};

/**
 * These signals intentionally do NOT use the CURRENT_LOCAL benchmark status.
 * They are current public/regional observations used to decide what requires
 * store-level verification. HarbourCart's publication engine still requires
 * a confirmed Halifax-local comparator.
 */
export const currentRetailSignals: RetailPriceSignal[] = [
  {
    id: "as-royal-gala-loose-20260928",
    product: "Royal Gala apples",
    price: 6.61,
    quantity: 1,
    unit: "kg",
    promo: false,
    scope: "ATLANTIC_SUPERSTORE_PUBLIC_CATALOGUE",
    observedAt: "2026-09-28",
    sourceUrl: "https://www.atlanticsuperstore.ca/en/search?search-bar=apples",
    normalizationStatus: "STORE_CONFIRMATION_REQUIRED",
    note:
      "Public Atlantic Superstore catalogue currently shows $6.61/kg. Store applicability must be confirmed before use as a Halifax publication benchmark.",
  },
  {
    id: "as-imperfect-apples-20260928",
    product: "No Name Naturally Imperfect apples",
    price: 7,
    quantity: 2.72,
    unit: "kg",
    promo: true,
    scope: "ATLANTIC_SUPERSTORE_PUBLIC_CATALOGUE",
    observedAt: "2026-09-28",
    sourceUrl: "https://www.atlanticsuperstore.ca/en/search?search-bar=apples",
    normalizationStatus: "STORE_CONFIRMATION_REQUIRED",
    note:
      "Current public catalogue shows a 6 lb / 2.72 kg bag at $7 sale price. This demonstrates why HarbourCart must compare against value packs, not only loose premium apples.",
  },
  {
    id: "as-carrots-flyer-20260928",
    product: "Farmer's Market yellow onions or carrots",
    price: 2,
    promo: true,
    scope: "NOVA_SCOTIA_FLYER",
    validFrom: "2026-09-24",
    validTo: "2026-09-30",
    observedAt: "2026-09-28",
    sourceUrl:
      "https://aubaine.ca/en/flyers/nouvelle-ecosse/atlantic-superstore-ns",
    normalizationStatus: "UNIT_REQUIRED",
    note:
      "Nova Scotia flyer extraction shows a $2 promotion but the aggregate text does not safely preserve package/unit details. Do not normalize or compare until the actual flyer card is verified.",
  },
  {
    id: "as-roma-flyer-20260928",
    product: "Roma tomatoes",
    price: 2,
    promo: true,
    scope: "NOVA_SCOTIA_FLYER",
    validFrom: "2026-09-24",
    validTo: "2026-09-30",
    observedAt: "2026-09-28",
    sourceUrl:
      "https://aubaine.ca/en/flyers/nouvelle-ecosse/atlantic-superstore-ns",
    normalizationStatus: "UNIT_REQUIRED",
    note:
      "Nova Scotia flyer extraction shows $2 for Roma tomatoes. Unit/package detail must be verified from the flyer/merchant before economic use.",
  },
  {
    id: "as-broccoli-flyer-20260928",
    product: "Broccoli crowns",
    price: 2.5,
    promo: true,
    scope: "NOVA_SCOTIA_FLYER",
    validFrom: "2026-09-24",
    validTo: "2026-09-30",
    observedAt: "2026-09-28",
    sourceUrl:
      "https://aubaine.ca/en/flyers/nouvelle-ecosse/atlantic-superstore-ns",
    normalizationStatus: "UNIT_REQUIRED",
    note:
      "Nova Scotia flyer extraction shows $2.50 for broccoli crowns. Unit/package detail must be verified before use.",
  },
  {
    id: "as-cucumber-flyer-20260928",
    product: "English cucumber",
    price: 1.5,
    quantity: 1,
    unit: "ea",
    promo: true,
    scope: "ATLANTIC_SUPERSTORE_PUBLIC_CATALOGUE",
    validFrom: "2026-09-24",
    validTo: "2026-09-30",
    observedAt: "2026-09-28",
    sourceUrl:
      "https://www.atlanticsuperstore.ca/en/collection/fall-essentials",
    normalizationStatus: "STORE_CONFIRMATION_REQUIRED",
    note:
      "Public catalogue shows $1.50 each, formerly $2.00. This effectively erases the earlier case-price signal until a better real supplier quote exists.",
  },
];
