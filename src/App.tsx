import { useMemo, useState } from "react";
import { candidateBuys, demandIdeas, type CandidateBuy } from "./data/demo";
import {
  activePriceTier,
  contributionPerOrder,
  nextPriceTier,
} from "./domain/economics";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const percent = new Intl.NumberFormat("en-CA", {
  style: "percent",
  maximumFractionDigits: 0,
});

function HarbourMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <span className="brand-mark__wave" />
      <span className="brand-mark__handle" />
    </div>
  );
}

function EvidenceBadge({ buy }: { buy: CandidateBuy }) {
  const className =
    buy.evidenceStatus === "PUBLIC_SCREEN"
      ? "badge badge--evidence"
      : buy.evidenceStatus === "QUOTE_REQUIRED"
        ? "badge badge--warning"
        : "badge";

  return <span className={className}>{buy.evidenceLabel}</span>;
}

function BuyCard({ buy }: { buy: CandidateBuy }) {
  const activeTier = activePriceTier(buy.tiers, buy.households);
  const nextTier = nextPriceTier(buy.tiers, buy.households);
  const progress = Math.min(100, Math.round((buy.households / buy.goal) * 100));

  return (
    <article className="buy-card">
      <div className="buy-card__topline">
        <div>
          <span className="eyebrow">{buy.category}</span>
          <h3>{buy.title}</h3>
          <p className="muted">{buy.unitLabel}</p>
        </div>
        <EvidenceBadge buy={buy} />
      </div>

      <div className="price-row">
        <div>
          <span className="price">{money.format(activeTier.customerPrice)}</span>
          <span className="muted"> model price</span>
        </div>
        <strong>{percent.format(buy.structuralSpread)} public spread</strong>
      </div>

      <div className="progress-label">
        <strong>{buy.households} households interested</strong>
        <span>{buy.goal} target</span>
      </div>
      <div className="progress" aria-label={`${progress}% of target interest`}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="tier-strip">
        <div>
          <span>Unlocked</span>
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
        <p className="evidence-line">
          Public screen observed {buy.sourceObserved}. Reference{" "}
          {money.format(buy.publicReferencePrice)}/unit vs case-equivalent{" "}
          {money.format(buy.publicCasePrice)}/unit.
        </p>
        <a href={buy.sourceUrl} target="_blank" rel="noreferrer">
          Open source
        </a>
      </details>

      <button type="button" className="button button--secondary">
        I’d buy at the right price
      </button>
    </article>
  );
}

function EconomicsPanel() {
  const [procurementRate, setProcurementRate] = useState(0.7);
  const contribution = useMemo(
    () =>
      contributionPerOrder({
        comparableRetail: 80,
        customerSavingsRate: 0.15,
        procurementRateOfRetail: procurementRate,
        labourMinutes: 4,
        labourHourlyRate: 17,
        packagingCost: 0.75,
        shrinkRate: 0.01,
      }),
    [procurementRate],
  );

  const state =
    contribution >= 5 ? "publish" : contribution >= 0 ? "thin" : "reject";

  return (
    <section className="economics-panel" id="economics">
      <div>
        <span className="eyebrow">Price gate</span>
        <h2>Every buy has to earn its place.</h2>
        <p>
          HarbourCart is not a catalogue of bulk products. It should only open
          a buy when the customer receives a meaningful saving and the order
          still covers variable fulfilment costs.
        </p>
      </div>

      <div className="calculator-card">
        <label htmlFor="procurement">
          Procurement cost as % of comparable retail
          <strong>{percent.format(procurementRate)}</strong>
        </label>
        <input
          id="procurement"
          type="range"
          min="0.6"
          max="0.85"
          step="0.01"
          value={procurementRate}
          onChange={(event) =>
            setProcurementRate(Number.parseFloat(event.target.value))
          }
        />

        <div className="calculator-result">
          <span>Contribution per $80 retail-equivalent order</span>
          <strong>{money.format(contribution)}</strong>
        </div>

        <div className={`decision decision--${state}`}>
          {state === "publish"
            ? "Candidate passes the working ≥$5/order variable-contribution gate."
            : state === "thin"
              ? "Positive contribution, but below the normal publish gate."
              : "Reject: this order loses money before fixed costs."}
        </div>

        <p className="fineprint">
          Working model: customer saves 15%; 2.9% + $0.30 card processing; 4
          labour minutes at $17/hour; $0.75 packaging; 1% shrink. Fixed costs,
          delivery, insurance and site rent are not included.
        </p>
      </div>
    </section>
  );
}

function App() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="HarbourCart home">
          <HarbourMark />
          <span>HarbourCart</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#buys">Candidate buys</a>
          <a href="#demand">Demand</a>
          <a href="#economics">Price gate</a>
        </nav>
        <span className="prototype-pill">Research prototype</span>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <span className="eyebrow">Halifax group buying</span>
            <h1>Halifax buys better together.</h1>
            <p className="hero__lede">
              Pool household demand, negotiate real volume prices, and only run
              a buy when the numbers show a worthwhile customer saving.
            </p>
            <div className="hero__actions">
              <a className="button" href="#buys">
                Explore candidate buys
              </a>
              <a className="text-link" href="#economics">
                See how a buy qualifies
              </a>
            </div>
            <p className="prototype-warning">
              Prototype only — no orders, payments, or savings claims are live.
            </p>
          </div>

          <div className="hero__panel" aria-label="How HarbourCart works">
            <div className="step">
              <span>01</span>
              <div>
                <strong>Demand first</strong>
                <p>Households tell us what they would buy and at what price.</p>
              </div>
            </div>
            <div className="step">
              <span>02</span>
              <div>
                <strong>Source & verify</strong>
                <p>Supplier offers are normalized against current retail.</p>
              </div>
            </div>
            <div className="step">
              <span>03</span>
              <div>
                <strong>Open only good buys</strong>
                <p>Threshold pricing improves as collective demand grows.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="signal-strip" aria-label="Prototype status">
          <div>
            <strong>3</strong>
            <span>candidate buys screened</span>
          </div>
          <div>
            <strong>15%</strong>
            <span>working customer-savings gate</span>
          </div>
          <div>
            <strong>≤70%</strong>
            <span>normal procurement target</span>
          </div>
          <div>
            <strong>0</strong>
            <span>unverified buys published</span>
          </div>
        </section>

        <section className="section" id="buys">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Source before selling</span>
              <h2>Candidate buys</h2>
            </div>
            <p>
              These are research candidates, not available inventory. The app
              keeps public structural signals separate from real Halifax
              supplier quotes and customer-facing savings claims.
            </p>
          </div>

          <div className="buy-grid">
            {candidateBuys.map((buy) => (
              <BuyCard key={buy.id} buy={buy} />
            ))}
          </div>
        </section>

        <section className="demand-section" id="demand">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Reverse marketplace</span>
              <h2>What Halifax wants next</h2>
            </div>
            <p>
              Demand data comes before procurement. Once enough households are
              interested, HarbourCart has something concrete to take to farms,
              hubs, and distributors.
            </p>
          </div>

          <div className="demand-list">
            {demandIdeas.map((idea) => {
              const width = Math.min(
                100,
                Math.round((idea.households / idea.target) * 100),
              );

              return (
                <div className="demand-row" key={idea.name}>
                  <div>
                    <strong>{idea.name}</strong>
                    <span>{idea.households} interested households</span>
                  </div>
                  <div className="demand-meter">
                    <span style={{ width: `${width}%` }} />
                  </div>
                  <button type="button">+ Me</button>
                </div>
              );
            })}
          </div>
        </section>

        <EconomicsPanel />

        <section className="evidence-section">
          <span className="eyebrow">Evidence contract</span>
          <h2>No fake “you save” numbers.</h2>
          <p>
            A future live HarbourCart buy should preserve the supplier offer,
            comparable retail benchmark, observation dates, calculation, and
            handling eligibility that produced the displayed price. If the
            benchmark goes stale or a current Halifax sale beats the group buy,
            the claim changes or the buy does not open.
          </p>
          <div className="evidence-grid">
            <div>
              <strong>Supplier offer</strong>
              <span>SKU · pack · MOQ · validity · evidence</span>
            </div>
            <div>
              <strong>Retail benchmark</strong>
              <span>Halifax geography · observed date · promo flag</span>
            </div>
            <div>
              <strong>Landed cost</strong>
              <span>Payment · labour · packaging · shrink · freight</span>
            </div>
            <div>
              <strong>Immutable snapshot</strong>
              <span>What the household actually saw when committing</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand brand--footer">
          <HarbourMark />
          <span>HarbourCart</span>
        </div>
        <p>
          Phase 0 research prototype · Halifax, Nova Scotia · No live ordering
          or payments
        </p>
      </footer>
    </>
  );
}

export default App;
