import { localSupportPrograms } from "../data/localSupport";

export default function LocalSupportView() {
  return (
    <section className="section evidence-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Local-support layer</span>
          <h2>Government incentives we can actually model.</h2>
        </div>
        <p>
          HarbourCart keeps government-funded discounts, loyalty rewards, and
          producer-only grants separate from HarbourCart's own price. Nothing is
          applied to a household order unless the specific transaction is
          confirmed eligible.
        </p>
      </div>

      <div className="support-grid">
        {localSupportPrograms.map((program) => (
          <article className="support-card" key={program.id}>
            <div className="support-card__topline">
              <span className="status-chip">
                {program.status.replaceAll("_", " ")}
              </span>
              <small>Current as of {program.currentAsOf}</small>
            </div>
            <h3>{program.name}</h3>
            <strong>{program.benefit}</strong>
            <p>{program.harbourCartRelevance}</p>
            <a href={program.sourceUrl} target="_blank" rel="noreferrer">
              Open program source
            </a>
          </article>
        ))}
      </div>

      <div className="gate-stack">
        <h3>How HarbourCart should treat incentives</h3>
        <ol>
          <li>Record cash price and government/loyalty benefit separately.</li>
          <li>
            Never reduce a comparison price using a reward the household may not
            qualify for.
          </li>
          <li>
            Never advertise a Nova Scotia Loyal discount until HarbourCart or
            the supplying farm is confirmed eligible for that exact program.
          </li>
          <li>
            Store program source, validity, eligibility basis, and calculated
            customer value with the claim snapshot.
          </li>
        </ol>
      </div>
    </section>
  );
}
