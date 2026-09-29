import { operatingAssumptions, operatingScenarios } from "../data/operations";
import {
  breakEvenHouseholds,
  fixedCostPerHousehold,
  weeklyFixedCosts,
} from "../domain/operations";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export default function OperatingCostPanel({
  contributionPerHousehold,
}: {
  contributionPerHousehold?: number;
}) {
  const unresolved = operatingAssumptions.filter(
    (item) => item.evidence === "QUOTE_REQUIRED",
  );

  return (
    <section className="operations-panel" aria-label="Weekly operating cost screen">
      <div className="operations-panel__heading">
        <div>
          <span className="eyebrow">Cohort economics</span>
          <h3>Weekly operating-cost screen</h3>
        </div>
        <span className="status-chip status-chip--blocked">
          {unresolved.length} unresolved fixed-cost gate
          {unresolved.length === 1 ? "" : "s"}
        </span>
      </div>

      <p className="muted">
        Basket contribution is not profit. These scenarios allocate the currently
        evidenced/modelled pickup, transport and software costs across the weekly
        cohort. Insurance and site permission stay unresolved rather than being
        assigned invented values.
      </p>

      <div className="operations-grid">
        {operatingScenarios.map((scenario) => {
          const costs = weeklyFixedCosts(scenario);
          return (
            <article className="operations-card" key={scenario.id}>
              <span className="eyebrow">{scenario.label}</span>
              <strong>{money.format(costs.total)}/week</strong>
              <dl>
                <div>
                  <dt>Pickup site</dt>
                  <dd>{money.format(costs.pickupSite)}</dd>
                </div>
                <div>
                  <dt>Transport</dt>
                  <dd>{money.format(costs.transport)}</dd>
                </div>
                <div>
                  <dt>Software</dt>
                  <dd>{money.format(costs.software)}</dd>
                </div>
                <div>
                  <dt>Break-even at current basket contribution</dt>
                  <dd>
                    {contributionPerHousehold && contributionPerHousehold > 0
                      ? breakEvenHouseholds(
                          costs.total,
                          contributionPerHousehold,
                        ) + " households"
                      : "Awaiting evidence-ready basket"}
                  </dd>
                </div>
              </dl>
              <div className="cohort-costs">
                {[50, 100, 250].map((households) => (
                  <span key={households}>
                    {households} homes ·{" "}
                    <strong>{money.format(fixedCostPerHousehold(costs.total, households))}</strong>
                    /home
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <details className="operations-unresolved">
        <summary>Unresolved operating evidence</summary>
        <ul>
          {unresolved.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong> — {item.note}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
