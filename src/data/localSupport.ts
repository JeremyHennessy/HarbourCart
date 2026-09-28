export type SupportStatus =
  | "CURRENT"
  | "PARTNER_ONLY"
  | "ELIGIBILITY_UNCONFIRMED"
  | "NOT_HARBOURCART_DIRECT";

export type LocalSupportProgram = {
  id: string;
  name: string;
  provider: string;
  benefit: string;
  status: SupportStatus;
  currentAsOf: string;
  sourceUrl: string;
  harbourCartRelevance: string;
};

export const localSupportPrograms: LocalSupportProgram[] = [
  {
    id: "nsloyal-csa-2026",
    name: "Nova Scotia Loyal CSA Incentive Pilot",
    provider: "Government of Nova Scotia / Nova Scotia Loyal",
    benefit:
      "10% consumer discount on approved 2026 community-supported-agriculture farm shares using the current program mechanism.",
    status: "PARTNER_ONLY",
    currentAsOf: "2026-09-28",
    sourceUrl:
      "https://nsloyal.ca/en/consumer-rewards/",
    harbourCartRelevance:
      "HarbourCart cannot assume this discount applies to ordinary weekly group buys. It could matter if a participating farm offers a qualifying CSA/farm-share product through or alongside HarbourCart.",
  },
  {
    id: "nsloyal-online-market-10",
    name: "Nova Scotia Loyal Online Farmers' Market Incentive",
    provider: "Government of Nova Scotia / Nova Scotia Loyal",
    benefit:
      "10% off online orders through currently participating farmers' market partners using NSLOYAL10.",
    status: "PARTNER_ONLY",
    currentAsOf: "2026-09-28",
    sourceUrl:
      "https://nsloyal.ca/en/consumer-rewards/",
    harbourCartRelevance:
      "Current partners listed by Nova Scotia Loyal include Cape Breton Food Hub, Wolfville Farmers' Market 2GO and Antigonish Farmers' Market. HarbourCart would need explicit program/partner approval before presenting this as available.",
  },
  {
    id: "nsloyal-retailer",
    name: "Nova Scotia Loyal Retailer Partner",
    provider: "Nova Scotia Loyal",
    benefit:
      "Retailer partnership, local-product branding and promotional support; the current application explicitly asks whether the retail business is physical, online or both.",
    status: "ELIGIBILITY_UNCONFIRMED",
    currentAsOf: "2026-09-28",
    sourceUrl:
      "https://portal.nsloyal.ca/retailers/register",
    harbourCartRelevance:
      "HarbourCart should apply/ask once the Nova Scotia business entity and supplier set are established. The public homepage and retailer form are not perfectly aligned on location wording, so online-only eligibility should be confirmed in writing.",
  },
  {
    id: "nsloyal-sobeys-scene",
    name: "Nova Scotia Loyal / Sobeys Scene+ local-product promotions",
    provider: "Government of Nova Scotia / Sobeys",
    benefit:
      "Scene+ rewards on eligible local products during program promotions; exact offers vary and should be treated as current promotion data, not a permanent cash discount.",
    status: "CURRENT",
    currentAsOf: "2026-09-28",
    sourceUrl:
      "https://news.novascotia.ca/en/2025/03/06/more-retailers-join-nova-scotia-loyal",
    harbourCartRelevance:
      "When comparing HarbourCart with Sobeys, keep shelf/flyer cash price and loyalty value separate so we do not overstate savings.",
  },
  {
    id: "nsloyal-vouchers-2026",
    name: "Nova Scotia Loyal Farmers' Market Voucher Program",
    provider: "Government of Nova Scotia",
    benefit:
      "$10 farmers' market vouchers for eligible students and newcomers in 2026; vouchers are valid through December 31, 2026.",
    status: "NOT_HARBOURCART_DIRECT",
    currentAsOf: "2026-09-28",
    sourceUrl:
      "https://news.novascotia.ca/en/2026/05/14/nova-scotia-loyal-farmers-market-voucher-program-returns-2026",
    harbourCartRelevance:
      "Not a general HarbourCart subsidy. It could become relevant only through a qualifying participating farmers' market relationship.",
  },
  {
    id: "producer-labelling-2026",
    name: "Nova Scotia Loyal Producer Labelling Program",
    provider: "Invest Nova Scotia / Nova Scotia Loyal",
    benefit:
      "Registered eligible producers can receive 70% reimbursement of eligible Nova Scotia Loyal labelling costs up to a $3,000 lifetime maximum; the current intake runs to March 15, 2027 subject to budget availability.",
    status: "NOT_HARBOURCART_DIRECT",
    currentAsOf: "2026-09-28",
    sourceUrl:
      "https://investnovascotia.ca/incentives-programs-services/nova-scotia-loyal-producer-labelling-program",
    harbourCartRelevance:
      "Useful to HarbourCart suppliers/producers; HarbourCart as a retailer should not assume producer-program eligibility.",
  },
];
