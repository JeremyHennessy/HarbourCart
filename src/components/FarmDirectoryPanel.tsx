import { useMemo, useState } from "react";
import {
  farmDirectoryAgeDays,
  farmDirectoryIsFresh,
  filterFarmDirectory,
  sourceHealthSummary,
  type FarmDirectoryFeed,
  type HarbourCartFarmFitBand,
} from "../domain/farmDirectory";

type Props = {
  feed?: FarmDirectoryFeed;
  error?: string;
};

const fitLabel: Record<HarbourCartFarmFitBand, string> = {
  HIGH: "High fit",
  MEDIUM: "Medium fit",
  DISCOVERY: "Discovery",
};

function fitClass(fit: HarbourCartFarmFitBand) {
  if (fit === "HIGH") return "status-chip status-chip--good";
  if (fit === "MEDIUM") return "status-chip status-chip--review";
  return "status-chip";
}

export default function FarmDirectoryPanel({ feed, error }: Props) {
  const [query, setQuery] = useState("");
  const [fitBand, setFitBand] = useState<
    HarbourCartFarmFitBand | "ALL"
  >("ALL");
  const [foodHubOnly, setFoodHubOnly] = useState(false);
  const [phase1Only, setPhase1Only] = useState(true);

  const filtered = useMemo(
    () =>
      feed
        ? filterFarmDirectory(feed.farms, {
            query,
            fitBand,
            foodHubOnly,
            phase1Only,
          })
        : [],
    [feed, query, fitBand, foodHubOnly, phase1Only],
  );

  if (!feed) {
    return (
      <section className="farm-directory-panel">
        <div className="quote-workspace__heading">
          <div>
            <span className="eyebrow">Nova Scotia farm spine</span>
            <h3>Farm & producer directory</h3>
          </div>
        </div>
        <p className="muted">
          Farm directory data has not loaded yet.
        </p>
        {error && <p className="feed-error">{error}</p>}
      </section>
    );
  }

  const health = sourceHealthSummary(feed);
  const fresh = farmDirectoryIsFresh(feed);
  const ageDays = farmDirectoryAgeDays(feed);
  const visible = filtered.slice(0, 40);

  return (
    <section
      className="farm-directory-panel"
      aria-label="Nova Scotia farm and producer directory"
    >
      <div className="quote-workspace__heading">
        <div>
          <span className="eyebrow">Nova Scotia farm spine</span>
          <h3>Farm & producer discovery</h3>
        </div>
        <span
          className={
            fresh
              ? "status-chip status-chip--good"
              : "status-chip status-chip--blocked"
          }
        >
          {fresh ? "Directory current" : "Directory stale"}
        </span>
      </div>

      <p className="muted">
        Broad discovery data is kept separate from the curated supplier queue.
        A directory listing, funding record, CSA entry, or seasonal crop match
        does not establish current wholesale availability or price.
      </p>

      {error && <p className="feed-error">{error}</p>}

      <div className="farm-directory-summary">
        <div>
          <span>Farm / producer records</span>
          <strong>{feed.stats.farms}</strong>
        </div>
        <div>
          <span>High-fit research leads</span>
          <strong>{feed.stats.highFit}</strong>
        </div>
        <div>
          <span>Food Hub producers</span>
          <strong>{feed.stats.foodHubProducers}</strong>
        </div>
        <div>
          <span>Market network</span>
          <strong>{feed.stats.markets}</strong>
        </div>
        <div>
          <span>Healthy sources</span>
          <strong>
            {health.healthy}/{health.total}
          </strong>
        </div>
      </div>

      <div className="farm-directory-meta">
        <span>
          Snapshot: {new Date(feed.generatedAt).toLocaleString("en-CA")}
          {Number.isFinite(ageDays) ? " · " + ageDays.toFixed(1) + " days old" : ""}
        </span>
        <span>
          Province-wide seasonal screen: {feed.currentNovaScotiaSeason}
        </span>
      </div>

      <div className="farm-directory-controls">
        <label className="farm-search">
          Search farm, product, market or region
          <input
            type="search"
            value={query}
            placeholder="e.g. potatoes, apples, Halifax, Medford"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label>
          HarbourCart fit
          <select
            value={fitBand}
            onChange={(event) =>
              setFitBand(
                event.target.value as HarbourCartFarmFitBand | "ALL",
              )
            }
          >
            <option value="ALL">All fit bands</option>
            <option value="HIGH">High fit</option>
            <option value="MEDIUM">Medium fit</option>
            <option value="DISCOVERY">Discovery</option>
          </select>
        </label>

        <label className="farm-check">
          <input
            type="checkbox"
            checked={phase1Only}
            onChange={(event) => setPhase1Only(event.target.checked)}
          />
          Phase-1 product evidence
        </label>

        <label className="farm-check">
          <input
            type="checkbox"
            checked={foodHubOnly}
            onChange={(event) => setFoodHubOnly(event.target.checked)}
          />
          Food Hub producers only
        </label>
      </div>

      <div className="farm-directory-results">
        <div className="farm-directory-results__heading">
          <strong>{filtered.length} matching records</strong>
          {filtered.length > visible.length && (
            <span>Showing first {visible.length}</span>
          )}
        </div>

        <div className="farm-directory-table-wrap">
          <table className="admin-table farm-directory-table">
            <thead>
              <tr>
                <th>Farm / producer</th>
                <th>Fit</th>
                <th>Products</th>
                <th>Signals</th>
                <th>Season screen</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((farm) => (
                <tr key={farm.id}>
                  <td>
                    <strong>{farm.canonicalName}</strong>
                    <span>
                      {[farm.address, ...farm.locations, ...farm.regions]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(" · ") || "Location not yet normalized"}
                    </span>
                    {farm.marketAssociations?.length ? (
                      <small>
                        Markets: {farm.marketAssociations.slice(0, 3).join(", ")}
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <span className={fitClass(farm.harbourCart.fitBand)}>
                      {fitLabel[farm.harbourCart.fitBand]}
                    </span>
                    <small>{farm.harbourCart.fitScore}/100 research fit</small>
                  </td>
                  <td>
                    {farm.products.length
                      ? farm.products.slice(0, 6).join(", ")
                      : "Products not yet normalized"}
                  </td>
                  <td>
                    <div className="farm-signal-list">
                      {farm.signals.foodHubProducer && (
                        <span className="status-chip status-chip--good">
                          Food Hub
                        </span>
                      )}
                      {farm.signals.buyLocalWholesaler && (
                        <span className="status-chip status-chip--good">
                          Wholesaler
                        </span>
                      )}
                      {farm.signals.buyLocalSupplier && (
                        <span className="status-chip status-chip--review">
                          Supplier
                        </span>
                      )}
                      {farm.signals.csa2026 && (
                        <span className="status-chip">CSA 2026</span>
                      )}
                      {farm.signals.acornDirectory && (
                        <span className="status-chip">Organic dir.</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {farm.currentSeasonScreen.status === "SEASONAL_MATCH" ? (
                      <>
                        <span className="status-chip status-chip--review">
                          Seasonal match
                        </span>
                        <small>
                          {farm.currentSeasonScreen.matchedProducts
                            .slice(0, 5)
                            .join(", ")}
                        </small>
                      </>
                    ) : (
                      <span className="muted">No province-wide match</span>
                    )}
                  </td>
                  <td>
                    <details>
                      <summary>
                        {farm.evidence.length} source
                        {farm.evidence.length === 1 ? "" : "s"}
                      </summary>
                      <ul>
                        {farm.evidence.slice(0, 8).map((evidence, index) => (
                          <li key={evidence.sourceId + "-" + index}>
                            {evidence.recordUrl ? (
                              <a
                                href={evidence.recordUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {evidence.sourceLabel}
                              </a>
                            ) : (
                              evidence.sourceLabel
                            )}
                            {evidence.staleRetained ? " · stale retained" : ""}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visible.length && (
          <p className="muted farm-empty">
            No farm records match the current filters.
          </p>
        )}
      </div>

      <details className="farm-source-health">
        <summary>Source health & coverage</summary>
        <div className="farm-source-grid">
          {feed.sources.map((source) => (
            <article key={source.id}>
              <div>
                <strong>{source.label}</strong>
                <span>{source.recordCount} records</span>
              </div>
              <span
                className={
                  source.status === "SUCCESS"
                    ? "status-chip status-chip--good"
                    : source.status === "STALE_RETAINED"
                      ? "status-chip status-chip--review"
                      : source.status === "FAILED"
                        ? "status-chip status-chip--blocked"
                        : "status-chip"
                }
              >
                {source.status.replace("_", " ")}
              </span>
              {source.errors.length > 0 && (
                <small>{source.errors[0]}</small>
              )}
            </article>
          ))}
        </div>
      </details>
    </section>
  );
}
