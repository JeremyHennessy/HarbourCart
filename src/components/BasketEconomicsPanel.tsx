import type { BasketEconomics, BasketItemEconomics } from "../domain/basket";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const percent = new Intl.NumberFormat("en-CA", {
  style: "percent",
  maximumFractionDigits: 0,
});

export default function BasketEconomicsPanel({
  economics,
  items,
}: {
  economics: BasketEconomics;
  items: BasketItemEconomics[];
}) {
  const tone =
    economics.decision === "PUBLISH"
      ? "good"
      : economics.decision === "REVIEW"
        ? "review"
        : "blocked";

  return (
    <section className="basket-panel" aria-label="Household basket economics">
      <div className="basket-panel__heading">
        <div>
          <span className="eyebrow">Household economics</span>
          <h3>Basket gate</h3>
        </div>
        <span className={"status-chip status-chip--" + tone}>
          {economics.decision === "PUBLISH"
            ? "Basket passes"
            : economics.decision}
        </span>
      </div>

      <p className="muted">
        The $5 contribution target belongs to the household basket, not to every
        individual item. Card fixed fees, order labour, and basket packaging are
        charged once per household order here.
      </p>

      <div className="basket-metrics">
        <div>
          <span>Evidence-ready items</span>
          <strong>{items.length}</strong>
        </div>
        <div>
          <span>Basket price</span>
          <strong>{money.format(economics.customerRevenue)}</strong>
        </div>
        <div>
          <span>Comparable retail</span>
          <strong>{money.format(economics.comparableRetail)}</strong>
        </div>
        <div>
          <span>Basket saving</span>
          <strong>{percent.format(economics.savingsRate)}</strong>
        </div>
        <div>
          <span>Payment fee · once</span>
          <strong>{money.format(economics.processingCost)}</strong>
        </div>
        <div>
          <span>Order labour · once</span>
          <strong>{money.format(economics.labourCost)}</strong>
        </div>
        <div>
          <span>Basket packaging · once</span>
          <strong>{money.format(economics.basketPackagingCost)}</strong>
        </div>
        <div>
          <span>Contribution / household</span>
          <strong>{money.format(economics.contribution)}</strong>
        </div>
      </div>

      {items.length > 0 && (
        <details className="basket-items">
          <summary>Items in this evidence-ready basket</summary>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong> — {money.format(item.customerPrice)}
                {" · "}
                {money.format(
                  item.customerPrice -
                    item.procurementCost -
                    item.freightCost -
                    item.shrinkCost -
                    (item.itemPackagingCost ?? 0),
                )}{" "}
                before basket overhead
              </li>
            ))}
          </ul>
        </details>
      )}

      {economics.decisionReasons.length > 0 && (
        <div className="basket-reasons">
          {economics.decisionReasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>
      )}
    </section>
  );
}
