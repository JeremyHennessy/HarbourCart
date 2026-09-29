# HarbourCart

**Halifax group-buy grocery research and pilot platform.**

HarbourCart is designed around one non-negotiable rule:

> Do not publish a group buy merely because something is available in bulk. Publish it only when current evidence shows a worthwhile customer saving and sustainable unit economics.

## Current status

The repository now contains a phase-1 research pilot with:

- customer-facing candidate-buy cards;
- price-tier demand mechanics;
- shared anonymous price-specific pilot demand through the dedicated HarbourCart Supabase backend;
- a procurement/admin decision queue;
- an evidence-gated economics engine;
- conservative weekly benchmark-selection logic;
- supplier-offer validation/expiry rules;\n- typed supplier availability, quote-status, pack-format and commercial-term evidence;
- typed pilot research data with provenance;
- regulatory/source evidence documentation;
- a 50-household fake-money pilot plan;
- regulator, Food Hub, supplier, and benchmark outreach templates;
- unit/integrity tests and GitHub Actions CI.

There is **no live checkout, payment collection, supplier API, or verified customer savings claim yet**.

## Views

### Candidate buys

Shows research candidates and model price tiers while clearly distinguishing public structural price screens from verified supplier evidence.

### Demand

Lets a test household record the maximum price it would pay. During this research phase, a random anonymous browser session submits non-binding demand to the dedicated HarbourCart pilot backend. Public aggregates expose household counts and median maximum price without exposing raw session IDs.

### Procurement

Separates:

- **research signal** — whether public economics justify quote outreach; from
- **publication decision** — whether quote, local benchmark, handling eligibility, saving, and contribution evidence all pass.

### Evidence

Surfaces the current public authorities and explains the publication contract.

## Working economics gates

HarbourCart now separates three levels of economics:

1. **Item** — supplier cost, product freight, shrink, MOQ/case surplus and any item-specific packaging.
2. **Household basket** — card processing, the fixed card fee, order-level labour, basket packaging, total savings and the normal **CA$5/basket** contribution target.
3. **Weekly cohort** — pickup site, transport, software, insurance, admin and other weekly overhead.

Default working assumptions:

- minimum household-basket saving: **15%**
- normal minimum household-basket contribution: **CA$5/order**
- domestic-card processing: **2.9% + CA$0.30 once per basket**
- fulfilment labour: **4 minutes per household order at CA$17/hour**
- basket packaging: **CA$0.75/order**
- shrink: **1% of item procurement**
- candidate-specific inbound freight allocation

These are validation assumptions, not final production pricing.

## Evidence rules

The code will not return a publish decision solely because the math looks attractive.

A publishable household basket currently requires:

1. every included item has a verified supplier quote;
2. every included item has a current Halifax retail comparator;
3. handling/measurement eligibility is resolved for every included item;
4. the basket clears the configured customer-savings threshold;
5. the basket clears the configured contribution threshold;
6. the weekly cohort can cover the applicable operating-cost scenario.

See [docs/VALIDATION.md](docs/VALIDATION.md).

## External gates

Tracked in GitHub issues:

- #2 — Nova Scotia food-handling classification
- #3 — Halifax Regional Food Hub eligibility/terms
- #4 — real supplier quotes at 50 / 100 / 250-household demand
- #7 — insurance / fixed operating costs
- #10 — Measurement Canada for weighed shares
- #13 — Nova Scotia Loyal eligibility
- #15 — Sobeys normalized Halifax retail coverage
- #19 — written pickup-site permission
- #20 — shared anonymous pilot-demand backend

Issue #5 (weekly Halifax comparator coverage) is complete: the live feed now exceeds the 10-product Halifax-store threshold.

Outreach templates: [docs/OUTREACH.md](docs/OUTREACH.md)\n\nSupplier availability and quote queue: [docs/SUPPLIERS_AND_BENCHMARKS.md](docs/SUPPLIERS_AND_BENCHMARKS.md) and [docs/SUPPLIER_QUOTE_REQUESTS.md](docs/SUPPLIER_QUOTE_REQUESTS.md)

## Pilot

The first behavioural validation is intentionally fake-money:

- 50 Halifax-area households;
- 10–15 candidates;
- price-specific intent;
- no card collection;
- no product promise;
- compare demand curves with real quotes.

See [docs/PILOT.md](docs/PILOT.md).

The shared anonymous demand backend is deployed and integrated. GitHub issue #20 remains open only for production browser acceptance: verify live submit/update/opt-out and confirm the shared count changes across independent browsers before recruiting the 50-household cohort.

## Data model

See [docs/DATA_MODEL.md](docs/DATA_MODEL.md).

## Operating-cost model

Item margin is not treated as basket profit, and basket contribution is not treated as weekly profit. Pickup space, transport, pilot software and unresolved fixed costs are modelled separately in [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Live retail comparison

Atlantic Superstore and Sobeys public price observations are refreshed by a scheduled GitHub Actions workflow and shown in Procurement with explicit store/freshness status. Store-unverified prices remain research signals and cannot unlock a savings claim.

Volatile retail snapshots are published to the dedicated `data/retail-live` branch, so a grocery-price refresh does not create a new application release on `main`. The app keeps a packaged snapshot only as a fail-closed fallback; freshness rules still apply.

Retail evidence also distinguishes exact products, comparable products and explicit value alternatives so HarbourCart cannot claim savings by comparing against an artificially expensive reference.

See [docs/LIVE_RETAIL.md](docs/LIVE_RETAIL.md).

## Local-buy incentives

Current Nova Scotia Loyal consumer incentives, retailer-partner possibilities and producer-only programs are modeled separately from HarbourCart cash prices.

See [docs/GOVERNMENT_SUPPORT.md](docs/GOVERNMENT_SUPPORT.md).

## Run locally

\`\`\`bash
npm install
npm test
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

Vite is configured for GitHub Pages at \`/HarbourCart/\`.

## Change control

Initial repository baseline:

\`030c2d3da2d042affaee81b43547c7dc960868e1\`

The current pilot has been developed on:

\`agent/phase-0-foundation-20260928\`

until CI and deployment verification are complete.
