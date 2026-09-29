import { useMemo } from "react";
import { pilotCandidates } from "../data/pilot";
import type { LiveRetailFeed } from "../domain/liveRetail";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export default function LiveRetailPanel({
  feed,
  error,
}: {
  feed?: LiveRetailFeed;
  error?: string;
}) {
  const cards = useMemo(
    () =>
      pilotCandidates.map((buy) => ({
        buy,
        signals: (feed?.prices ?? [])
          .filter((price) => price.productId === buy.id)
          .sort((a, b) => {
            if (a.retailer !== b.retailer) {
              return a.retailer.localeCompare(b.retailer);
            }
            return a.normalizedPrice - b.normalizedPrice;
          }),
      })),
    [feed],
  );

  return (
    <section className="live-retail-panel" aria-label="Live grocery price monitor">
      <div className="live-retail-panel__heading">
        <div>
          <span className="eyebrow">Retail comparator monitor</span>
          <h3>Atlantic Superstore + Sobeys live-price feed</h3>
        </div>
        <span className="status-chip">
          {feed?.lastSuccessfulAt
            ? "Last capture " +
              new Date(feed.lastSuccessfulAt).toLocaleString("en-CA")
            : "Awaiting live capture"}
        </span>
      </div>

      <p className="muted">
        HarbourCart refreshes official public retailer pages twice daily. Prices
        with unverified store scope are useful research signals but cannot satisfy
        the customer-savings publication gate.
      </p>

      {error && <p className="feed-error">{error}</p>}

      <div className="live-retail-grid">
        {cards.map(({ buy, signals }) => (
          <div className="live-price-card" key={buy.id}>
            <span>{buy.product}</span>
            {signals.length ? (
              <div className="live-price-card__retailers">
                {signals.map((signal) => (
                  <div
                    className="retailer-price-row"
                    key={signal.id}
                  >
                    <div>
                      <small>
                        {signal.retailerLabel}
                        {signal.storeName ? " · " + signal.storeName : ""}
                        {signal.comparability === "VALUE_ALTERNATIVE"
                          ? " · value alternative"
                          : signal.comparability === "COMPARABLE"
                            ? " · comparable"
                            : signal.comparability === "NOT_COMPARABLE"
                              ? " · not comparable"
                              : " · exact"}
                      </small>
                      <strong>
                        {money.format(signal.normalizedPrice)}/
                        {signal.normalizedUnit}
                      </strong>
                    </div>
                    <span
                      className={
                        signal.scope === "HALIFAX_STORE" ||
                        signal.scope === "HALIFAX_FLYER"
                          ? "status-chip status-chip--good"
                          : "status-chip status-chip--blocked"
                      }
                    >
                      {signal.scope === "HALIFAX_STORE"
                        ? "Halifax store"
                        : signal.scope === "HALIFAX_FLYER"
                          ? "Halifax flyer"
                          : "Scope unverified"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <small>No current retailer observation captured.</small>
            )}
          </div>
        ))}
      </div>

      {Boolean(feed?.signals?.length) && (
        <div className="retail-research-signals">
          <div>
            <strong>Current flyer prices awaiting unit verification</strong>
            <span>
              Shown for research only. These values never enter savings math until
              the package or sale unit is independently established.
            </span>
          </div>
          <div className="retail-research-signal-grid">
            {feed?.signals?.map((signal) => (
              <a
                className="retail-research-signal"
                href={signal.imageUrl ?? signal.sourceUrl}
                target="_blank"
                rel="noreferrer"
                key={signal.id}
              >
                <span>{signal.retailerLabel} · {signal.storeName}</span>
                <strong>{signal.displayName}</strong>
                <b>{money.format(signal.price)}</b>
                <small>Unit/package unverified · not used as comparator</small>
              </a>
            ))}
          </div>
        </div>
      )}

      {Boolean(feed?.errors.length) && (
        <details className="feed-errors">
          <summary>{feed?.errors.length} capture warning(s)</summary>
          <ul>
            {feed?.errors.map((item, index) => (
              <li key={item.retailer + "-" + index}>
                <strong>{item.retailer}</strong>: {item.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
