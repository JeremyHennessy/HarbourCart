# HarbourCart validation contract

Last research pass: **2026-09-28**

HarbourCart must distinguish confirmed evidence, evidence-supported conclusions, model assumptions, and unresolved external questions. A public catalogue price is never promoted to a supplier quote by inference.

## Publication rule

A customer-facing buy is publishable only when all of the following are true:

1. a real supplier offer is verified;
2. a current Halifax retail comparator is available;
3. the handling workflow is permitted for the current operating phase;
4. any HarbourCart sale-by-weight measurement requirement is resolved;
5. the customer saving clears the configured minimum;
6. variable contribution clears the configured minimum;
7. the evidence snapshot used to show the claim is retained.

The code implements this as an evidence-gated decision engine. Strong economics alone cannot return PUBLISH.

## Confirmed public evidence

### Nova Scotia food-safety path

The Nova Scotia Food Safety Regulations contain exemptions relevant to a deliberately constrained pilot, including:

- premises offering only fresh, whole, unprocessed fruit and vegetables cut for harvest;
- premises offering only non-potentially-hazardous food prepackaged at a facility subject to inspection.

Source:
https://novascotia.ca/just/regulations/regs/hpafood.htm

**Evidence-supported conclusion:** a phase-1 scope of whole produce and intact sealed low-risk packs is materially simpler than meat, dairy, prepared food, cutting/washing, or bulk repacking.

**Still unresolved:** whether HarbourCart's exact recurring workflow — opening master cartons, dividing loose whole produce among customer orders, bagging/weighing produce, and using a recurring pickup site — remains inside an exemption or requires a Food Establishment Permit and additional facility controls. Get written classification before the operating workflow is locked.

### Fresh-produce labelling

CFIA guidance states that fresh produce sold intraprovincially remains subject to federal food and labelling law, with specific rules for consumer-prepackaged products. Net quantity, common name, language, responsible-party, origin, grade, and retail-packaging exemptions can depend on the exact packaging/sale method.

Source:
https://inspection.canada.ca/en/food-labels/labelling/industry/fresh-fruits-vegetables

**Implication:** "whole produce" is not the same thing as "no labelling obligations." The regulator fact pattern must describe exactly whether HarbourCart bags, weighs, labels, or simply transfers intact produce units.

### Measurement Canada — food sold by weight

Measurement Canada states that scales used to sell food by weight must be:

- approved by Measurement Canada;
- certified;
- inspected every five years.

The scale must be installed and operated correctly, and packaging/tare weight must not be charged to the customer.

Source:
https://ised-isde.canada.ca/site/measurement-canada/en/consumers/buying-measured-goods/buying-and-selling-food-weight

**Product implication:** HarbourCart should prefer fixed-count whole produce and intact supplier/manufacturer-sealed packs during the first real-money pilot. A HarbourCart-prepared weighed household share remains blocked until the provincial handling classification and legal-for-trade measurement process are both resolved.

This is separate from CFIA labelling and separate from Nova Scotia's food-establishment classification.

### Halifax Regional Food Hub

The current Hub handbook describes:

- aggregation;
- dry, cold, and frozen storage;
- online ordering/payment processing;
- order fulfilment;
- last-mile delivery;
- a weekly order cycle;
- a **23% markup** on producer-set prices.

Sources:
https://www.halifaxfoodhub.ca/sell-with-us
https://www.halifaxfoodhub.ca/_files/ugd/355c8a_728f4057e0d3492a984bf34df169e2b5.pdf

The handbook says membership eligibility may include wholesale buyers, retailers, institutions, food-service operators, community groups, and individuals supporting the mission.

**Not yet confirmed:** whether a consumer buying club like HarbourCart can buy through the Hub on the terms required for the pilot, the applicable buyer minimums, current buyer pricing, delivery/pickup terms, payment terms, or an authorized product feed.

### Statistics Canada food-price benchmark

Table 18-10-0245-02 provides monthly average retail prices for selected foods, with province/population-centre geography and retailer transaction data.

Source:
https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024502

Release visible in the current research pass: **2026-09-02**, covering data through July 2026.

**Product rule:** this monthly source is an authoritative baseline, but is not sufficient by itself for a live weekly "you save" claim. A current Halifax store/flyer comparator must also be checked.

### Payment processing

Current Stripe Canada standard pricing used in the working model:

- domestic cards: **2.9% + CA$0.30** per successful transaction;
- Canadian pre-authorized debit: **1% + CA$0.40**, capped at CA$5, with additional instant-verification/failure/dispute fees where applicable.

Source:
https://stripe.com/en-ca/pricing

These fees are model inputs, not negotiated HarbourCart pricing.

### Open Food Network Canada

Open Food Network publicly supports hubs/buying groups and can provide commodity back-office workflows while HarbourCart develops its own demand aggregation and evidence engine.

Source:
https://about.openfoodnetwork.ca/sell-local/software-pricing/

This is a potential pilot implementation path, not a committed vendor decision.

## Public structural screens represented in the prototype

Observed from public Wholesale Club pages on **2026-09-28**. These are **not Halifax supplier quotes** and availability/prices can change with pickup/delivery context.

| Candidate | Public smaller/loose price | Public case/large price | Research use |
| --- | ---: | ---: | --- |
| Roma tomatoes | $6.61/kg | $3.08/kg case-equivalent | Strong quote target |
| Broccoli crowns | $8.82/kg | $3.75/kg case-equivalent | Strong quote target |
| Broccoli heads | $5.00 each | $2.89 each case-equivalent | Whole-unit quote target |
| Green cabbage | $3.28/kg | $1.91/kg case-equivalent | Quote target; weekly promo check important |
| Royal Gala apples | $6.61/kg | $3.63/kg case-equivalent | Orchard quote target |
| English cucumber | $1.75 each | $17.99/12 = ~$1.50 each | Negative/thin control |
| Green beans | $11.00/kg | $5.01/kg case-equivalent | Quote target; shrink risk |
| Jasmine rice | $19/8 kg | $40/18.1 kg | Negative/thin pantry control |

Public catalogue:
https://www.wholesaleclub.ca/

A current page also showed promotional prices such as a sale on 10 lb yellow onions. This reinforces the design requirement that weekly promotions can overturn a structural bulk advantage.

## Working economics assumptions

Current default model inputs:

- target minimum customer saving: **15%**;
- normal minimum variable contribution: **CA$5/order**;
- card fee: **2.9% + CA$0.30**;
- labour: **4 minutes/order at CA$17/hour**;
- packaging: **CA$0.75/order**;
- shrink: **1% of procurement cost**;
- candidate-specific inbound freight allocation.

Fixed expenses such as insurance, pickup-site cost, vehicle/transport overhead, software, accounting, administration, and spoilage variance above the model are not yet included in the publication gate.

## External evidence gates

### 1. Regulatory classification

Obtain written answers for:

- whether the exact phase-1 workflow requires a Food Establishment Permit;
- opening master cartons while retaining inner manufacturer-sealed packs;
- sorting whole produce into household orders;
- bagging/weighing loose produce;
- required labels for any HarbourCart-packed produce;
- pickup-site sanitation/storage requirements;
- the classification of a recurring weekly pickup;
- future dry-good repacking, if ever considered.

### 2. Sale-by-weight measurement

For any HarbourCart-prepared product whose sale quantity is determined by weight, confirm the legal-for-trade scale process before publication. Keep count-based whole items and intact sealed supplier packs separate from weighed-household-share candidates.

### 3. Halifax Food Hub buyer eligibility

Confirm:

- whether HarbourCart can purchase as a buying club / retailer / community group;
- buyer membership or account requirements;
- order minimums;
- buyer-facing markup/fees;
- pickup/delivery options;
- payment terms;
- catalogue export/API/integration options;
- whether producer-direct quotes can be negotiated for committed volume.

### 4. Real supplier quotes

For each target product, capture:

- supplier legal/display name;
- exact SKU/grade/variety;
- case/pack size;
- minimum order;
- prices at roughly 50 / 100 / 250-household demand;
- delivery/pickup terms and charges;
- quote validity;
- substitutions/shortage rules;
- source/provenance.

### 5. Current Halifax retail comparator

Capture:

- exact or genuinely comparable item;
- retailer and store/geography;
- package/unit;
- regular or promotional price;
- promotion limit where applicable;
- observed timestamp;
- URL/screenshot/source evidence;
- confidence/comparability notes.

### 6. Fixed operating costs

Before real-money checkout, price:

- general/product liability insurance;
- pickup site;
- transport/vehicle;
- software;
- accounting/bookkeeping;
- staffing/admin;
- packaging supplies;
- spoilage/shortage variance.

## Claim snapshot

A future customer-facing savings claim must preserve at least:

\`\`\`text
supplier_offer_id
supplier_offer_observed_at
supplier_offer_valid_until
benchmark_id
benchmark_observed_at
benchmark_geography
benchmark_promo_flag
customer_price
procurement_cost
payment_cost
labour_cost
packaging_cost
shrink_cost
freight_cost
landed_variable_cost
saving_amount
saving_percent
contribution
calculated_at
handling_eligibility_version
measurement_eligibility_version
sale_basis
\`\`\`

If the supplier offer, retail comparator, or handling eligibility becomes stale or invalid, the claim must be recalculated or withdrawn.
