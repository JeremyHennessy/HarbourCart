# HarbourCart Nova Scotia Farm Directory

Research pipeline introduced: **2026-09-29**

## Purpose

The Farm Directory is HarbourCart's broad discovery layer for Nova Scotia farms,
food producers, wholesale channels, and farmers' markets.

It is intentionally separate from the curated procurement queue.

A farm can be useful to discover without being ready to quote. A directory record
must **never** unlock a customer-facing savings claim or supplier quote.

## Evidence contract

The directory enforces these distinctions:

- a public directory listing is **not** wholesale evidence;
- an agriculture-funding recipient record is **not** supplier evidence;
- a province-wide seasonal crop match is **not** current farm inventory;
- Halifax Regional Food Hub producer membership **is** evidence of participation
  in a wholesale aggregation channel, but it is still not a HarbourCart quote;
- current customer economics still require retained commercial price evidence in
  the supplier-quote model.

## Current sources

### 1. Buy Local NS

Source:
https://buylocal.novascotia.ca/business-search

Government-backed discovery spine. The collector walks the public business
directory, then fetches relevant farm/producer/supplier detail records.

Useful fields can include:

- canonical/public business name;
- business roles such as Farm, Producer, Supplier, or Wholesaler;
- address and region;
- products;
- phone, email, and website;
- public delivery / online-shop signals;
- where-to-buy locations;
- attributes.

The pipeline filters the much broader Buy Local business directory to agriculture
and food-production records relevant to HarbourCart.

### 2. Halifax Regional Food Hub

Producer roster:
https://www.halifaxfoodhub.ca/our-producers

Food Hub producer membership is one of the strongest public discovery signals
because the Hub is an operating wholesale aggregation/distribution channel.

The signal means:

> this producer participates in the Food Hub channel.

It does **not** mean:

> HarbourCart has a current price, inventory confirmation, MOQ, or direct
> supplier agreement.

### 3. ACORN Organic Directory

Source:
https://acornorganic.org/resources/organicdirectory

ACORN provides a current Atlantic organic producer/business directory, including
Nova Scotia farms, locations, products, phone numbers, websites, and in some cases
member/certification context.

ACORN membership/certification evidence improves discovery confidence but does
not imply wholesale terms.

### 4. Nova Scotia Federation of Agriculture 2026 CSA Directory

Source:
https://nsfa-fane.ca/csadirectory/

This directory covers farms participating in the 2026 Nova Scotia Loyal CSA
Incentive Pilot.

CSA participation is useful evidence that a farm is operating a consumer
distribution channel in 2026. It does not imply wholesale eligibility.

The directory is currently embedded. The collector attempts both the public page
and its public iframe source. If the embedded records are not machine-readable,
the source is surfaced as PARTIAL rather than silently treated as empty.

### 5. Farmers' Markets of Nova Scotia

Market directory:
https://farmersmarketsnovascotia.ca/find-a-market-new/

Seasonality:
https://farmersmarketsnovascotia.ca/whats-in-season-in-nova-scotia/

This provides:

- the certified market network;
- market region and public operating schedule;
- a province-wide seasonal-product calendar.

Where Buy Local records identify a market in "Where to Buy", HarbourCart joins
that location to the FMNS market spine when names can be reconciled.

Seasonality is explicitly labelled as a **province-wide screen only**.

### 6. Nova Scotia Agriculture Funding Programs Details

CSV:
https://data.novascotia.ca/api/views/jv92-pedy/rows.csv?accessType=DOWNLOAD

This dataset provides named historical recipients of provincial agriculture
program funding.

HarbourCart uses it only for:

- discovery/backfill;
- entity reconciliation;
- historical agriculture-program evidence.

A funding record does not establish that a farm is still active, sells a
specific product, wholesales, delivers to Halifax, or can supply HarbourCart.

## Normalized farm record

The generated feed stores records similar to:

```text
farm_id
canonical_name
aliases[]
roles[]

address
locations[]
regions[]

products[]
product_categories[]
attributes[]
where_to_buy[]
market_associations[]

contacts.phones[]
contacts.emails[]
contacts.websites[]

signals.food_hub_producer
signals.buy_local_farm
signals.buy_local_producer
signals.buy_local_supplier
signals.buy_local_wholesaler
signals.csa_2026
signals.acorn_directory
signals.acorn_member
signals.agriculture_funding_recipient
signals.delivery
signals.online_shop

funding.records
funding.total_known_amount
funding.latest_year

current_season_screen
harbourcart.fit_score
harbourcart.fit_band
harbourcart.fit_reasons[]

evidence[]
last_observed_at
```

Every important conclusion should remain traceable to source-level evidence.

## Entity reconciliation

Names are normalized for:

- punctuation;
- capitalization;
- common legal suffixes;
- selected known aliases.

The pipeline intentionally avoids aggressive fuzzy merging. A false merge between
two farms is worse than temporarily retaining two possible records.

Manual aliases are stored in:

`config/farm-directory.json`

## HarbourCart research-fit score

This score prioritizes research. It does **not** certify a supplier.

Current signals include:

- +40 Halifax Food Hub producer;
- +25 Buy Local NS wholesaler;
- +18 Buy Local NS supplier;
- +15 phase-1-compatible product evidence;
- +10 storage-stable staple product evidence;
- +8 public delivery signal;
- +7 2026 CSA participant;
- +5 organic-directory evidence;
- +5 Halifax/central/Valley proximity;
- +2 agriculture-program recipient history;
- penalty where the public product evidence is only later-phase food categories.

Bands:

- **HIGH** — investigate for the curated procurement queue;
- **MEDIUM** — useful research lead;
- **DISCOVERY** — retained for coverage/entity intelligence.

The score is intentionally not used by the quote/economics engine.

## Refresh architecture

Scheduled workflow:

`.github/workflows/farm-directory.yml`

Collector:

`scripts/fetch-farm-directory.mjs`

Parsers:

`scripts/farm-parser.mjs`

Live branch:

`data/farm-directory`

Live JSON:

`public/data/farm-directory.json`

The application reads the live data branch first and falls back to the packaged
snapshot only if the live branch is unavailable.

### Refresh cadence

Weekly, Monday.

Farm identities and market memberships generally change much more slowly than
grocery prices, so they do not need the twice-daily retail-price cadence.

## Failure behaviour

The farm pipeline fails conservatively.

If an external source fails during a refresh:

1. the source is marked FAILED;
2. records from the last successful snapshot for that source are retained;
3. the source becomes STALE_RETAINED when previous evidence was available;
4. stale evidence remains visible as stale;
5. no stale record becomes a current price or inventory claim.

This prevents temporary source outages from deleting valid farm identities.

## Procurement workflow

The intended flow is:

```text
broad farm directory
→ normalized/deduplicated farm spine
→ HarbourCart research-fit screen
→ human/evidence review
→ curated supplier target
→ current commercial quote
→ live Halifax comparator
→ basket economics
→ publication gate
```

No email or supplier contact is performed by the farm-directory pipeline.

## Known limitations

- some public directories may be server-rendered differently over time;
- CSA data is currently embedded and may not always be machine-readable;
- public farm product lists are often broad categories rather than exact SKUs;
- market membership can vary during a season;
- no public directory provides reliable current wholesale inventory or current
  HarbourCart-specific prices;
- agriculture funding is historical discovery evidence only.

These limitations are surfaced rather than inferred away.
