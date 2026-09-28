# HarbourCart

**Working product name for a Halifax group-buy grocery platform.**

HarbourCart is being designed around one rule:

> Do not publish a group buy merely because something is available in bulk. Publish it only when current evidence shows a worthwhile customer saving and sustainable unit economics.

## Phase 0 status

This repository currently contains a customer-facing research prototype and the first tested economics domain functions.

The prototype deliberately distinguishes:

- public pack/case-price signals;
- real supplier quotes (not yet obtained);
- current retail benchmarks;
- model prices;
- customer-facing savings claims.

No ordering, payment, supplier integration, or live savings claim is implemented yet.

## Core workflow

1. Households express price-specific demand.
2. HarbourCart requests/ingests supplier offers.
3. Offers are normalized to common units.
4. Current Halifax retail is benchmarked.
5. Payment, labour, packaging, shrink and logistics are added.
6. Handling/regulatory eligibility is checked.
7. A buy opens only if it passes the configured customer-savings and contribution gates.
8. Commitments aggregate until the order threshold closes.
9. Procurement is placed against committed demand.

## Working economics gate

The first feasibility model uses:

- comparable retail basket: **$80**
- target customer saving: **15%**
- card processing: **2.9% + $0.30**
- labour: **4 minutes/order at $17/hour**
- packaging: **$0.75/order**
- shrink: **1% of procurement**

This model produces approximately:

- procurement at 65% of retail → **$11.32/order contribution**
- 70% → **$7.28**
- 75% → **$3.24**
- 80% → **-$0.80**

These are working assumptions, not production pricing.

## Run locally

```bash
npm install
npm test
npm run dev
```

## Build

```bash
npm run build
```

The Vite base path is configured for GitHub Pages at `/HarbourCart/`.

## Evidence and validation

See [docs/VALIDATION.md](docs/VALIDATION.md).

## Change-control note

The initial repository commit (`030c2d3da2d042affaee81b43547c7dc960868e1`) contains only the repository name. Phase 0 development is being done on a separate branch so the initial baseline remains unchanged until the prototype is verified.
