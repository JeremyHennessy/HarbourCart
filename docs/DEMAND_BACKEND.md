# HarbourCart shared pilot-demand backend

Status: **interface/data contract ready; remote provider not yet selected**

The current public prototype stores demand in browser localStorage. That is suitable only for single-browser UX testing. It cannot support a real 50-household validation because one household cannot see another household's response.

## Pilot requirement

Before public recruitment, HarbourCart needs a shared anonymous demand store.

Minimum record:

```text
session_id
product_id
joined
maximum_price
pickup_preference
created_at
updated_at
```

The client should not collect a name, email, phone number, address, or payment method for the fake-money demand pilot unless a later study requires it.

## Identity

Use a random anonymous pilot session ID stored on the device.

The backend must enforce one current intent per:

`session_id + product_id`

Repeated submissions update the household's current intent instead of inflating the household count.

The domain aggregation logic lives in:

- `src/domain/demand.ts`
- `src/domain/demand.test.ts`

## Minimum API contract

### Submit/update intent

`POST /pilot-demand`

Example:

```json
{
  "session_id": "random-client-id",
  "product_id": "russet-potatoes",
  "joined": true,
  "maximum_price": 7.5,
  "pickup_preference": "Saturday morning",
  "updated_at": "2026-09-29T00:00:00Z"
}
```

### Read public aggregate

`GET /pilot-demand/aggregate`

Return only aggregates suitable for public display:

```json
[
  {
    "product_id": "russet-potatoes",
    "interested_households": 18,
    "median_maximum_price": 7.75
  }
]
```

Do not return raw session IDs publicly.

## Abuse controls

Before exposing the endpoint:

- rate limit by IP / anonymous session;
- validate product IDs against the pilot catalogue;
- validate price bounds;
- reject arbitrary extra fields;
- use CORS only for approved HarbourCart origins;
- never accept supplier/admin fields through the public endpoint;
- retain timestamps for audit;
- provide a way to invalidate obvious spam.

## Deployment constraint

GitHub Pages cannot safely hold a database credential or privileged write token. The shared-demand API therefore requires a small external serverless/database endpoint.

Do **not** place a privileged Neon/Supabase/Postgres connection string in the browser bundle.

## Acceptance before recruitment

- 50 distinct test sessions can submit concurrently;
- duplicate submissions from one session do not inflate counts;
- opt-out removes that session from the aggregate;
- aggregate response contains no raw session IDs;
- invalid product/price payloads are rejected;
- the public UI clearly distinguishes actual collected demand from research scenarios;
- outage falls back to an explicit unavailable state rather than fake counts.
