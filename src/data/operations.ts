export type CostEvidence =
  | "AUTHORITATIVE"
  | "PUBLIC_VENDOR"
  | "MODEL_ASSUMPTION"
  | "QUOTE_REQUIRED";

export type OperatingAssumption = {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  evidence: CostEvidence;
  sourceUrl?: string;
  observedAt: string;
  note: string;
};

export const operatingAssumptions: OperatingAssumption[] = [
  {
    id: "hrm-room-model",
    label: "Pickup-space hourly model",
    value: 40,
    unit: "CAD/hour",
    evidence: "MODEL_ASSUMPTION",
    sourceUrl:
      "https://www.halifax.ca/sites/default/files/documents/city-hall/legislation-by-laws/By-lawU-100.pdf",
    observedAt: "2026-09-28",
    note:
      "Conservative round-number model informed by HRM's published recreation room schedule, where corporate room rates shown in the current schedule span roughly the mid-teens to high-$30s per hour depending on room class. Actual commercial eligibility, room class, availability, HST, staffing and food-use permission require a site-specific quote.",
  },
  {
    id: "pickup-hours-model",
    label: "Weekly pickup booking",
    value: 4,
    unit: "hours/week",
    evidence: "MODEL_ASSUMPTION",
    observedAt: "2026-09-28",
    note:
      "Model only: allows setup, two-to-three hour household pickup window, and cleanup.",
  },
  {
    id: "vehicle-rate-2026",
    label: "Vehicle operating allowance",
    value: 0.73,
    unit: "CAD/km",
    evidence: "AUTHORITATIVE",
    sourceUrl:
      "https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/automobile/automobile-motor-vehicle-allowances.html",
    observedAt: "2026-09-28",
    note:
      "CRA 2026 reasonable prescribed allowance rate for the first 5,000 km in a province. Used as a conservative all-in proxy for a privately owned vehicle; actual HarbourCart transport costs may differ.",
  },
  {
    id: "transport-local-model",
    label: "Local/Hub transport scenario",
    value: 25,
    unit: "km/week",
    evidence: "MODEL_ASSUMPTION",
    observedAt: "2026-09-28",
    note:
      "Scenario only. Replace with actual supplier-to-pickup routing or delivery charge.",
  },
  {
    id: "transport-direct-model",
    label: "Direct regional sourcing scenario",
    value: 200,
    unit: "km/week",
    evidence: "MODEL_ASSUMPTION",
    observedAt: "2026-09-28",
    note:
      "Scenario only for supplier pickup outside HRM. Supplier delivery or aggregation may be materially cheaper.",
  },
  {
    id: "ofn-growing-seasonal",
    label: "Open Food Network buying-group software model",
    value: 400,
    unit: "CAD/4-month season",
    evidence: "PUBLIC_VENDOR",
    sourceUrl:
      "https://about.openfoodnetwork.ca/sell-local/software-pricing/",
    observedAt: "2026-09-28",
    note:
      "Current public Hubs/Buying Groups Growing plan is $400 per 4-month season for annual sales in the stated $30K-$100K band. HarbourCart's actual plan depends on turnover and pilot duration. Weekly model uses $400 / 17.3 weeks = about $23.12.",
  },
  {
    id: "bus-stop-community-room",
    label: "Bus Stop Theatre Community Room public rate",
    value: 60,
    unit: "CAD/4 hours + HST",
    evidence: "PUBLIC_VENDOR",
    sourceUrl:
      "https://rentals.busstoptheatre.coop/",
    observedAt: "2026-09-28",
    note:
      "Current published non-member Community Room rate is $60 for up to four hours plus HST. This is a rental-price screen only; HarbourCart must obtain written permission for commercial grocery pickup/food handling before treating the room as eligible.",
  },
  {
    id: "halifax-brewery-small-room",
    label: "Halifax Brewery Market Pu'Taliewey Room public rate",
    value: 60,
    unit: "CAD/hour + HST",
    evidence: "PUBLIC_VENDOR",
    sourceUrl:
      "https://www.halifaxbrewerymarket.com/",
    observedAt: "2026-09-28",
    note:
      "Current event-rental sheet lists the small private room at $60/hour standard, with setup/tear-down billed at 50% of the hourly rate. Food-pickup suitability and recurring availability require direct confirmation.",
  },
  {
    id: "insurance",
    label: "General/product liability insurance",
    value: null,
    unit: "CAD/week",
    evidence: "QUOTE_REQUIRED",
    observedAt: "2026-09-28",
    note:
      "No value is inserted until a HarbourCart-specific insurance quote is obtained.",
  },
  {
    id: "site-permission",
    label: "Food/pickup use permission",
    value: null,
    unit: "eligibility",
    evidence: "QUOTE_REQUIRED",
    observedAt: "2026-09-28",
    note:
      "A published room rate does not establish that the room can legally or contractually be used for HarbourCart food pickup. Confirm with the facility and regulator.",
  },
];

export const operatingScenarios = [
  {
    id: "local-hub",
    label: "Local / Food Hub pickup route",
    pickupHourlyRate: 40,
    pickupHours: 4,
    transportKm: 25,
    transportRatePerKm: 0.73,
    softwareWeeklyCost: 400 / 17.3,
  },
  {
    id: "regional-direct",
    label: "Direct regional supplier pickup",
    pickupHourlyRate: 40,
    pickupHours: 4,
    transportKm: 200,
    transportRatePerKm: 0.73,
    softwareWeeklyCost: 400 / 17.3,
  },
  {
    id: "low-cost-community-room",
    label: "Low-cost community-room screen",
    pickupHourlyRate: 60 / 4,
    pickupHours: 4,
    transportKm: 25,
    transportRatePerKm: 0.73,
    softwareWeeklyCost: 400 / 17.3,
  },
] as const;
