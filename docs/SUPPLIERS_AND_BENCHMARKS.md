# Supplier and current-price research targets

Research pass: **2026-09-28**

This pass separates four things that must not be conflated:

1. a supplier/channel exists;
2. a product is normally available in this season;
3. a public pack/case format is documented;
4. HarbourCart holds a current commercial quote.

Only #4 can become `VERIFIED_QUOTE`.

## Priority procurement network

| Priority | Target | Current evidence | Useful public formats / terms | Quote state |
| --- | --- | --- | --- | --- |
| P1 | Four Seasons Farm | Store/restaurant ordering; fall produce; Halifax route | Retail-ready units; case prices; CA$75 minimum; CA$6 Thursday delivery; Monday list / Tuesday noon cutoff | Request ready |
| P1 | Kings Produce | Grower aggregation, packing and wholesale contact | Weekly organic list for TapRoot routed through Kings; temperature-controlled handling | Request ready |
| P1 | TapRoot Farms | Weekly wholesale list for regular business buyers | Wholesale orders/delivery handled by Kings Produce | Request ready |
| P1 | Vermeulen Farms | Commercial 450-acre farm with wholesale catalogue | 24-count cucumbers; 18/24/30-count celery; 24-count lettuces; 50-lb squash; 20-lb tomatoes/zucchini | Request ready |
| P1 | Agri-Growers / Sawler Gardens | Grower/packer/shipper with seasonal chart | 2/3/5-lb carrots; 2/3/5-lb onions; 5/10/20-lb potatoes; fixed-count broccoli/cauliflower/cucumbers | Request ready |
| P1 | CTL Distributors | Broad-line commercial produce delivered in Greater Halifax | 100+ produce varieties; six-day delivery | Request ready |
| P1 | Abundant Acres | Seasonal farm wholesale with Halifax/Warehouse Market access | Current assortment varies with harvest | Request ready |
| P1 | Stirling Fruit Farms | Wholesale orchard/storage-fruit operation | Ask for intact 3/5-lb apple packs | Request ready |
| P1 | Noggins Corner Farm | Supplier/orchard with controlled-atmosphere storage | Orchard/seasonal produce; current wholesale list required | Request ready |
| P1 | Gouchers Farm & Market | Wholesale inquiries and broad Valley crop mix | Strong overlap with potatoes/carrots/cucumbers/beans/apples | Request ready |
| P1 | Speerville Flour Mill | Regional shelf-stable grain/flour supplier | Intact large flour/grain bags; buying-group channel | Request ready |
| P1 | Halifax Regional Food Hub | Live wholesale aggregation/order/delivery platform | One checkout/invoice; Friday-Monday ordering; Thursday pickup/delivery; optional CA$50 buyer share | Buyer terms request ready |
| P2 | Good Clean Farm | Certified-organic four-season producer; 2026 farm stand through mid-October | Bulk purchases can be arranged in advance | Request ready |
| P2 | The Station Food Hub | Wholesale inquiry and producer/processing partnerships | Current HarbourCart-relevant buyer inventory not public | Request ready |

Structured source URLs, dates, availability status, quote status and public pack/term evidence are stored in `src/data/suppliers.ts`.

## Current late-September availability screen

This is **seasonal evidence**, not current-week stock.

### Strong phase-1 categories

- apples / storage fruit;
- potatoes;
- storage onions;
- carrots;
- cabbage;
- broccoli;
- cauliflower;
- celery;
- cucumbers where late-season supply remains available;
- winter squash;
- intact flour, oats and grains.

These categories are favoured because they can be sourced in durable, fixed-count or supplier-packed formats and generally avoid refrigeration/cutting/washing.

### Defer from the first real-money pilot

- meat;
- dairy;
- seafood;
- eggs;
- prepared foods;
- HarbourCart-repacked bulk dry goods;
- HarbourCart-prepared weighed produce shares until measurement/handling gates are resolved.

## Why Four Seasons moved to the top

The current official store/restaurant order process is unusually compatible with a HarbourCart pilot:

- products are packaged in units fit for retail;
- case pricing is offered;
- CA$75 minimum;
- CA$6 delivery;
- Thursday route;
- pickup at Local Source if the minimum is not reached;
- current list goes out Monday;
- orders are due Tuesday at noon.

The downloadable public price sheet is older and **must not be entered as a current 2026 supplier quote**.

## Why Kings / TapRoot matters

TapRoot explicitly states that regular wholesale customers can receive a weekly price list and that Kings Produce manages its organic wholesale list, orders and delivery.

This creates a useful single procurement path rather than treating every Valley producer as a separate HarbourCart route.

## Why Agri-Growers / Sawler matters

Its public seasonal/pack information includes consumer-manageable formats that directly reduce HarbourCart repacking:

- carrots: 2 / 3 / 5 lb;
- onions: 2 / 3 / 5 lb;
- potatoes: 5 / 10 / 20 lb;
- broccoli: 14 / 18 count;
- cauliflower: 9 / 12 / 16 count;
- cucumbers: 24–48 count.

The published material is structural evidence. Current 2026 pricing and commercial terms must be requested directly.

## Halifax Regional Food Hub

The Hub is now an operating wholesale channel, not a theoretical future service.

Public buyer terms currently confirm:

- register through the online store;
- order Friday 7am through Monday 3pm;
- Thursday afternoon pickup or delivery;
- multiple Nova Scotia suppliers in one checkout;
- one invoice;
- optional buyer membership;
- one-time CA$50 optional membership share;
- non-members can order with a CA$2/order service fee;
- the current producer handbook says the Hub adds a 25% markup to producer-set prices.

Still unresolved for HarbourCart:

- whether an online household buying club / retailer is accepted;
- buyer minimum order;
- delivery/pickup charges beyond the confirmed CA$2 non-member service fee;
- payment terms;
- catalogue export/API/CSV;
- whether committed aggregate volume can unlock supplier volume pricing.

Those remain external evidence gates.

## Supplier outreach order

1. Four Seasons — obtain the current weekly list and confirm HarbourCart buyer eligibility.
2. Kings Produce / TapRoot — obtain the weekly wholesale list and Halifax delivery/MOQ terms.
3. Agri-Growers / Sawler — quote intact 5/10-lb staple packs and fixed-count vegetables.
4. Vermeulen — quote fixed-count cucumbers/celery/lettuce and squash formats.
5. CTL — obtain delivered broad-line control pricing.
6. Halifax Regional Food Hub — confirm buyer classification and actual buyer fees/catalogue access.
7. Stirling + Noggins — quote current apple/storage-fruit consumer packs.
8. Gouchers + Abundant Acres — farm-direct comparison.
9. Speerville — intact pantry bags.
10. Good Clean Farm / Station Food Hub — secondary options.

A web page, phone comment or public historical price sheet does not become `VERIFIED_QUOTE`. Retain the original commercial response and its validity window.

## Current retail-source finding

A current Nova Scotia Atlantic Superstore flyer is valid **September 24–30, 2026**. Public extracted prices are research signals unless the exact unit/package and Halifax-store applicability are preserved.

HarbourCart's retail evidence rules continue to distinguish:

- exact product;
- genuinely comparable product;
- lower-priced value alternative.

A weekly promotion or value pack can erase an apparent wholesale advantage, so the comparison must use the most honest current Halifax alternative rather than an artificially expensive loose-product reference.

## Benchmark capture locations

- Atlantic Superstore — 1075 Barrington St, Halifax
- Atlantic Superstore — 6139 Quinpool Rd, Halifax
- Sobeys — 1120 Queen St, Halifax
- Sobeys — 2651 Windsor St, Halifax
- Sobeys — 6990 Mumford Rd, Halifax

The next economics milestone is not more structural web research. It is **current supplier list/quote capture joined to the existing live Halifax comparator feed**.
