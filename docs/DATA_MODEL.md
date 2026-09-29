# HarbourCart data model

Status: **Phase 1 research model**

The data model keeps source evidence, economics, operating eligibility, and customer presentation separate.

## Core entities

### Product

Canonical product identity.

Required fields:

- id
- canonical_name
- category
- canonical_unit
- grade_or_variant rules
- temperature_control_required
- phase_1_default_handling_class
- sale_basis: COUNT / WEIGHED_SHARE / SEALED_PACK
- measurement_requirement

### Supplier

- id
- legal_name
- display_name
- contact
- source/verification status
- delivery/pickup capabilities

### SupplierOffer

Represents one evidence-bearing commercial offer.

- id
- supplier_id
- product_id
- exact SKU / grade / variety
- case quantity
- unit
- case price
- MOQ
- volume tiers
- delivery/pickup charge
- observed_at
- valid_until
- evidence_status
- evidence_url / retained artifact
- notes

A public catalogue observation is not a verified supplier offer.

### RetailBenchmark

- id
- product_id
- retailer
- store/geography
- exact/comparable classification
- package quantity
- unit
- regular price
- promotional price
- promotion limits
- observed_at
- source
- confidence

The monthly Statistics Canada source is stored separately from current local retail observations.

### HandlingEligibility

- product/handling class
- operating phase
- status: CONFIRMED_PHASE_1 / REQUIRES_CONFIRMATION / NOT_PHASE_1
- authority
- evidence date
- evidence reference
- version

### MeasurementEligibility

Tracks whether HarbourCart itself must make a trade measurement for the customer-facing sale.

- sale_basis
- status: NOT_REQUIRED / CONFIRMED / TRADE_SCALE_REQUIRED
- authority
- device/certification evidence when applicable
- evidence date
- version

A supplier-sealed pack or fixed-count whole item can avoid a HarbourCart weighing step. A weighed household share cannot bypass this gate.

### BuyCandidate

Joins the commercial and regulatory evidence needed to evaluate one item.

- product_id
- supplier_offer_id
- benchmark_id
- customer pack quantity
- target saving
- item-specific packaging
- shrink
- freight
- item contribution before basket overhead
- evidence/economic status
- decision reasons
- calculated_at

The item does **not** receive the household-order fixed card fee, household-order labour, or basket packaging.

### BasketEconomics

Evaluates the household transaction after viable items are combined.

- item candidate snapshots
- total customer price
- total comparable retail
- one percentage card fee plus one fixed card fee
- order-level labour
- basket packaging
- basket saving amount/rate
- contribution per household order
- minimum basket contribution
- decision / reasons

The normal CA$5 contribution target belongs here, not to every item.

### Buy

Created only after a candidate passes publication controls.

- id
- candidate_snapshot_id
- open_at
- close_at
- min/max quantity
- price tiers
- pickup options
- status

### DemandIntent

Price-specific consumer interest.

- household_id or pilot session id
- product_id
- quantity
- maximum price
- created_at
- expires_at
- pickup preference

During the fake-money pilot, this is explicitly non-binding.

### Commitment

Later real-money phase only.

- buy_id
- household_id
- quantity
- price snapshot
- payment authorization
- status

### EvidenceSnapshot

Immutable record of what supported the customer-facing claim.

- supplier offer identity/date/validity
- benchmark identity/date/geography/promo state
- handling-eligibility version
- measurement-eligibility version
- sale basis
- procurement cost
- payment cost
- labour cost
- packaging
- shrink
- freight
- landed variable cost
- customer price
- savings amount/rate
- contribution
- calculation version/time

### FarmDirectoryRecord

Broad source-backed farm/producer identity used for discovery only.

- farm_id
- canonical_name
- aliases
- roles
- address / locations / regions
- products / normalized product categories
- public business contacts
- where_to_buy / market associations
- source signals: Food Hub / Buy Local / CSA / ACORN / funding / delivery
- source evidence array
- current province-wide seasonality screen
- HarbourCart research-fit score / reasons
- last_observed_at

FarmDirectoryRecord does **not** satisfy SupplierOffer. Promotion from broad
discovery into the curated supplier queue requires stronger supplier evidence,
and customer economics still require a retained current quote.

### FarmDirectorySourceHealth

Tracks each upstream directory independently.

- source_id
- source_url
- fetched_at
- status: SUCCESS / PARTIAL / FAILED / STALE_RETAINED
- parsed record count
- request count
- retained record count when stale
- parse/fetch errors

A failed source retains its last verified records as stale rather than deleting
identities from the spine.

### FarmersMarket

Normalized Farmers' Markets of Nova Scotia network record.

- market_name
- region
- public schedule
- source_url

Market association is a discovery/distribution signal, not wholesale evidence.

## Decision separation

HarbourCart intentionally has two distinct concepts:

1. **Research signal** — whether public structural economics justify spending time on a quote.
2. **Publication decision** — whether verified evidence supports an actual customer-facing buy.

A strong research signal must never bypass missing quote, benchmark, handling, or measurement evidence.

## Source freshness

Initial working policy:

- supplier quote: valid only through its explicit expiry; if none, require manual review before each order cycle;
- local retail price: target <= 7 days old for weekly buys;
- monthly benchmark: informational baseline only;
- regulation: review when operating workflow changes or the authority updates applicable guidance.

## Phase 1 storage

The current prototype uses:

- typed/static application research data;
- the dedicated HarbourCart Supabase backend for shared anonymous fake-money demand;
- browser localStorage for private supplier-quote research;
- the `data/retail-live` branch for volatile retail observations;
- the `data/farm-directory` branch for broad farm/producer discovery snapshots.

Supplier quotes stored in browser localStorage are not authoritative shared
operational data. Before real accounts, payments, or orders, move durable
commercial entities to a transactional database with audit fields and immutable
evidence snapshots.
