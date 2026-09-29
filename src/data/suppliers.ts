export type SupplierTargetKind =
  | "DIRECT_FARM"
  | "WHOLESALER"
  | "FOOD_HUB"
  | "FARM_WHOLESALE";

export type SupplierTargetEvidence =
  | "OFFICIAL_WHOLESALE"
  | "OFFICIAL_SUPPLIER"
  | "OFFICIAL_CHANNEL";

export type SupplierTarget = {
  id: string;
  name: string;
  kind: SupplierTargetKind;
  evidence: SupplierTargetEvidence;
  products: string[];
  serviceArea: string;
  contactEmail?: string;
  contactPhone?: string;
  sourceUrl: string;
  observedAt: string;
  note: string;
};

export const supplierTargets: SupplierTarget[] = [
  {
    id: "ctl-distributors",
    name: "CTL Distributors",
    kind: "WHOLESALER",
    evidence: "OFFICIAL_WHOLESALE",
    products: ["fruit", "vegetables", "herbs"],
    serviceArea: "Greater Halifax",
    contactEmail: "ctl@ctldistributors.com",
    contactPhone: "902-876-6327",
    sourceUrl: "https://www.ctldistributors.com/",
    observedAt: "2026-09-28",
    note:
      "Official site says it supplies food establishments and other commercial buyers, carries 100+ produce varieties, and delivers six days a week in greater Halifax. High-priority quote target.",
  },
  {
    id: "abundant-acres",
    name: "Abundant Acres",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    products: ["seasonal vegetables", "green cabbage", "red cabbage"],
    serviceArea: "Halifax peninsula / farm pickup / Warehouse Market pickup",
    contactEmail: "warehousemarket2867@gmail.com",
    contactPhone: "902-817-8344",
    sourceUrl: "https://abundantacres.myshopify.com/collections/online-market",
    observedAt: "2026-09-28",
    note:
      "Official wholesale ordering page is open seasonally and documents a Halifax peninsula delivery option plus pickup. Current public wholesale catalogue is small, so use it as a real farm-wholesale lead rather than assuming broad assortment.",
  },
  {
    id: "stirling-fruit-farms",
    name: "Stirling Fruit Farms",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    products: ["apples", "fruit", "locally grown produce", "Maritime food"],
    serviceArea: "Atlantic Canada",
    contactEmail: "greatapples@stirlingfruitfarms.ca",
    contactPhone: "902-542-3763",
    sourceUrl: "https://stirlingfruitfarms.ca/wholesale/",
    observedAt: "2026-09-28",
    note:
      "Official wholesale page confirms wholesale activity and CanadaGAP certification. Priority apple/orchard quote target.",
  },
  {
    id: "noggins-corner-farm",
    name: "Noggins Corner Farm",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_SUPPLIER",
    products: ["apples", "pears", "peaches", "plums", "raspberries", "corn", "squash", "pumpkins", "cucumbers", "peas", "peppers"],
    serviceArea: "Annapolis Valley / Nova Scotia",
    contactEmail: "sales@nogginsfarm.ca",
    contactPhone: "902-542-5515",
    sourceUrl: "https://buylocal.novascotia.ca/business/noggins-corner-farm-market",
    observedAt: "2026-09-28",
    note:
      "Buy Local NS lists Noggins as a Supplier and documents substantial controlled-atmosphere/cold-storage capacity. Priority orchard and seasonal-produce quote target.",
  },
  {
    id: "gouchers-farm-market",
    name: "Gouchers Farm & Market",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    products: ["potatoes", "carrots", "beets", "lettuce", "kale", "cucumbers", "peas", "beans", "corn", "squash", "apples", "pears", "peaches"],
    serviceArea: "Annapolis Valley / restaurant wholesale",
    contactEmail: "admin@gfmarket.ca",
    contactPhone: "902-242-3422",
    sourceUrl: "https://gouchersfarmmarket.ca/",
    observedAt: "2026-09-28",
    note:
      "Official site explicitly invites retail and wholesale inquiries and lists many of HarbourCart's phase-1 produce targets.",
  },
  {
    id: "speerville-flour-mill",
    name: "Speerville Flour Mill",
    kind: "FARM_WHOLESALE",
    evidence: "OFFICIAL_WHOLESALE",
    products: ["flour", "grains", "rice", "oats", "bulk pantry staples"],
    serviceArea: "Atlantic Canada",
    contactEmail: "speerville@xplornet.com",
    contactPhone: "1-866-277-6371",
    sourceUrl: "https://www.speervilleflourmill.ca/",
    observedAt: "2026-09-29",
    note:
      "Current official site shows large-format flour/grain products and Atlantic Canada distribution. Speerville's published catalogue explicitly describes bulk-purchasing discounts for food-buying groups. Current Halifax Grainery operations also place collective monthly orders directly with Speerville, validating the channel for group purchasing.",
  },
  {
    id: "halifax-regional-food-hub",
    name: "Halifax Regional Food Hub",
    kind: "FOOD_HUB",
    evidence: "OFFICIAL_CHANNEL",
    products: ["multi-producer local food"],
    serviceArea: "Halifax Regional Municipality",
    contactEmail: "info@halifaxfoodhub.ca",
    contactPhone: "902-943-6282",
    sourceUrl: "https://www.halifaxfoodhub.ca/",
    observedAt: "2026-09-28",
    note:
      "Aggregation, storage, ordering, payment, packing and delivery channel. Buyer eligibility and HarbourCart-specific terms remain an external evidence gate; do not treat the Hub itself as a verified supplier quote.",
  },
  {
    id: "station-food-hub",
    name: "The Station Food Hub",
    kind: "FOOD_HUB",
    evidence: "OFFICIAL_CHANNEL",
    products: ["local food", "processing", "producer partnerships"],
    serviceArea: "Nova Scotia",
    contactEmail: "sales@thestationfoodhub.ca",
    contactPhone: "782-580-2126",
    sourceUrl: "https://www.thestationfoodhub.ca/contact",
    observedAt: "2026-09-28",
    note:
      "Official site provides a wholesale inquiry contact and invites producer/partner relationships. Secondary channel to test for sourcing, aggregation, or value-added support.",
  },
];
