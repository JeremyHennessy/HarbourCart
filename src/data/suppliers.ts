export type SupplierTargetKind =
  | "DIRECT_FARM"
  | "WHOLESALER"
  | "FOOD_HUB"
  | "FARM_WHOLESALE";

export type SupplierTargetEvidence =
  | "OFFICIAL_WHOLESALE"
  | "OFFICIAL_SUPPLIER"
  | "OFFICIAL_CHANNEL";

export type SupplierAvailabilityStatus =
  | "YEAR_ROUND"
  | "CURRENT_SEASON"
  | "SEASONAL"
  | "CURRENT_WEEK_CONFIRMED"
  | "INVENTORY_UNKNOWN"
  | "OUT_OF_SEASON";

export type SupplierQuoteStatus =
  | "NOT_REQUESTED"
  | "REQUEST_READY"
  | "QUOTE_REQUESTED"
  | "VERIFIED_QUOTE"
  | "QUOTE_EXPIRED";

export type SupplierPriority = "P1" | "P2" | "P3";

export type SupplierTarget = {
  id: string;
  name: string;
  kind: SupplierTargetKind;
  evidence: SupplierTargetEvidence;
  priority: SupplierPriority;
  products: string[];
  serviceArea: string;
  availabilityStatus: SupplierAvailabilityStatus;
  availabilityBasis: string;
  quoteStatus: SupplierQuoteStatus;
  publicPackFormats?: string[];
  publicCommercialTerms?: string[];
  contactEmail?: string;
  contactPhone?: string;
  sourceUrl: string;
  observedAt: string;
  note: string;
};

export const supplierTargets: SupplierTarget[] = [
  {
    id: "four-seasons-farm",
    name: "Four Seasons Farm",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: [
      "carrots",
      "broccoli",
      "cauliflower",
      "celery",
      "storage onions",
      "potatoes",
      "winter squash",
      "cabbage",
      "cucumbers",
      "tomatoes",
    ],
    serviceArea: "Maitland / Halifax store delivery / Local Source pickup",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Official 2026 pages show fall availability for broccoli, cauliflower, carrots, celery, cucumbers, storage onions, potatoes, winter squash and other produce; exact weekly inventory is sent to regular customers.",
    quoteStatus: "REQUEST_READY",
    publicPackFormats: [
      "retail-ready supplier packaging",
      "case pricing available for all items",
    ],
    publicCommercialTerms: [
      "Thursday delivery during season",
      "CA$75 minimum order",
      "CA$6 delivery charge",
      "pickup at Local Source Windsor/Almon if minimum is not met",
      "updated list issued Monday; orders due Tuesday noon",
    ],
    contactEmail: "order4seasons@gmail.com",
    sourceUrl: "https://fourseasonsfarm.ca/order-from-us/",
    observedAt: "2026-09-28",
    note:
      "Best immediate phase-1 farm lead found in the supply audit because the farm explicitly supports store/restaurant ordering, retail-ready units, case prices, a low minimum and Halifax pickup/delivery. Public price PDF is historical and must not be treated as a current quote.",
  },
  {
    id: "kings-produce",
    name: "Kings Produce",
    kind: "WHOLESALER",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: ["Valley vegetables", "organic produce", "seasonal wholesale produce"],
    serviceArea: "Annapolis Valley / regional wholesale delivery",
    availabilityStatus: "SEASONAL",
    availabilityBasis:
      "Official wholesale page publishes seasonal availability and a wholesale contact; TapRoot routes its weekly wholesale organic list, ordering and delivery through Kings Produce.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "melissa@kingsproduce.ns.ca",
    contactPhone: "902-542-5515 ext. 205",
    sourceUrl: "https://kingsproduce.ns.ca/wholesale/",
    observedAt: "2026-09-28",
    note:
      "High-priority aggregation/packing channel. Kings was formed by growers and operates modern temperature-controlled packing/shipping infrastructure. Request current weekly list, pack sizes, MOQ and Halifax delivery terms rather than inferring them.",
  },
  {
    id: "taproot-farms",
    name: "TapRoot Farms",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: [
      "carrots",
      "beets",
      "cabbage",
      "onions",
      "potatoes",
      "winter squash",
      "turnip",
      "tomatoes",
      "zucchini",
    ],
    serviceArea: "Port Williams / wholesale fulfilled through Kings Produce",
    availabilityStatus: "SEASONAL",
    availabilityBasis:
      "Official farm page documents a weekly wholesale price list for regular restaurant/local-business buyers and states Kings Produce manages the full organic list, orders and delivery.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "melissa@kingsproduce.ns.ca",
    contactPhone: "902-542-3277",
    sourceUrl: "https://taprootfarms.ca/who-we-are/",
    observedAt: "2026-09-28",
    note:
      "Treat TapRoot and Kings as one practical wholesale route when requesting current pricing so HarbourCart does not duplicate logistics or outreach.",
  },
  {
    id: "vermeulen-farms",
    name: "Vermeulen Farms Limited",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: [
      "celery",
      "cucumbers",
      "lettuce",
      "peppers",
      "winter squash",
      "tomatoes",
      "zucchini",
      "radish",
      "melons",
    ],
    serviceArea: "Canning / Atlantic Canada wholesale",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Official farm site publishes wholesale formats and seasonal availability; late-season crops include several fixed-count/case candidates, but weekly inventory still requires confirmation.",
    quoteStatus: "REQUEST_READY",
    publicPackFormats: [
      "celery: 18-count hearts, 24-count or 30-count boxes",
      "field cucumbers: 24-count box; seconds also offered",
      "iceberg/romaine/leaf lettuce: 24-count boxes",
      "green peppers: 25 lb box",
      "winter squash: 50 lb bag",
      "tomatoes: 20 lb box",
      "zucchini: 20 lb box",
    ],
    contactEmail: "info@vermeulenfarms.com",
    contactPhone: "902-582-7806",
    sourceUrl: "https://www.vermeulenfarms.com/wholesale",
    observedAt: "2026-09-28",
    note:
      "Strong fixed-count wholesale candidate for HarbourCart because the official catalogue exposes exact case configurations. Price, MOQ below pallet quantities and Halifax delivery terms remain unverified.",
  },
  {
    id: "agri-growers",
    name: "Agri-Growers Limited / Sawler Gardens",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: [
      "apples",
      "beets",
      "broccoli",
      "cabbage",
      "carrots",
      "cauliflower",
      "cucumbers",
      "onions",
      "potatoes",
      "rutabagas",
      "squash",
      "zucchini",
    ],
    serviceArea: "Annapolis Valley / Atlantic Canada shipping",
    availabilityStatus: "SEASONAL",
    availabilityBasis:
      "Official crop chart describes storage and field seasons extending through late September and beyond for many HarbourCart staples. The chart is structural/seasonal evidence rather than a current-week inventory feed.",
    quoteStatus: "REQUEST_READY",
    publicPackFormats: [
      "apples: 3 lb, 5 lb and count packs",
      "broccoli: 14-count or 18-count",
      "carrots: 2 lb, 3 lb, 5 lb and 50 lb",
      "cauliflower: 9-count, 12-count or 16-count",
      "cucumbers: 24-count to 48-count cartons",
      "onions: 2 lb, 3 lb, 5 lb and 50 lb",
      "potatoes: 5 lb, 10 lb, 20 lb and 50 lb",
      "cabbage: bags or cartons",
    ],
    contactEmail: "agri-growers@ns.sympatico.ca",
    contactPhone: "902-542-2263",
    sourceUrl: "https://www.agrigrowers.com/produce-availabity.html",
    observedAt: "2026-09-28",
    note:
      "Published consumer-manageable bag sizes make this one of the strongest operational fits for a low-repacking pilot. Confirm current product list, modern pricing, MOQ and delivery directly before using any economics.",
  },
  {
    id: "ctl-distributors",
    name: "CTL Distributors",
    kind: "WHOLESALER",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: ["fruit", "vegetables", "herbs"],
    serviceArea: "Greater Halifax",
    availabilityStatus: "YEAR_ROUND",
    availabilityBasis:
      "Official site describes a broad commercial produce assortment and six-day Greater Halifax delivery; exact weekly stock and price require a quote/list.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "ctl@ctldistributors.com",
    contactPhone: "902-876-6327",
    sourceUrl: "https://www.ctldistributors.com/",
    observedAt: "2026-09-28",
    note:
      "Broad-line control supplier. Its delivered pricing is essential for testing whether farm-direct sourcing remains cheaper after HarbourCart logistics.",
  },
  {
    id: "abundant-acres",
    name: "Abundant Acres",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: ["seasonal vegetables", "green cabbage", "red cabbage"],
    serviceArea: "Halifax peninsula / farm pickup / Warehouse Market pickup",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Official seasonal wholesale ordering and Halifax/Warehouse Market pickup are active channels; exact current wholesale inventory is limited and changes with harvest.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "warehousemarket2867@gmail.com",
    contactPhone: "902-817-8344",
    sourceUrl: "https://abundantacres.myshopify.com/collections/online-market",
    observedAt: "2026-09-28",
    note:
      "Real farm-wholesale lead with unusually convenient Halifax distribution. Do not assume broad assortment beyond the current published wholesale catalogue.",
  },
  {
    id: "stirling-fruit-farms",
    name: "Stirling Fruit Farms",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: ["apples", "fruit", "locally grown produce", "Maritime food"],
    serviceArea: "Atlantic Canada",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Official wholesale operation and storage-fruit business support fall apple sourcing; variety, bag format and current quantity require confirmation.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "greatapples@stirlingfruitfarms.ca",
    contactPhone: "902-542-3763",
    sourceUrl: "https://stirlingfruitfarms.ca/wholesale/",
    observedAt: "2026-09-28",
    note:
      "Priority apple/orchard quote target with CanadaGAP certification. Ask specifically for intact 3 lb/5 lb consumer bags and volume breaks.",
  },
  {
    id: "noggins-corner-farm",
    name: "Noggins Corner Farm",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_SUPPLIER",
    priority: "P1",
    products: ["apples", "pears", "peaches", "plums", "raspberries", "corn", "squash", "pumpkins", "cucumbers", "peas", "peppers"],
    serviceArea: "Annapolis Valley / Nova Scotia",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Supplier listing and substantial controlled-atmosphere/cold-storage capacity support fall orchard sourcing; current wholesale list is not public.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "sales@nogginsfarm.ca",
    contactPhone: "902-542-5515",
    sourceUrl: "https://buylocal.novascotia.ca/business/noggins-corner-farm-market",
    observedAt: "2026-09-28",
    note:
      "Priority orchard and seasonal-produce quote target. Noggins is also operationally connected to the Kings/TapRoot wholesale route, so avoid duplicate quote assumptions.",
  },
  {
    id: "gouchers-farm-market",
    name: "Gouchers Farm & Market",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: ["potatoes", "carrots", "beets", "lettuce", "kale", "cucumbers", "peas", "beans", "corn", "squash", "apples", "pears", "peaches"],
    serviceArea: "Annapolis Valley / restaurant wholesale",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Official farm site lists broad produce and wholesale inquiries; exact current-week assortment and commercial terms require direct confirmation.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "admin@gfmarket.ca",
    contactPhone: "902-242-3422",
    sourceUrl: "https://gouchersfarmmarket.ca/",
    observedAt: "2026-09-28",
    note:
      "Broad farm-direct quote target with strong overlap to phase-1 staples. Current public site does not provide enough dated pricing to support economics.",
  },
  {
    id: "good-clean-farm",
    name: "Good Clean Farm",
    kind: "DIRECT_FARM",
    evidence: "OFFICIAL_SUPPLIER",
    priority: "P2",
    products: ["carrots", "beets", "seasonal vegetables", "salad mix"],
    serviceArea: "Salmon River / Truro",
    availabilityStatus: "CURRENT_SEASON",
    availabilityBasis:
      "Official 2026 site says the farm stand runs through mid-October, produce is grown across all four seasons, and bulk purchases can be arranged in advance.",
    quoteStatus: "REQUEST_READY",
    sourceUrl: "https://www.goodcleanfarm.com/csa",
    observedAt: "2026-09-28",
    note:
      "Useful certified-organic secondary source. Bulk purchases are explicitly supported, but Halifax delivery and case/pack economics are not public and must be requested.",
  },
  {
    id: "speerville-flour-mill",
    name: "Speerville Flour Mill",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    priority: "P1",
    products: ["flour", "grains", "rice", "oats", "bulk pantry staples"],
    serviceArea: "Atlantic Canada",
    availabilityStatus: "YEAR_ROUND",
    availabilityBasis:
      "Current official site shows large-format shelf-stable flour/grain products and regional distribution.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "speerville@xplornet.com",
    contactPhone: "1-866-277-6371",
    sourceUrl: "https://www.speervilleflourmill.ca/",
    observedAt: "2026-09-29",
    note:
      "Strong pantry buying-group target. Prefer intact supplier-packed household-manageable bags so HarbourCart does not open/repack dry goods in phase 1.",
  },
  {
    id: "halifax-regional-food-hub",
    name: "Halifax Regional Food Hub",
    kind: "FOOD_HUB",
    evidence: "OFFICIAL_CHANNEL",
    priority: "P1",
    products: ["multi-producer local food"],
    serviceArea: "Halifax Regional Municipality",
    availabilityStatus: "YEAR_ROUND",
    availabilityBasis:
      "The live buyer page advertises year-round local products. Producers update inventory weekly; public pages do not expose a complete current buyer catalogue.",
    quoteStatus: "REQUEST_READY",
    publicCommercialTerms: [
      "buyer registration through online store",
      "ordering Friday 7am to Monday 3pm",
      "Thursday afternoon pickup or delivery",
      "multiple suppliers in one checkout and invoice",
      "buyer co-op membership optional",
      "optional membership share: one-time CA$50",
    ],
    contactEmail: "info@halifaxfoodhub.ca",
    contactPhone: "902-943-6282",
    sourceUrl: "https://www.halifaxfoodhub.ca/fr/buyers",
    observedAt: "2026-09-28",
    note:
      "Primary multi-producer logistics channel. HarbourCart buyer classification, minimum order, delivery charges, payment terms, catalogue export and volume-pricing flexibility remain external gates.",
  },
  {
    id: "station-food-hub",
    name: "The Station Food Hub",
    kind: "FOOD_HUB",
    evidence: "OFFICIAL_CHANNEL",
    priority: "P2",
    products: ["local food", "processing", "producer partnerships"],
    serviceArea: "Nova Scotia",
    availabilityStatus: "INVENTORY_UNKNOWN",
    availabilityBasis:
      "Official site supports wholesale inquiries and producer/partner relationships but does not expose enough current buyer inventory for a HarbourCart availability claim.",
    quoteStatus: "REQUEST_READY",
    contactEmail: "sales@thestationfoodhub.ca",
    contactPhone: "782-580-2126",
    sourceUrl: "https://www.thestationfoodhub.ca/contact",
    observedAt: "2026-09-28",
    note:
      "Secondary sourcing/processing/partnership channel. Keep behind Halifax Regional Food Hub until buyer terms or relevant catalogue evidence are stronger.",
  },
];
