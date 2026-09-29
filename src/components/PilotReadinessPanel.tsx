type GateStatus = "READY" | "PARTIAL" | "BLOCKED" | "OPTIONAL";

type Gate = {
  id: string;
  label: string;
  status: GateStatus;
  detail: string;
  issue?: number;
  hardBlocker?: boolean;
};

const issueUrl = (number: number) =>
  `https://github.com/JeremyHennessy/HarbourCart/issues/${number}`;

function statusLabel(status: GateStatus) {
  switch (status) {
    case "READY":
      return "Ready";
    case "PARTIAL":
      return "In progress";
    case "BLOCKED":
      return "Blocked";
    case "OPTIONAL":
      return "Optional";
  }
}

function statusClass(status: GateStatus) {
  switch (status) {
    case "READY":
      return "status-chip status-chip--good";
    case "PARTIAL":
      return "status-chip status-chip--review";
    case "BLOCKED":
      return "status-chip status-chip--blocked";
    case "OPTIONAL":
      return "status-chip";
  }
}

export default function PilotReadinessPanel({
  demandReady,
  currentRetailCount,
  verifiedQuoteCount,
  recruitedHouseholds,
}: {
  demandReady: boolean;
  currentRetailCount: number;
  verifiedQuoteCount: number;
  recruitedHouseholds: number;
}) {
  const fakeMoneyGates: Gate[] = [
    {
      id: "shared-demand",
      label: "Shared anonymous demand",
      status: demandReady ? "READY" : "BLOCKED",
      detail: demandReady
        ? "Production demand service is reachable; main-branch CI also exercises submit, update, opt-out and CORS."
        : "Shared pilot demand is unavailable; do not recruit households until it is healthy.",
      issue: 20,
      hardBlocker: true,
    },
    {
      id: "retail",
      label: "Current Halifax retail evidence",
      status: currentRetailCount >= 10 ? "READY" : currentRetailCount > 0 ? "PARTIAL" : "BLOCKED",
      detail: `${currentRetailCount} current Halifax-store observations are available. The pilot target is at least 10.`,
      hardBlocker: true,
    },
    {
      id: "supplier-quotes",
      label: "Real supplier quotes",
      status:
        verifiedQuoteCount >= 3
          ? "READY"
          : verifiedQuoteCount > 0
            ? "PARTIAL"
            : "BLOCKED",
      detail:
        verifiedQuoteCount >= 3
          ? `${verifiedQuoteCount} verified quote(s) available; enough to test an evidence-backed starter basket.`
          : `${verifiedQuoteCount} verified quote(s) available. Target at least 3 evidence-complete products before broad recruitment.`,
      issue: 4,
      hardBlocker: true,
    },
    {
      id: "pilot-cohort",
      label: "50-household recruitment",
      status:
        recruitedHouseholds >= 50
          ? "READY"
          : recruitedHouseholds > 0
            ? "PARTIAL"
            : "BLOCKED",
      detail:
        recruitedHouseholds >= 50
          ? `${recruitedHouseholds} unique pilot households have submitted at least one active intent.`
          : `${recruitedHouseholds} / 50 unique pilot households currently have an active intent. Recruit after the shared-demand and real-quote gates are green.`,
      issue: 6,
      hardBlocker: recruitedHouseholds < 50,
    },
  ];

  const realMoneyGates: Gate[] = [
    {
      id: "food-handling",
      label: "Nova Scotia food-handling classification",
      status: "BLOCKED",
      detail:
        "Written classification for HarbourCart's exact recurring pickup/sorting workflow is still required.",
      issue: 2,
      hardBlocker: true,
    },
    {
      id: "pickup-site",
      label: "Pickup-site permission",
      status: "BLOCKED",
      detail:
        "Low-cost Halifax sites are screened, but no venue has yet provided written permission for the exact activity.",
      issue: 19,
      hardBlocker: true,
    },
    {
      id: "insurance",
      label: "Insurance / fixed-cost evidence",
      status: "BLOCKED",
      detail:
        "General/product-liability insurance remains quote-required; weekly operating cost is therefore incomplete.",
      issue: 7,
      hardBlocker: true,
    },
    {
      id: "dry-run",
      label: "Physical fulfilment dry run",
      status: "BLOCKED",
      detail:
        "Run a 25-household simulation to replace labour, packaging and throughput assumptions with measured evidence.",
      issue: 33,
      hardBlocker: true,
    },
    {
      id: "measurement",
      label: "Sale-by-weight measurement",
      status: "READY",
      detail:
        "The phase-1 operating scope can avoid HarbourCart-prepared weighed shares. Any future weighed product remains blocked separately.",
      issue: 10,
    },
    {
      id: "food-hub",
      label: "Halifax Food Hub commercial terms",
      status: "PARTIAL",
      detail:
        "Buyer workflow, optional membership and weekly pickup/delivery are public; HarbourCart classification, minimums and final fees remain unresolved.",
      issue: 3,
    },
    {
      id: "sobeys",
      label: "Sobeys normalized comparator feed",
      status: "PARTIAL",
      detail:
        "Halifax flyer signals are live but some unit/package details remain unverified. Atlantic Superstore already supplies sufficient pilot coverage.",
      issue: 15,
    },
    {
      id: "ns-loyal",
      label: "Nova Scotia Loyal eligibility",
      status: "OPTIONAL",
      detail:
        "Potential consumer/retailer support could improve economics but is not required for the base business case.",
      issue: 13,
    },
  ];

  const hardBlockers = [...fakeMoneyGates, ...realMoneyGates].filter(
    (gate) => gate.hardBlocker && gate.status === "BLOCKED",
  ).length;
  const ready = [...fakeMoneyGates, ...realMoneyGates].filter(
    (gate) => gate.status === "READY",
  ).length;

  const renderGate = (gate: Gate) => (
    <article className="readiness-gate" key={gate.id}>
      <div className="readiness-gate__top">
        <strong>{gate.label}</strong>
        <span className={statusClass(gate.status)}>{statusLabel(gate.status)}</span>
      </div>
      <p>{gate.detail}</p>
      {gate.issue && (
        <a href={issueUrl(gate.issue)} target="_blank" rel="noreferrer">
          Issue #{gate.issue}
        </a>
      )}
    </article>
  );

  return (
    <section className="pilot-readiness" aria-label="Pilot readiness">
      <div className="quote-workspace__heading">
        <div>
          <span className="eyebrow">Launch control</span>
          <h3>Pilot readiness</h3>
        </div>
        <span className={hardBlockers ? "status-chip status-chip--blocked" : "status-chip status-chip--good"}>
          {hardBlockers} hard blocker{hardBlockers === 1 ? "" : "s"}
        </span>
      </div>

      <div className="readiness-summary">
        <div>
          <span>Ready gates</span>
          <strong>{ready}</strong>
        </div>
        <div>
          <span>Verified quotes</span>
          <strong>{verifiedQuoteCount}</strong>
        </div>
        <div>
          <span>Current Halifax prices</span>
          <strong>{currentRetailCount}</strong>
        </div>
        <div>
          <span>Pilot households</span>
          <strong>{recruitedHouseholds}/50</strong>
        </div>
      </div>

      <div className="readiness-columns">
        <div>
          <div className="readiness-heading">
            <span>Stage 1</span>
            <strong>Fake-money validation</strong>
          </div>
          <div className="readiness-list">{fakeMoneyGates.map(renderGate)}</div>
        </div>
        <div>
          <div className="readiness-heading">
            <span>Stage 2</span>
            <strong>Real-money operation</strong>
          </div>
          <div className="readiness-list">{realMoneyGates.map(renderGate)}</div>
        </div>
      </div>
    </section>
  );
}
