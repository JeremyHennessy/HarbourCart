# HarbourCart validation contract

Last research pass: **2026-09-28**

This document separates confirmed public evidence from hypotheses and external evidence still required.

## Confirmed public evidence

### Nova Scotia food-safety path

The Nova Scotia Food Safety Regulations contain exemptions relevant to a deliberately constrained pilot, including premises offering only fresh, whole, unprocessed fruits and vegetables and certain non-potentially-hazardous foods prepackaged at inspected facilities.

Source:
https://novascotia.ca/just/regulations/regs/hpafood.htm

**Not yet confirmed:** whether HarbourCart's exact workflow — recurring weekly pickup, opening master cases, or dividing loose whole produce into customer bags — remains inside an exemption or requires a food-establishment permit/facility controls. That classification must be obtained in writing before the handling workflow is locked.

### Halifax Regional Food Hub

The Hub is a real local aggregation/distribution option. Its published producer handbook describes aggregation/fulfilment and states a 23% markup on producer-set pricing.

Sources:
https://www.halifaxfoodhub.ca/
https://www.halifaxfoodhub.ca/_files/ugd/355c8a_728f4057e0d3492a984bf34df169e2b5.pdf

**Not yet confirmed:** consumer buying-club eligibility, actual buyer terms, current product prices, minimums, or an authorized data feed.

### Statistics Canada food-price benchmark

Table 18-10-0245-02 can supply a defensible monthly baseline by geography.

Source:
https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024502

**Product rule:** a monthly benchmark alone is not sufficient for a live “you save $X” claim. Current Halifax store/flyer pricing must also be considered.

### Payments

The initial economics model uses Stripe's published standard Canadian domestic-card pricing of 2.9% + CA$0.30.

Source:
https://stripe.com/en-ca/pricing

## Public structural screens currently represented in the prototype

These are procurement leads, not supplier quotes.

- Roma tomatoes: public reference 6.61/kg versus public case-equivalent 3.08/kg.
- Broccoli crowns: public reference 8.82/kg versus public case-equivalent 3.75/kg.
- English cucumber: public reference 1.75 each versus a 12-count public case at 17.99.

Public catalogue:
https://www.wholesaleclub.ca/

The screen illustrates a crucial product requirement: pack/case economics vary enough that HarbourCart must evaluate every buy instead of assuming “bulk = cheaper.”

## External evidence gates

Before any real pilot:

1. **Regulatory classification**
   - written classification of the exact weekly workflow;
   - case-opening and loose-produce bagging rules;
   - pickup-site requirements;
   - rules for any future dry-good repacking.

2. **Real Halifax supplier quotes**
   - SKU / grade;
   - case or pack;
   - minimum order;
   - price tiers at approximately 50 / 100 / 250 households;
   - delivery/pickup costs;
   - validity period;
   - source/provenance.

3. **Current retail comparator**
   - same or genuinely comparable SKU;
   - Halifax store/geography;
   - regular vs promotion flag;
   - observed timestamp.

4. **Operational fixed costs**
   - insurance;
   - pickup site;
   - transport;
   - software;
   - accounting;
   - spoilage variance;
   - staff/admin above per-order fulfilment time.

## Claim policy

A future customer-facing savings claim should store an immutable snapshot of:

```text
supplier_offer_id
supplier_offer_observed_at
benchmark_id
benchmark_observed_at
benchmark_geography
customer_price
landed_cost
saving_amount
saving_percent
calculated_at
handling_eligibility_version
```

If the benchmark or supplier offer becomes stale, the claim must be recalculated or withdrawn.
