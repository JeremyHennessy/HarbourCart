# HarbourCart — Nova Scotia local-support programs

Research pass: **2026-09-28**

HarbourCart must keep three different things separate:

1. a retailer/farm's cash selling price;
2. a government-funded or loyalty incentive available to the consumer;
3. a grant/rebate paid to a producer or business.

They are not interchangeable in the savings calculation.

## 1. Nova Scotia Loyal CSA Incentive Pilot — 10% consumer discount

The Province launched a 2026 Community Supported Agriculture incentive under Nova Scotia Loyal. Participating farms give customers a **10% discount** on qualifying farm-share subscriptions and are reimbursed through the program.

Current consumer page:
https://nsloyal.ca/en/consumer-rewards/

Province announcement:
https://news.novascotia.ca/en/2026/01/08/nova-scotia-loyal-supports-buying-direct-local-farmers

### HarbourCart relevance

Potentially valuable if a participating farm sells a qualifying CSA/farm-share product through or alongside HarbourCart.

**Do not assume ordinary weekly HarbourCart group buys qualify.** The current program is framed around approved CSA/farm-share relationships.

## 2. Nova Scotia Loyal online farmers' market incentive — 10% off

The current Nova Scotia Loyal consumer-rewards page offers **10% off online orders** through participating farmers' market partners using promo code `NSLOYAL10`.

Current listed partners include:

- Cape Breton Food Hub;
- Wolfville Farmers' Market 2GO;
- Antigonish Farmers' Market.

Source:
https://nsloyal.ca/en/consumer-rewards/

### HarbourCart relevance

This is the closest existing program to HarbourCart's model.

HarbourCart should ask Nova Scotia Loyal whether a Halifax online buying club / multi-producer marketplace can become a participating partner or whether partnership through an existing eligible market/hub is required.

Until confirmed, the app must show this as **partner-only**, not as a HarbourCart discount.

## 3. Nova Scotia Loyal retailer partnership

Nova Scotia Loyal currently allows businesses to apply as retailers. Its retailer application asks whether the retail business operates **physical, online, or both**, whether it is registered with the Nova Scotia Registry of Joint Stock Companies, and which Nova Scotia products/suppliers it sells.

Retailer application:
https://portal.nsloyal.ca/retailers/register

Program home:
https://nsloyal.ca/en

### Important eligibility ambiguity

The general Nova Scotia Loyal site also describes retailer eligibility using language about a permanent business location in Nova Scotia, while the live retailer application explicitly supports an **online** retail business.

Therefore HarbourCart should request written confirmation of online-only / pickup-based eligibility rather than assuming qualification.

## 4. Sobeys / Scene+ Nova Scotia Loyal local-product promotions

The Province has partnered with Sobeys on Nova Scotia Loyal consumer loyalty rewards for eligible local products. Government material describes Scene+ promotions tied to local products at Sobeys and related banners.

Government source:
https://news.novascotia.ca/en/2025/03/06/more-retailers-join-nova-scotia-loyal

Sobeys Scene+ offers change over time and by member/store.

### HarbourCart benchmark rule

Store:

- cash shelf/flyer price;
- Scene+ value;
- Nova Scotia Loyal value;

as separate fields.

Do not subtract Scene+ value from Sobeys' comparison price unless the exact offer applies to the comparison transaction and the household eligibility assumptions are explicit.

## 5. Farmers' Market Voucher Program — $10

For 2026, eligible students and newcomers receive **$10 farmers' market vouchers** that can be used at participating Farmers' Markets of Nova Scotia locations. The Province says 2026 vouchers are valid through **December 31, 2026**.

Source:
https://news.novascotia.ca/en/2026/05/14/nova-scotia-loyal-farmers-market-voucher-program-returns-2026

### HarbourCart relevance

Not a general HarbourCart subsidy. It becomes relevant only if HarbourCart operates through an eligible participating farmers' market relationship.

## 6. Producer Labelling Program — 70% up to $3,000

The 2026-27 Nova Scotia Loyal Producer Labelling Program provides registered eligible **producers** with reimbursement of **70% of eligible labelling costs up to a $3,000 lifetime maximum**. The current application period runs to **March 15, 2027 at 2:00 PM AST**, subject to budget availability.

Source:
https://investnovascotia.ca/incentives-programs-services/nova-scotia-loyal-producer-labelling-program

### HarbourCart relevance

This appears useful to qualifying HarbourCart suppliers/producers, not automatically to HarbourCart as a retailer.

It could help farms create consumer-ready packs that HarbourCart can transfer intact, which is operationally attractive because it can reduce HarbourCart repacking and measurement complexity.

## 7. Other funding

Some Nova Scotia food-security and agriculture programs support farms, non-profits, community organizations, food safety, equipment, or food access. Eligibility is program-specific.

Examples include the Local Food Security Initiatives program and producer/farm programs. HarbourCart should not build its economics around a grant unless its actual legal entity and project are confirmed eligible.

## Product-design rule

Every incentive in HarbourCart should carry:

```text
program_id
program_name
provider
benefit_type
benefit_value
eligibility_status
eligibility_basis
valid_from
valid_until
source_url
observed_at
applies_to_supplier
applies_to_customer
applies_to_harbourcart
```

Customer-facing prices should display:

**HarbourCart cash price**
+ **confirmed applicable incentive**
= **effective customer cost**

rather than hiding a subsidy inside the base price.
