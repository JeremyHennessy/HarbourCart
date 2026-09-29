# HarbourCart operating-cost screen

Research pass: **2026-09-28**

This model answers a different question from item and basket economics:

> After item evidence is complete and the household basket clears its savings/contribution gate, can the weekly cohort cover the operating costs of running the pickup?

## Confirmed public inputs

### 2026 vehicle cost proxy

CRA's reasonable prescribed automobile allowance for the first 5,000 km in a province is **CA$0.73/km for 2026**.

Source:
https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/automobile/automobile-motor-vehicle-allowances.html

HarbourCart uses that only as a conservative all-in vehicle proxy. It is not a quote for a van, courier, or supplier delivery.

### Open Food Network

Current public Hubs / Buying Groups pricing includes:

- Starter: 2% of sales;
- Micro-hub: $140 per 4-month season for annual sales under $30K;
- Growing: $400 per 4-month season for annual sales $30K–$100K;
- Scaling: $600 per 4-month season for annual sales $100K–$500K.

Source:
https://about.openfoodnetwork.ca/sell-local/software-pricing/

The current operations model uses **$400 / 17.3 weeks ≈ $23.12/week** only as a pilot software scenario. HarbourCart has not selected Open Food Network or a paid plan.

### HRM recreation-room rate screen

HRM's published user-charge schedule includes recreation-room corporate hourly rates ranging by room class, with current schedule columns showing rates from roughly the mid-teens through the high-$30s per hour.

Source:
https://www.halifax.ca/sites/default/files/documents/city-hall/legislation-by-laws/By-lawU-100.pdf

The model rounds this to **$40/hour for 4 hours/week = $160/week** as a conservative screening assumption.

This is **not a facility quote and not evidence that a municipal recreation room is eligible for commercial food pickup**. Room classification, HST, staffing, availability, occupancy, zoning/use, and food-handling suitability remain external checks.

## Known-cost scenarios

The model intentionally leaves insurance and fixed administrative overhead at **$0 / unknown** until evidence is obtained.

### Local / Hub route screen

Assumptions:

- pickup room: $160/week;
- route: 25 km/week × $0.73 = $18.25;
- software: ~$23.12/week;
- known modeled weekly cost: **~$201.37**;
- insurance: **not included / quote required**;
- admin: **not included**.

At the current $80-retail-equivalent unit model:

| Variable contribution / household | Break-even households on known costs only |
| ---: | ---: |
| ~$11.32 (65% procurement) | 18 |
| ~$7.28 (70% procurement) | 28 |
| ~$3.24 (75% procurement) | 63 |

At 50 households and ~$7.28 variable contribution, about **$163/week remains after these known modeled costs** — before insurance, fixed admin, unexpected spoilage, site extras, taxes on taxable services, and any other omitted overhead.

### Direct regional supplier-pickup screen

Assumptions:

- pickup room: $160/week;
- route: 200 km/week × $0.73 = $146;
- software: ~$23.12/week;
- known modeled weekly cost: **~$329.12**.

At ~$7.28 variable contribution, break-even on those known modeled costs alone is about **46 households**.

That makes the 50-household pilot tight if HarbourCart must both drive regionally for product and pay for a pickup site. Supplier delivery, Food Hub aggregation, or a low/no-cost partner pickup site can materially change the result.

## What is still missing

Do not call these scenarios a full operating margin until we have:

1. a HarbourCart-specific general/product-liability insurance quote;
2. an actual pickup-site quote and written permission for the activity;
3. real supplier delivery/pickup charges;
4. actual route kilometres;
5. staffing/admin time outside the existing four-minute per-order packing assumption;
6. payment/refund loss experience;
7. actual shrink/spoilage;
8. tax/accounting treatment of any platform or membership fee.

## Operational decision rule

Before a real weekly buy opens:

1. item-level evidence must pass for every product in the basket;
2. the household basket must clear the configured savings and contribution gates after one card fixed fee, one order-labour allocation and one basket-packaging allocation;
3. cohort-level expected basket contribution must cover the applicable weekly operating-cost scenario;
4. unresolved fixed costs must be surfaced rather than silently treated as zero.

The first 50-household pilot should therefore optimize for **cheap logistics**, not just cheap produce.
