# HarbourCart 50-household pilot

Status: **Designed, not yet launched**

## Purpose

Validate behaviour before building checkout or food-handling operations.

The pilot should answer:

1. Will households make price-specific commitments rather than express generic interest?
2. Which products create enough demand at a price that could support viable procurement?
3. How sensitive is demand to price tiers?
4. Which pickup windows/areas concentrate demand?
5. Does showing current retail comparison increase confidence and conversion?

## Scope

Initial cohort: **50 Halifax-area households**

Initial catalogue: **10–15 candidates**

Prioritize:

- intact supplier-packed potatoes and onions;
- whole produce sold by fixed count, such as broccoli heads or cucumbers;
- orchard/farm products already packed by the supplier for household sale;
- one or two intact sealed pantry products;
- weighed loose-case candidates only as research items until trade-scale and handling requirements are resolved.

Keep eggs, meat, dairy, seafood, prepared food, cutting/washing, and bulk repacking outside phase 1 until operating requirements are confirmed. For the first real-money pilot, also avoid HarbourCart-prepared weighed shares unless a legal-for-trade scale process and the provincial handling classification are confirmed.

## Fake-money flow

1. Participant sees a household quantity.
2. Participant enters the highest price they would pay.
3. Participant sees the actual aggregate of submitted pilot intents only after the shared anonymous demand backend is deployed. Research/model scenarios must remain labelled separately.
4. No card is collected.
5. No product is promised.
6. The intent expires after the test window.
7. HarbourCart compares the demand curve with real supplier quotes.

## Required measurement

Per product:

- impressions;
- households entering a target price;
- target-price distribution;
- households opting in;
- conversion by displayed price;
- conversion by price tier;
- requested quantity;
- pickup preference;
- referral source.

Pilot-wide:

- number of households with >=1 serious intent;
- median intended basket value;
- number of products with enough demand to request a quote;
- number of evidence-ready items that can participate in a basket;
- number of realistic household baskets clearing the 15% savings and CA$5 basket-contribution gates after real quotes;
- referral rate;
- repeat-session rate.

## Working success gates

These are test thresholds, not proven business truths:

- >= 50 recruited households;
- >= 60% submit at least one price-specific intent;
- >= 5 products attract enough demand to request a commercial quote;
- >= 3 products have complete supplier/retail/handling evidence and positive item economics;
- at least one realistic multi-item household basket clears both:
  - 15% customer saving against current local comparators; and
  - CA$5 modeled contribution after shared payment/labour/packaging costs;
- at least one feasible weekly pickup cluster emerges without requiring a long-term lease.

If these fail, diagnose demand, price, product selection, or operating cost before adding payment/account infrastructure.

## Stop conditions

Do not move to real-money checkout if:

- the exact handling workflow remains regulator-unresolved;
- a candidate relies on HarbourCart sale-by-weight but legal-for-trade measurement has not been resolved;
- no real supplier quote supports the modeled savings;
- weekly promotions consistently beat the group-buy economics;
- pickup/transport fixed costs erase the basket contribution at the expected cohort size;
- the pilot requires speculative inventory to function.

## Real-money pilot prerequisites

- written regulatory classification;
- legal-for-trade measurement process for any sale-by-weight candidate, or an operating scope that avoids it;
- shared anonymous demand backend deployed and tested;
- supplier terms and order minimums;
- current local benchmark feed;
- insurance quote;
- pickup-site suitability;
- shortage/substitution/refund policy;
- payment/refund implementation;
- durable order/evidence database;
- customer terms/privacy policy;
- documented traceability process.
