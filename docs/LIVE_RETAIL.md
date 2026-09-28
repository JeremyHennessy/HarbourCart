# HarbourCart live retail comparator feed

Research/implementation pass: **2026-09-28**

## Objective

Use current public Atlantic Superstore and Sobeys pricing as an active comparison layer so HarbourCart does not claim a saving against stale or cherry-picked retail prices.

The retailer feed is a **benchmark input**, not a supplier source.

## Halifax reference stores

### Atlantic Superstore

- Barrington Street — 1075 Barrington St, Halifax — store ID **0369**
- Quinpool Road — 6139 Quinpool Rd, Halifax — store ID **0383**

Atlantic Superstore says its online grocery prices/deals are the same as in-store, while also warning that availability and prices can change based on the pickup/delivery context.

Official sources:
- https://www.atlanticsuperstore.ca/en/collection/online-grocery-shopping
- https://www.atlanticsuperstore.ca/store-locator/details/0369
- https://www.atlanticsuperstore.ca/store-locator/details/0383

### Sobeys

- Queen Street — 1120 Queen Street, Halifax
- preferred flyer/store number currently resolved from the store's flyer link as **0574**

Official sources:
- https://www.sobeys.com/stores/sobeys-queen-street?f=715
- https://www.sobeys.com/flyer?set_preferred_store_number=0574

Sobeys' public site states that product pricing and availability can vary and tells customers to use the local store/flyer for current savings. Therefore a general Sobeys product page is not automatically treated as a Halifax-store publication benchmark.

## Refresh architecture

GitHub Actions runs the retail monitor twice daily.

```text
official retailer pages
        ↓
store/session bootstrap
        ↓
HTML → visible text
        ↓
target product parser
        ↓
public/data/retail-live.json
        ↓
HarbourCart Procurement view
```

Workflow:
`.github/workflows/retail-prices.yml`

Fetcher:
`scripts/fetch-retail-prices.mjs`

Parser:
`scripts/retail-parser.mjs`

Tests:
`scripts/retail-parser.test.mjs`

## Store-scope safety

A captured price can be:

- `HALIFAX_STORE`
- `ATLANTIC_PUBLIC`
- `RETAILER_PUBLIC`

A price is allowed to satisfy HarbourCart's live publication comparator only when:

1. it is tied to a verified Halifax store session/source;
2. it is within the configured freshness window;
3. the product/unit is genuinely comparable.

If store scope cannot be independently confirmed, the observation is still shown as a **research signal**, but it does not unlock a customer-facing savings claim.

## Current Atlantic Superstore public signals

Current public official pages observed during the 2026-09-28 research pass include:

- English cucumber — **$1.50 each** sale;
- broccoli crown — **$2.50 each**;
- Roma tomatoes — one current fresh-produce page showed **$4.41/kg**, while another recent product view showed a different price;
- green cabbage — **$2.20/kg**;
- 3 lb yellow onions — one current produce page showed **$2.00** sale;
- Royal Gala apples — **$6.61/kg** on a public catalogue result, while a lower-priced value bag was also visible.

This variation is exactly why the generated feed retains source URL, time, location scope and raw evidence rather than converting a single search result into a permanent benchmark.

## Sobeys comparison considerations

Sobeys currently operates a **Verified Prices** promotion on selected flyer products in Atlantic Canada. For selected products, Sobeys says it checks competitor flyers (including Atlantic Superstore in Nova Scotia) and awards Scene+ value if a lower advertised competitor price is found, subject to the program terms.

Source:
https://www.sobeys.com/verified-prices

HarbourCart should therefore store:

- Sobeys cash price;
- any selected Verified Prices status;
- any Scene+ value;

as separate values.

Do not silently subtract loyalty points from the cash comparator.

## Failure behavior

If either retailer blocks automated access or a page structure changes:

- the workflow records an error;
- previous observations remain available;
- the app shows their timestamp/status;
- stale or store-unverified prices cannot satisfy the publication gate.

The system must fail **closed** for savings claims, not silently reuse an old price as current.


## Verified CI capture behaviour — 2026-09-28

The feature branch was tested from GitHub Actions, the same environment that will run scheduled refreshes.

### Atlantic Superstore

For the configured Barrington Street store, the smoke test:

- successfully established a selected-store session;
- captured 7 configured product prices;
- reported no retailer fetch errors.

The store page itself does not need to be re-discovered on every refresh: store ID/address identity is retained as configuration evidence, while the live session must still show the selected store context before a capture can be scoped as `HALIFAX_STORE`.

### Sobeys

Direct Sobeys store/product requests from the GitHub Actions runner returned HTTP 403.

The Flipp/Wishabi fallback successfully found the active Sobeys flyer for B3H 2R9 and returned 329 flyer items. The flyer API included names/prices but did not safely preserve unit/package information for the configured fresh-produce candidates in this week's flyer.

HarbourCart therefore does **not** infer units such as "$0.99 must mean per pound." Those offers remain unusable as normalized publication comparators unless the package/unit can be established from another supported source.

Current result:

- Superstore: live Halifax store-scoped comparator pipeline demonstrated;
- Sobeys: current public/flyer research signals available, but local normalized comparator coverage remains incomplete.
