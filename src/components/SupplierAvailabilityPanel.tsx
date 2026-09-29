import { supplierTargets } from "../data/suppliers";

const availabilityLabel: Record<
  (typeof supplierTargets)[number]["availabilityStatus"],
  string
> = {
  YEAR_ROUND: "Year-round channel",
  CURRENT_SEASON: "Current season",
  SEASONAL: "Seasonal",
  CURRENT_WEEK_CONFIRMED: "Current week confirmed",
  INVENTORY_UNKNOWN: "Inventory unknown",
  OUT_OF_SEASON: "Out of season",
};

const quoteLabel: Record<
  (typeof supplierTargets)[number]["quoteStatus"],
  string
> = {
  NOT_REQUESTED: "Not requested",
  REQUEST_READY: "Request ready",
  QUOTE_REQUESTED: "Quote requested",
  VERIFIED_QUOTE: "Verified quote",
  QUOTE_EXPIRED: "Quote expired",
};

function availabilityTone(
  status: (typeof supplierTargets)[number]["availabilityStatus"],
) {
  if (status === "CURRENT_WEEK_CONFIRMED") return "status-chip--good";
  if (status === "CURRENT_SEASON" || status === "YEAR_ROUND") {
    return "status-chip--review";
  }
  return "";
}

export default function SupplierAvailabilityPanel() {
  const ordered = [...supplierTargets].sort(
    (a, b) =>
      a.priority.localeCompare(b.priority) || a.name.localeCompare(b.name),
  );
  const p1 = ordered.filter((supplier) => supplier.priority === "P1").length;
  const withPackEvidence = ordered.filter(
    (supplier) => (supplier.publicPackFormats?.length ?? 0) > 0,
  ).length;
  const verifiedQuotes = ordered.filter(
    (supplier) => supplier.quoteStatus === "VERIFIED_QUOTE",
  ).length;

  return (
    <section
      className="quote-workspace supplier-availability-panel"
      aria-label="Supplier availability research"
    >
      <div className="quote-workspace__heading">
        <div>
          <span className="eyebrow">Procurement evidence</span>
          <h3>Supplier availability & pack formats</h3>
        </div>
        <span className="status-chip">{ordered.length} researched channels</span>
      </div>

      <p className="muted">
        Availability is kept separate from price evidence. “Current season” means
        an official source supports the crop/channel for this period; it does not
        mean HarbourCart has confirmed this week’s inventory. Only retained,
        current commercial evidence becomes a verified quote.
      </p>

      <div className="admin-summary">
        <div>
          <span>P1 quote targets</span>
          <strong>{p1}</strong>
        </div>
        <div>
          <span>Public pack evidence</span>
          <strong>{withPackEvidence}</strong>
        </div>
        <div>
          <span>Current-week confirmed</span>
          <strong>
            {
              ordered.filter(
                (supplier) =>
                  supplier.availabilityStatus === "CURRENT_WEEK_CONFIRMED",
              ).length
            }
          </strong>
        </div>
        <div>
          <span>Verified quotes</span>
          <strong>{verifiedQuotes}</strong>
        </div>
      </div>

      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Supplier / channel</th>
              <th>Priority</th>
              <th>Availability</th>
              <th>Products</th>
              <th>Public pack / terms evidence</th>
              <th>Quote state</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((supplier) => (
              <tr key={supplier.id}>
                <td>
                  <strong>{supplier.name}</strong>
                  <span>{supplier.serviceArea}</span>
                  <a href={supplier.sourceUrl} target="_blank" rel="noreferrer">
                    Source
                  </a>
                </td>
                <td>
                  <span
                    className={
                      supplier.priority === "P1"
                        ? "status-chip status-chip--good"
                        : "status-chip"
                    }
                  >
                    {supplier.priority}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-chip ${availabilityTone(
                      supplier.availabilityStatus,
                    )}`}
                  >
                    {availabilityLabel[supplier.availabilityStatus]}
                  </span>
                  <small>{supplier.availabilityBasis}</small>
                </td>
                <td>{supplier.products.slice(0, 6).join(", ")}</td>
                <td>
                  {supplier.publicPackFormats?.length ? (
                    <details>
                      <summary>
                        {supplier.publicPackFormats.length} pack format
                        {supplier.publicPackFormats.length === 1 ? "" : "s"}
                      </summary>
                      <ul>
                        {supplier.publicPackFormats.map((format) => (
                          <li key={format}>{format}</li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <span>No structured pack data yet</span>
                  )}
                  {supplier.publicCommercialTerms?.length ? (
                    <details>
                      <summary>
                        {supplier.publicCommercialTerms.length} public term
                        {supplier.publicCommercialTerms.length === 1 ? "" : "s"}
                      </summary>
                      <ul>
                        {supplier.publicCommercialTerms.map((term) => (
                          <li key={term}>{term}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </td>
                <td>
                  <span
                    className={
                      supplier.quoteStatus === "VERIFIED_QUOTE"
                        ? "status-chip status-chip--good"
                        : "status-chip status-chip--blocked"
                    }
                  >
                    {quoteLabel[supplier.quoteStatus]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
