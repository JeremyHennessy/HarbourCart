# HarbourCart shared pilot-demand backend

Status: **deployed to a dedicated HarbourCart Supabase project; frontend integration in progress**

Project:
- Supabase project: `HarbourCart`
- project ref: `ryctzudgyldtjphkzkff`
- region: `ca-central-1`
- Edge Function: `pilot-demand`

No database secret, service-role key, or privileged connection string is shipped to the browser.

## Pilot data

The fake-money pilot stores only:

```text
anonymous session UUID
product_id
joined / opt-out state
maximum_price
pickup_preference
created_at
updated_at
```

It does **not** require a name, email, phone number, street address, account, or payment method.

## Identity and deduplication

Each browser creates one random UUIDv4 and stores it locally.

The database primary key is:

`session_id + product_id`

Repeated submissions from one browser therefore update that household's current intent rather than inflating the household count.

## Database model

Tables:
- `pilot_products` — active product allowlist and price bounds
- `pilot_demand_intents` — anonymous current intent by session/product
- `pilot_demand_rate_limits` — per-session rolling request limit

All tables have RLS enabled and direct `anon` / `authenticated` table access revoked.

The public browser does **not** call Postgres directly. The Edge Function performs validated server-side RPC calls using the Supabase secret key available only inside the hosted function.

## API

Endpoint:

`https://ryctzudgyldtjphkzkff.supabase.co/functions/v1/pilot-demand`

### Read aggregate

`GET /functions/v1/pilot-demand`

Returns only aggregate values:

```json
{
  "data": [
    {
      "product_id": "russet-potatoes",
      "interested_households": 18,
      "median_maximum_price": 7.75,
      "updated_at": "2026-09-29T00:00:00Z"
    }
  ]
}
```

Raw session IDs are never returned by the public aggregate endpoint.

### Submit/update intent

`POST /functions/v1/pilot-demand`

```json
{
  "session_id": "8d3ef6d8-ea10-4cc1-a33e-32675b0b46a4",
  "product_id": "russet-potatoes",
  "joined": true,
  "maximum_price": 7.5,
  "pickup_preference": "saturday-morning"
}
```

Allowed pickup preferences:
- `weekday-evening`
- `saturday-morning`
- `saturday-afternoon`
- `sunday-morning`
- `flexible`

## Validation / abuse controls

The deployed function currently:

- accepts browser CORS only from the HarbourCart GitHub Pages origin and local-development origins;
- requires UUIDv4 anonymous session IDs;
- rejects unknown request fields;
- validates product IDs against an active database allowlist;
- enforces per-product price bounds;
- validates pickup-preference values;
- enforces a per-session hourly request limit;
- never accepts supplier/admin fields through the public endpoint;
- returns only public-safe aggregate demand;
- fails explicitly rather than falling back to simulated household counts.

This is appropriate for a small fake-money pilot. Before a much larger public launch, add stronger bot/rate controls and monitoring.

## Database test

The deployed database functions were exercised with a test UUID:
- submit joined intent;
- aggregate;
- opt out;
- aggregate returns zero interested households.

The test row remains opted out and therefore does not affect pilot counts.

## Security review

Supabase security advisors now report only informational notices that RLS-enabled tables have no direct policies. This is intentional: direct public table access is revoked, and the public browser uses the validated Edge Function.

The prior anonymous `SECURITY DEFINER` warnings were removed by revoking direct anonymous/authenticated execution. Performance advisors are currently clear.

## Frontend contract

The HarbourCart client:
- stores only its random anonymous session ID and its own local selections;
- reads shared aggregate counts from the Edge Function;
- sends price-specific intent to the Edge Function;
- shows actual shared totals, not research-scenario counts;
- keeps procurement's 50 / 100 / 250 household scenarios separate from actual consumer demand.

## Acceptance before recruitment

Remaining acceptance items:

- production UI integration builds and deploys;
- duplicate/opt-out behaviour is verified through the live app;
- outage state is verified;
- 50 distinct test sessions can submit without count inflation;
- public aggregate exposes no session IDs;
- input validation and session rate limiting remain enforced.

No real checkout or payment collection should be added during this fake-money validation phase.
