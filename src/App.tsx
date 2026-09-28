import { useMemo, useState } from "react";
import { demandIdeas, pilotCandidates, type PilotCandidate } from "./data/pilot";
import LiveRetailPanel from "./components/LiveRetailPanel";
import LocalSupportView from "./components/LocalSupportView";
import { useLiveRetailFeed } from "./hooks/useLiveRetailFeed";
import { lowestCurrentComparator, type LiveRetailFeed } from "./domain/liveRetail";
import {
  activePriceTier,
  evaluateCandidate,
  nextPriceTier,
  structuralSpread,
  type CandidateEconomics,
} from "./domain/economics";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const percent = new Intl.NumberFormat("en-CA", {
  style: "percent",
  maximumFractionDigits: 0,
});

type View = "buys" | "demand" | "admin" | "support" | "evidence";
type DemandRecord = Record<string, { joined: boolean; targetPrice: number }>;

const assumptions = {
  targetSavingsRate: 0.15,
  minimumSavingsRate: 0.15,
  minimumContribution: 5,
  labourMinutes: 4,
  labourHourlyRate: 17,
  packagingCost: 0.75,
  shrinkRate: 0.01,
};

function HarbourMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-mark__wave" />
      <span className="brand-mark__handle" />
    </div>
  );
}

function useDemandRecord() {
  const [record, setRecord] = useState<DemandRecord>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(
        window.localStorage.getItem("harbourcart-pilot-demand") ?? "{}",
      ) as DemandRecord;
    } catch {
      return {};
    }
  });

  const update = (next: DemandRecord) => {
    setRecord(next);
    window.localStorage.setItem("harbourcart-pilot-demand", JSON.stringify(next));
  };

  return [record, update] as const;
}

function candidateEconomics(
  buy: PilotCandidate,
  householdCount: number,
  comparableUnitPrice = buy.publicReferenceUnitPrice,
): CandidateEconomics {
  const tier = activePriceTier(buy.tiers, householdCount);
  return evaluateCandidate({
    comparableRetail: comparableUnitPrice * buy.householdQuantity,
    procurementCost: buy.publicCaseUnitPrice * buy.householdQuantity,
    targetSavingsRate: assumptions.targetSavingsRate,
    customerPriceOverride: tier.customerPrice,
    labourMinutes: assumptions.labourMinutes,
    labourHourlyRate: assumptions.labourHourlyRate,
    packagingCost: assumptions.packagingCost,
    shrinkRate: assumptions.shrinkRate,
    freightCost: buy.freightPerHousehold,
    handlingStatus: buy.handlingStatus,
    measurementStatus: buy.measurementStatus,
    supplierEvidence: buy.supplierEvidence,
    benchmarkEvidence: buy.benchmarkEvidence,
    minimumSavingsRate: assumptions.minimumSavingsRate,
    minimumContribution: assumptions.minimumContribution,
  });
}

function economicSignal(economics: CandidateEconomics) {
  if (economics.savingsRate < assumptions.minimumSavingsRate || economics.contribution < 0) {
    return { label: "DROP / REPRICE", tone: "reject" };
  }
  if (economics.contribution < assumptions.minimumContribution) {
    return { label: "THIN", tone: "review" };
  }
  return { label: "QUOTE FIRST", tone: "good" };
}

function EvidenceChip({ buy }: { buy: PilotCandidate }) {
  const complete =
    buy.supplierEvidence === "VERIFIED_QUOTE" &&
    buy.benchmarkEvidence === "CURRENT_LOCAL" &&
    buy.handlingStatus === "CONFIRMED_PHASE_1" &&
    buy.measurementStatus !== "TRADE_SCALE_REQUIRED";

  return (
    <span className={`status-chip ${complete ? "status-chip--good" : "status-chip--blocked"}`}>
      {complete ? "Evidence complete" : "Research only"}
    </span>
  );
}

function BuyCard({
  buy,
  joined,
  onToggle,
}: {
  buy: PilotCandidate;
  joined: boolean;
  onToggle: () => void;
}) {
  const householdCount = buy.householdsInterested + (joined ? 1 : 0);
  const activeTier = activePriceTier(buy.tiers, householdCount);
  const nextTier = nextPriceTier(buy.tiers, householdCount);
  const economics = candidateEconomics(buy, householdCount);
  const progress = Math.min(
    100,
    Math.round((householdCount / buy.targetHouseholds) * 100),
  );
  const signal = economicSignal(economics);

  return (
    <article className="buy-card">
      <div className="buy-card__topline">
        <div>
          <span className="eyebrow">{buy.category}</span>
          <h3>{buy.product}</h3>
          <p className="muted">
            {buy.householdQuantity} {buy.unit} household share
          </p>
        </div>
        <EvidenceChip buy={buy} />
      </div>

      <div className="price-row">
        <div>
          <span className="price">{money.format(activeTier.customerPrice)}</span>
          <span className="muted"> model tier</span>
        </div>
        <strong>{percent.format(economics.savingsRate)} vs public reference</strong>
      </div>

      <div className="mini-metrics">
        <div>
          <span>Public reference</span>
          <strong>{money.format(economics.comparableRetail)}</strong>
        </div>
        <div>
          <span>Variable contribution</span>
          <strong>{money.format(economics.contribution)}</strong>
        </div>
        <div>
          <span>Screen</span>
          <strong className={`text--${signal.tone}`}>{signal.label}</strong>
        </div>
      </div>

      <div className="progress-label">
        <strong>{householdCount} households interested</strong>
        <span>{buy.targetHouseholds} target</span>
      </div>
      <div className="progress" aria-label={`${progress}% of target interest`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="tier-strip">
        <div>
          <span>Current model tier</span>
          <strong>{money.format(activeTier.customerPrice)}</strong>
        </div>
        <div>
          <span>Next tier</span>
          <strong>
            {nextTier
              ? `${nextTier.minimumHouseholds} homes · ${money.format(nextTier.customerPrice)}`
              : "Best tier unlocked"}
          </strong>
        </div>
      </div>

      <details>
        <summary>Evidence & limitations</summary>
        <p>{buy.note}</p>
        <p>
          <strong>Handling:</strong> {buy.handlingLabel}
        </p>
        <p>
          <strong>Sale basis:</strong>{" "}
          {buy.saleBasis === "COUNT"
            ? "fixed count"
            : buy.saleBasis === "SEALED_PACK"
              ? "intact supplier/manufacturer pack"
              : "weighed household share"}
          {buy.measurementStatus === "TRADE_SCALE_REQUIRED"
            ? " · legal-for-trade scale requirement unresolved"
            : ""}
        </p>
        <p className="evidence-line">
          Public screen observed {buy.observedAt}. Reference{" "}
          {money.format(buy.publicReferenceUnitPrice)}/{buy.unit} vs case-equivalent{" "}
          {money.format(buy.publicCaseUnitPrice)}/{buy.unit}. Structural spread{" "}
          {percent.format(
            structuralSpread(
              { price: buy.publicReferenceUnitPrice, quantity: 1 },
              { price: buy.publicCaseUnitPrice, quantity: 1 },
            ),
          )}.
        </p>
        <a href={buy.sourceUrl} target="_blank" rel="noreferrer">
          Open source
        </a>
      </details>

      <button
        type="button"
        className={joined ? "button button--joined" : "button button--secondary"}
        onClick={onToggle}
      >
        {joined ? "Interested · saved locally" : "I’d buy at the right price"}
      </button>
    </article>
  );
}

function CustomerBuys({
  demandRecord,
  updateDemand,
}: {
  demandRecord: DemandRecord;
  updateDemand: (next: DemandRecord) => void;
}) {
  const toggle = (buy: PilotCandidate) => {
    const current = demandRecord[buy.id];
    updateDemand({
      ...demandRecord,
      [buy.id]: {
        joined: !current?.joined,
        targetPrice:
          current?.targetPrice ??
          activePriceTier(buy.tiers, buy.householdsInterested).customerPrice,
      },
    });
  };

  return (
    <>
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Halifax group buying</span>
          <h1>Buy together. Keep the good deals.</h1>
          <p className="hero__lede">
            HarbourCart starts with demand, tests the real landed cost, and only
            turns a candidate into a buy when current evidence supports the price.
          </p>
          <div className="hero__actions">
            <a className="button" href="#candidate-buys">
              Explore candidates
            </a>
            <span className="prototype-warning">
              Research pilot · no checkout or payments
            </span>
          </div>
        </div>

        <div className="hero__panel" aria-label="How HarbourCart works">
          <div className="step">
            <span>01</span>
            <div>
              <strong>Tell us your price</strong>
              <p>Households signal what they would actually buy.</p>
            </div>
          </div>
          <div className="step">
            <span>02</span>
            <div>
              <strong>Aggregate demand</strong>
              <p>We take concrete volume to farms, hubs, and distributors.</p>
            </div>
          </div>
          <div className="step">
            <span>03</span>
            <div>
              <strong>Verify before opening</strong>
              <p>Quote, retail comparator, handling, and economics must all pass.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Pilot rules">
        <div>
          <strong>15%</strong>
          <span>working minimum customer saving</span>
        </div>
        <div>
          <strong>$5</strong>
          <span>normal variable-contribution gate</span>
        </div>
        <div>
          <strong>50</strong>
          <span>household pilot target</span>
        </div>
        <div>
          <strong>0</strong>
          <span>unverified live offers</span>
        </div>
      </section>

      <section className="section" id="candidate-buys">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Price screen first</span>
            <h2>Candidate buys</h2>
          </div>
          <p>
            Public case-size prices help identify where to ask for quotes. They
            are deliberately not represented as Halifax supplier offers.
          </p>
        </div>

        <div className="buy-grid">
          {pilotCandidates.map((buy) => (
            <BuyCard
              key={buy.id}
              buy={buy}
              joined={Boolean(demandRecord[buy.id]?.joined)}
              onToggle={() => toggle(buy)}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function DemandView({
  demandRecord,
  updateDemand,
}: {
  demandRecord: DemandRecord;
  updateDemand: (next: DemandRecord) => void;
}) {
  const setPrice = (id: string, value: number) => {
    const current = demandRecord[id];
    updateDemand({
      ...demandRecord,
      [id]: {
        joined: current?.joined ?? false,
        targetPrice: value,
      },
    });
  };

  const toggle = (id: string, defaultPrice: number) => {
    const current = demandRecord[id];
    updateDemand({
      ...demandRecord,
      [id]: {
        joined: !current?.joined,
        targetPrice: current?.targetPrice ?? defaultPrice,
      },
    });
  };

  return (
    <section className="demand-page section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Reverse marketplace</span>
          <h2>What would you actually buy?</h2>
        </div>
        <p>
          These are local-only pilot signals stored in this browser. No order is
          placed and no payment method is collected.
        </p>
      </div>

      <div className="demand-cards">
        {demandIdeas.map((idea) => {
          const current = demandRecord[idea.id];
          const joined = Boolean(current?.joined);
          const price = current?.targetPrice ?? idea.targetPrice;
          const households = idea.baseHouseholds + (joined ? 1 : 0);
          const width = Math.min(
            100,
            Math.round((households / idea.targetHouseholds) * 100),
          );

          return (
            <article className="demand-card" key={idea.id}>
              <div>
                <span className="eyebrow">{idea.unitLabel}</span>
                <h3>{idea.name}</h3>
                <p>{households} households currently modelled as interested</p>
              </div>
              <label>
                I would buy at or below
                <span className="price-input">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={price}
                    onChange={(event) =>
                      setPrice(idea.id, Number.parseFloat(event.target.value) || 0)
                    }
                  />
                </span>
              </label>
              <div className="progress">
                <span style={{ width: `${width}%` }} />
              </div>
              <div className="demand-card__footer">
                <span>
                  {idea.handlingStatus === "CONFIRMED_PHASE_1"
                    ? "Phase-1 handling candidate"
                    : idea.handlingStatus === "NOT_PHASE_1"
                      ? "Later phase"
                      : "Handling confirmation needed"}
                </span>
                <button
                  type="button"
                  className={joined ? "button button--joined" : "button button--secondary"}
                  onClick={() => toggle(idea.id, idea.targetPrice)}
                >
                  {joined ? "Count me in" : "Add my demand"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdminView({
  demandRecord,
  liveRetailFeed,
  liveRetailError,
}: {
  demandRecord: DemandRecord;
  liveRetailFeed?: LiveRetailFeed;
  liveRetailError?: string;
}) {
  const rows = useMemo(
    () =>
      pilotCandidates.map((buy) => {
        const householdCount =
          buy.householdsInterested + (demandRecord[buy.id]?.joined ? 1 : 0);
        const liveComparator = lowestCurrentComparator(
          liveRetailFeed?.prices ?? [],
          buy.id,
          new Date().toISOString(),
        );
        const economics = candidateEconomics(
          buy,
          householdCount,
          liveComparator?.normalizedPrice ?? buy.publicReferenceUnitPrice,
        );
        return {
          buy,
          householdCount,
          liveComparator,
          economics,
          signal: economicSignal(economics),
          spread: structuralSpread(
            { price: buy.publicReferenceUnitPrice, quantity: 1 },
            { price: buy.publicCaseUnitPrice, quantity: 1 },
          ),
        };
      }),
    [demandRecord, liveRetailFeed],
  );

  const attractive = rows.filter(
    ({ economics }) =>
      economics.savingsRate >= assumptions.minimumSavingsRate &&
      economics.contribution >= assumptions.minimumContribution,
  ).length;

  return (
    <section className="section admin-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Procurement control room</span>
          <h2>Candidate decision queue</h2>
        </div>
        <p>
          Economics and evidence are separate gates. A strong public spread can
          justify supplier outreach; it cannot publish a customer-facing deal.
        </p>
      </div>

      <div className="admin-summary">
        <div>
          <span>Candidates</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>Economically promising</span>
          <strong>{attractive}</strong>
        </div>
        <div>
          <span>Verified supplier quotes</span>
          <strong>0</strong>
        </div>
        <div>
          <span>Publishable now</span>
          <strong>0</strong>
        </div>
      </div>

      <LiveRetailPanel feed={liveRetailFeed} error={liveRetailError} />

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Demand</th>
              <th>Public spread</th>
              <th>Current comparator</th>
              <th>Model price</th>
              <th>Model saving</th>
              <th>Contribution</th>
              <th>Research signal</th>
              <th>Publication gate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ buy, householdCount, liveComparator, economics, signal, spread }) => (
              <tr key={buy.id}>
                <td>
                  <strong>{buy.product}</strong>
                  <span>{buy.householdQuantity} {buy.unit} share</span>
                </td>
                <td>{householdCount}</td>
                <td>{percent.format(spread)}</td>
                <td>
                  {liveComparator ? (
                    <>
                      <strong>
                        {money.format(liveComparator.normalizedPrice)}/
                        {liveComparator.normalizedUnit}
                      </strong>
                      <span>
                        {liveComparator.retailerLabel} · {liveComparator.storeName}
                      </span>
                    </>
                  ) : (
                    <span>Awaiting Halifax-verified live price</span>
                  )}
                </td>
                <td>{money.format(economics.customerPrice)}</td>
                <td>{percent.format(economics.savingsRate)}</td>
                <td className={economics.contribution >= 5 ? "positive" : economics.contribution < 0 ? "negative" : ""}>
                  {money.format(economics.contribution)}
                </td>
                <td>
                  <span className={`status-chip status-chip--${signal.tone}`}>
                    {signal.label}
                  </span>
                </td>
                <td>
                  <span className="status-chip status-chip--blocked">BLOCKED</span>
                  <small>
                    quote + Halifax benchmark
                    {buy.handlingStatus !== "CONFIRMED_PHASE_1" ? " + handling" : ""}
                    {buy.measurementStatus === "TRADE_SCALE_REQUIRED" ? " + trade scale" : ""}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="decision-legend">
        <div>
          <strong>QUOTE FIRST</strong>
          <span>Structural economics clear the working gates. Get real evidence next.</span>
        </div>
        <div>
          <strong>THIN</strong>
          <span>Positive but below the normal $5/order contribution gate.</span>
        </div>
        <div>
          <strong>DROP / REPRICE</strong>
          <span>Fails savings or variable contribution before fixed costs.</span>
        </div>
      </div>
    </section>
  );
}

function EvidenceView() {
  const sources = [
    {
      name: "Nova Scotia Food Safety Regulations",
      status: "Authoritative",
      detail:
        "Whole unprocessed produce and some inspected prepackaged low-risk foods have explicit exemptions. Exact case-splitting workflow still needs written classification.",
      url: "https://novascotia.ca/just/regulations/regs/hpafood.htm",
    },
    {
      name: "CFIA fresh produce labelling",
      status: "Authoritative",
      detail:
        "Packaging at retail can trigger net quantity, language, origin, and responsible-party rules depending on how produce is packaged and sold.",
      url: "https://inspection.canada.ca/en/food-labels/labelling/industry/fresh-fruits-vegetables",
    },
    {
      name: "Measurement Canada — food sold by weight",
      status: "Authoritative",
      detail:
        "If HarbourCart uses weight to determine the quantity sold, the scale must be legal for trade: approved, certified, and inspected. Count-based or intact sealed-pack candidates avoid this HarbourCart measurement step.",
      url: "https://ised-isde.canada.ca/site/measurement-canada/en/consumers/buying-measured-goods/buying-and-selling-food-weight",
    },
    {
      name: "Halifax Regional Food Hub",
      status: "Potential channel",
      detail:
        "Current handbook describes aggregation, storage, order fulfilment and last-mile delivery, with a 23% markup on producer-set prices.",
      url: "https://www.halifaxfoodhub.ca/sell-with-us",
    },
    {
      name: "Statistics Canada 18-10-0245-02",
      status: "Monthly benchmark",
      detail:
        "Transaction-data food price table with provincial and population-centre geography. Useful baseline, not a substitute for this week's Halifax promotion.",
      url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024502",
    },
    {
      name: "Wholesale Club public catalogue",
      status: "Structural screen",
      detail:
        "Useful for loose-vs-case economics. Prices vary by pickup/delivery context and are not treated as HarbourCart supplier quotes.",
      url: "https://www.wholesaleclub.ca/",
    },
    {
      name: "Stripe Canada",
      status: "Payment cost",
      detail:
        "Working model uses standard domestic-card pricing. PAD may reduce repeat-order processing costs but has verification/failure considerations.",
      url: "https://stripe.com/en-ca/pricing",
    },
    {
      name: "Open Food Network Canada",
      status: "Pilot back office",
      detail:
        "Existing buying-club/hub software can cover commodity order-cycle and fulfilment workflows while HarbourCart focuses on demand and price intelligence.",
      url: "https://about.openfoodnetwork.ca/sell-local/software-pricing/",
    },
  ];

  return (
    <section className="section evidence-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Evidence contract</span>
          <h2>Nothing gets promoted by intuition alone.</h2>
        </div>
        <p>
          HarbourCart stores where a number came from, when it was observed,
          whether it is local, and whether it is strong enough to support a claim.
        </p>
      </div>

      <div className="source-grid">
        {sources.map((source) => (
          <article className="source-card" key={source.name}>
            <span className="status-chip">{source.status}</span>
            <h3>{source.name}</h3>
            <p>{source.detail}</p>
            <a href={source.url} target="_blank" rel="noreferrer">
              Open source
            </a>
          </article>
        ))}
      </div>

      <div className="gate-stack">
        <h3>Publication gate</h3>
        <ol>
          <li>Verified supplier offer with MOQ, pack, validity and delivery terms.</li>
          <li>Current Halifax retail comparator for the same or genuinely comparable item.</li>
          <li>Handling class permitted for the phase-1 operating workflow.</li>
          <li>Any HarbourCart sale-by-weight measurement requirement is resolved.</li>
          <li>Customer saving clears the configured minimum.</li>
          <li>Variable contribution clears the configured minimum.</li>
          <li>Immutable evidence snapshot is stored for what the household saw.</li>
        </ol>
      </div>
    </section>
  );
}

function App() {
  const [view, setView] = useState<View>("buys");
  const [demandRecord, updateDemand] = useDemandRecord();
  const { feed: liveRetailFeed, error: liveRetailError } = useLiveRetailFeed();

  return (
    <>
      <header className="site-header">
        <button
          className="brand brand-button"
          type="button"
          onClick={() => setView("buys")}
          aria-label="HarbourCart home"
        >
          <HarbourMark />
          <span>HarbourCart</span>
        </button>

        <nav aria-label="Primary navigation">
          {([
            ["buys", "Candidate buys"],
            ["demand", "Demand"],
            ["admin", "Procurement"],
            ["support", "Local support"],
            ["evidence", "Evidence"],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={view === id ? "nav-button nav-button--active" : "nav-button"}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <span className="prototype-pill">Research pilot</span>
      </header>

      <main id="top">
        {view === "buys" && (
          <CustomerBuys demandRecord={demandRecord} updateDemand={updateDemand} />
        )}
        {view === "demand" && (
          <DemandView demandRecord={demandRecord} updateDemand={updateDemand} />
        )}
        {view === "admin" && (
          <AdminView
            demandRecord={demandRecord}
            liveRetailFeed={liveRetailFeed}
            liveRetailError={liveRetailError}
          />
        )}
        {view === "support" && <LocalSupportView />}
        {view === "evidence" && <EvidenceView />}
      </main>

      <footer>
        <div className="brand brand--footer">
          <HarbourMark />
          <span>HarbourCart</span>
        </div>
        <p>
          Halifax research pilot · demand entries stay in this browser · no live
          ordering or payments
        </p>
      </footer>
    </>
  );
}

export default App;
