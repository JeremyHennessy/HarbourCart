import { useEffect, useMemo, useState } from "react";
import { pilotCandidates } from "../data/pilot";
import {
  lowestResearchSignal,
  type LiveRetailFeed,
} from "../domain/liveRetail";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export default function LiveRetailPanel() {
  const [feed, setFeed] = useState<LiveRetailFeed>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL("data/retail-live.json", window.location.href);
    url.searchParams.set("t", String(Date.now()));

    fetch(url.toString(), { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Retail feed returned HTTP " + response.status + ".");
        }
        return response.json() as Promise<LiveRetailFeed>;
      })
      .then((data) => {
        setFeed(data);
        setError(undefined);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          reason instanceof Error
            ? reason.message
            : "Live retail feed unavailable.",
        );
      });

    return () => controller.abort();
  }, []);

  const cards = useMemo(
    () =>
      pilotCandidates.map((buy) => ({
        buy,
        signal: lowestResearchSignal(feed?.prices ?? [], buy.id),
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
        {cards.map(({ buy, signal }) => (
          <div className="live-price-card" key={buy.id}>
            <span>{buy.product}</span>
            {signal ? (
              <>
                <strong>
                  {money.format(signal.normalizedPrice)}/
                  {signal.normalizedUnit}
                </strong>
                <small>
                  {signal.retailerLabel}
                  {signal.storeName ? " · " + signal.storeName : ""}
                </small>
                <span
                  className={
                    signal.scope === "HALIFAX_STORE"
                      ? "status-chip status-chip--good"
                      : "status-chip status-chip--blocked"
                  }
                >
                  {signal.scope === "HALIFAX_STORE"
                    ? "Halifax store verified"
                    : "Store scope unverified"}
                </span>
              </>
            ) : (
              <small>No current retailer observation captured.</small>
            )}
          </div>
        ))}
      </div>

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
