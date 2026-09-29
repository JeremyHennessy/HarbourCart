#!/usr/bin/env node

const endpoint =
  process.env.HARBOURCART_PILOT_DEMAND_URL ??
  "https://ryctzudgyldtjphkzkff.supabase.co/functions/v1/pilot-demand";
const origin = "https://jeremyhennessy.github.io";
const productId = "russet-potatoes";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(method, body, requestOrigin = origin) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      Origin: requestOrigin,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(
      method + " returned non-JSON " + response.status + ": " + text.slice(0, 200),
    );
  }

  return { response, payload };
}

function productAggregate(payload) {
  const rows = payload?.data;
  assert(Array.isArray(rows), "Aggregate response did not contain data array.");
  const row = rows.find((item) => item?.product_id === productId);
  assert(row, "Aggregate response did not include " + productId + ".");
  return {
    households: Number(row.interested_households) || 0,
    median:
      row.median_maximum_price == null
        ? undefined
        : Number(row.median_maximum_price),
  };
}

const sessionId = crypto.randomUUID();

const before = await request("GET");
assert(before.response.ok, "Initial aggregate GET failed.");
assert(
  before.response.headers.get("access-control-allow-origin") === origin,
  "Production origin was not returned in CORS header.",
);
const initial = productAggregate(before.payload);

const join = await request("POST", {
  session_id: sessionId,
  product_id: productId,
  joined: true,
  maximum_price: 7.77,
  pickup_preference: "flexible",
});
assert(join.response.ok, "Join POST failed: " + JSON.stringify(join.payload));

const afterJoin = productAggregate((await request("GET")).payload);
assert(
  afterJoin.households === initial.households + 1,
  "Join should increment household count by one. Before=" +
    initial.households +
    " after=" +
    afterJoin.households,
);

const update = await request("POST", {
  session_id: sessionId,
  product_id: productId,
  joined: true,
  maximum_price: 8.25,
  pickup_preference: "saturday-morning",
});
assert(update.response.ok, "Update POST failed: " + JSON.stringify(update.payload));

const afterUpdate = productAggregate((await request("GET")).payload);
assert(
  afterUpdate.households === afterJoin.households,
  "Updating the same session inflated household count.",
);

const remove = await request("POST", {
  session_id: sessionId,
  product_id: productId,
  joined: false,
  maximum_price: 8.25,
  pickup_preference: "saturday-morning",
});
assert(remove.response.ok, "Opt-out POST failed: " + JSON.stringify(remove.payload));

const afterRemove = productAggregate((await request("GET")).payload);
assert(
  afterRemove.households === initial.households,
  "Opt-out did not return household count to baseline.",
);

const extraField = await request("POST", {
  session_id: crypto.randomUUID(),
  product_id: productId,
  joined: true,
  maximum_price: 7.5,
  unexpected_admin_field: true,
});
assert(
  extraField.response.status === 400 &&
    extraField.payload?.error === "unexpected_field",
  "Unexpected fields were not rejected.",
);

const badOrigin = await request(
  "POST",
  {
    session_id: crypto.randomUUID(),
    product_id: productId,
    joined: true,
    maximum_price: 7.5,
  },
  "https://example.com",
);
assert(
  badOrigin.response.status === 403 &&
    badOrigin.payload?.error === "origin_not_allowed",
  "Disallowed browser origin was not rejected.",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      productId,
      baselineHouseholds: initial.households,
      joinedHouseholds: afterJoin.households,
      updatedHouseholds: afterUpdate.households,
      finalHouseholds: afterRemove.households,
      corsOrigin: before.response.headers.get("access-control-allow-origin"),
      inputValidation: "passed",
      originValidation: "passed",
    },
    null,
    2,
  ),
);
