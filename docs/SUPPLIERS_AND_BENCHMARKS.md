# Supplier and current-price research targets

Research pass: **2026-09-28**

This pass expands HarbourCart's validation work without pretending public web data is a commercial quote or a Halifax-local checkout benchmark.

## Priority supplier / channel targets

| Target | Why it matters | Contact | Evidence status |
| --- | --- | --- | --- |
| CTL Distributors | Greater-Halifax produce wholesaler; official site says 100+ fruit/vegetable/herb varieties and six-day delivery | ctl@ctldistributors.com · 902-876-6327 | Official wholesale lead |
| Abundant Acres | Official farm wholesale ordering with Halifax peninsula delivery / farm or Warehouse Market pickup | warehousemarket2867@gmail.com · 902-817-8344 | Official wholesale lead |
| Stirling Fruit Farms | Wholesale apples and other local/Maritime produce; CanadaGAP-certified | greatapples@stirlingfruitfarms.ca · 902-542-3763 | Official wholesale lead |
| Noggins Corner Farm | Buy Local NS lists it as a supplier; major apple/produce storage capacity | sales@nogginsfarm.ca · 902-542-5515 | Official supplier lead |
| Gouchers Farm & Market | Official site explicitly invites wholesale inquiries; grows potatoes, carrots, beans, cucumbers, squash, apples and more | admin@gfmarket.ca · 902-242-3422 | Official wholesale lead |
| Halifax Regional Food Hub | Existing local aggregation/storage/ordering/packing/delivery infrastructure | info@halifaxfoodhub.ca · 902-943-6282 | Channel; buyer terms unresolved |
| The Station Food Hub | Wholesale inquiry contact; secondary NS sourcing/processing/partnership channel | sales@thestationfoodhub.ca · 782-580-2126 | Channel |

Source URLs and observation dates are stored in \`src/data/suppliers.ts\`.

## Supplier outreach order

1. **CTL** — fastest test of broad commercial produce pricing delivered into HRM.
2. **Gouchers** — potatoes/onions/carrot-family and mixed Valley produce quote.
3. **Stirling + Noggins** — apple/orchard quote and storage-season economics.
4. **Abundant Acres** — local organic/seasonal farm-wholesale benchmark.
5. **Halifax Regional Food Hub** — multi-producer aggregation and buyer eligibility.
6. **Station Food Hub** — secondary channel / partnership test.

The quote request in \`docs/OUTREACH.md\` remains the authoritative required field list. A phone or web price without retained commercial terms does not become \`VERIFIED_QUOTE\`.

## Current retail-source finding

A current Nova Scotia Atlantic Superstore flyer is valid **September 24–30, 2026**. Public extracted items include:

- Farmer's Market yellow onions or carrots — $2;
- Roma tomatoes — $2;
- broccoli crowns — $2.50;
- English cucumber — $1.50.

However, aggregate flyer extraction does **not consistently preserve the unit or package quantity**. Therefore those numbers are stored only as current retail **signals**, not normalized benchmarks.

The public Atlantic Superstore catalogue also currently shows:

- Royal Gala apples at $6.61/kg;
- No Name Naturally Imperfect apples, 2.72 kg, on sale for $7;
- English cucumber at $1.50 each, formerly $2.

These are useful because they expose two comparator hazards:

1. a cheaper value pack can be a more honest comparator than premium loose produce;
2. a weekly promotion can erase an apparent wholesale/case advantage.

Neither the regional flyer nor an unspecified-store catalogue observation is treated as \`CURRENT_LOCAL\`. Before publication, HarbourCart still requires a Halifax-store-applicable observation with exact quantity/unit and evidence.

## Benchmark capture candidates

Current Halifax flyer directories identify active September 24–30 flyers for named Halifax Atlantic Superstore and Sobeys locations. These are useful navigation/evidence sources, but each item must be verified for local applicability because the directories themselves warn that a flyer may not apply to every local store.

Initial physical/digital reference locations:

- Atlantic Superstore — 1075 Barrington St, Halifax
- Atlantic Superstore — 6139 Quinpool Rd, Halifax
- Sobeys — 1120 Queen St, Halifax
- Sobeys — 2651 Windsor St, Halifax
- Sobeys — 6990 Mumford Rd, Halifax

For HarbourCart, the next benchmark ingestion step is **item-level capture**, not merely proving a current flyer exists.
