export type SupportStatus =
  | "CURRENT"
  | "PARTNER_ONLY"
  | "ELIGIBILITY_UNCONFIRMED"
  | "STRUCTURE_DEPENDENT"
  | "CLOSED_INTAKE"
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
  },,
  {
    id: "strategic-funding-initiatives-2026",
    name: "Strategic Funding Initiatives",
    provider: "Government of Nova Scotia",
    benefit:
      "Project, service, infrastructure, operating and community-development funding; current intake is open through March 31, 2027 and includes food-security initiatives among eligible project types.",
    status: "STRUCTURE_DEPENDENT",
    currentAsOf: "2026-09-29",
    sourceUrl:
      "https://www.novascotia.ca/apply-funding-support-communities-strategic-funding-initiatives",
    harbourCartRelevance:
      "A conventional for-profit HarbourCart is not listed as an eligible applicant. The program does list social enterprises and community interest companies, plus non-profits and public/community organizations. This is relevant only if HarbourCart deliberately adopts an eligible structure or participates through an eligible partner; the business model should not be changed just to chase funding.",
  },
  {
    id: "idea-local-food-institutions-2026",
    name: "Institutional Development Expansion and Advancement (IDEA)",
    provider: "Government of Nova Scotia / Perennia",
    benefit:
      "Support for farmers, processors and distribution hubs to scale for institutional markets; Budget 2026-27 adds $1 million to expand the program.",
    status: "ELIGIBILITY_UNCONFIRMED",
    currentAsOf: "2026-09-29",
    sourceUrl:
      "https://news.novascotia.ca/en/2026/04/16/new-apple-processing-equipment-supports-nova-scotia-growers",
    harbourCartRelevance:
      "Potentially relevant only if HarbourCart becomes an eligible local-food distribution/aggregation hub or supports suppliers entering public-institution markets. It is not a consumer grocery subsidy and should not be included in household savings.",
  },
  {
    id: "planning-new-opportunities-2026",
    name: "Planning New Opportunities Program",
    provider: "Nova Scotia Department of Agriculture",
    benefit:
      "Supports eligible farms, agri-businesses and agricultural associations with competitiveness, transition and new-opportunity planning.",
    status: "CLOSED_INTAKE",
    currentAsOf: "2026-09-29",
    sourceUrl:
      "https://novascotia.ca/programs/planning-new-opportunities/",
    harbourCartRelevance:
      "The 2026 application deadline was June 30 and applications are closed. A future HarbourCart entity might qualify as an agri-business only if it meets the program's Nova Scotia agri-food representation/use and revenue requirements; do not assume eligibility.",
  },
  {
    id: "market-opportunities-diversification-2026",
    name: "Market Opportunities and Diversification Program",
    provider: "Nova Scotia Department of Agriculture",
    benefit:
      "Supports eligible producers, processors, agri-businesses and associations with domestic/export market opportunities, product/packaging changes and marketing.",
    status: "CLOSED_INTAKE",
    currentAsOf: "2026-09-29",
    sourceUrl:
      "https://novascotia.ca/programs/market-opportunities-diversification/",
    harbourCartRelevance:
      "The 2026 application deadline was May 31 and applications are closed. Monitor future intakes if HarbourCart later meets the agri-business eligibility thresholds.",
  },
  {
    id: "get-growing-2026",
    name: "Get Growing Program",
    provider: "Nova Scotia Department of Agriculture",
    benefit:
      "Supports eligible small registered farms with specialized infrastructure or equipment to expand local agricultural production.",
    status: "NOT_HARBOURCART_DIRECT",
    currentAsOf: "2026-09-29",
    sourceUrl:
      "https://novascotia.ca/programs/get-growing/",
    harbourCartRelevance:
      "Farm-only program, so HarbourCart itself is not the target applicant. The 2026 application deadline is September 30. It can be useful information for participating small-farm suppliers, but it is not a HarbourCart operating subsidy.",
  },
  {
    id: "local-food-security-initiatives-2026",
    name: "Local Food Security Initiatives",
    provider: "Government of Nova Scotia",
    benefit:
      "Supports eligible non-profit/community/Mi'kmaq organizations with food distribution, equipment, collaboration and food-network capacity.",
    status: "CLOSED_INTAKE",
    currentAsOf: "2026-09-29",
    sourceUrl:
      "https://www.novascotia.ca/apply-funding-help-communities-address-food-insecurity-local-food-security-initiatives",
    harbourCartRelevance:
      "The 2026 deadline was August 31 and applications are closed. A future non-profit/community partner could be relevant for a food-access project, but an ordinary for-profit HarbourCart should not model this funding as available.",
  },
];
