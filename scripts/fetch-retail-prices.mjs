import fs from "node:fs/promises";
import path from "node:path";
import { htmlToText, parseProduct } from "./retail-parser.mjs";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "config", "retail-live.json");
const OUTPUT_PATH = path.join(ROOT, "public", "data", "retail-live.json");
const USER_AGENT =
  "Mozilla/5.0 (compatible; HarbourCartPriceMonitor/0.1; +https://github.com/JeremyHennessy/HarbourCart)";

const config = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));

function cookiesFromHeaders(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .filter(Boolean);
  }
  const single = headers.get("set-cookie");
  return single ? [single.split(";")[0]] : [];
}

async function fetchText(url, cookieJar = new Map()) {
  const cookie = [...cookieJar.values()].join("; ");
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml",
      ...(cookie ? { cookie } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }

  for (const cookieValue of cookiesFromHeaders(response.headers)) {
    const name = cookieValue.split("=")[0];
    if (name) cookieJar.set(name, cookieValue);
  }

  return {
    url: response.url,
    html: await response.text(),
  };
}

function storeTextLooksLocal(text, store) {
  const normalized = text.toLowerCase();
  const addressParts = store.storeAddress
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 4);

  return (
    normalized.includes(store.storeId.toLowerCase()) ||
    addressParts.some((part) => normalized.includes(part)) ||
    normalized.includes(store.storeName.toLowerCase())
  );
}

async function captureStore(store) {
  const cookieJar = new Map();
  const errors = [];
  let storeValidated = false;
  let sessionLooksLocal = false;

  try {
    const storePage = await fetchText(store.storeUrl, cookieJar);
    storeValidated = storeTextLooksLocal(htmlToText(storePage.html), store);
  } catch (error) {
    errors.push(`store page: ${error.message}`);
  }

  try {
    const bootstrap = await fetchText(store.bootstrapUrl, cookieJar);
    const bootstrapText = htmlToText(bootstrap.html);
    sessionLooksLocal =
      storeTextLooksLocal(bootstrapText, store) ||
      bootstrap.url.includes(store.storeId) ||
      [...cookieJar.values()].some((value) => value.includes(store.storeId));
  } catch (error) {
    errors.push(`bootstrap: ${error.message}`);
  }

  const pageBodies = [];
  for (const url of store.pages) {
    try {
      const page = await fetchText(url, cookieJar);
      pageBodies.push({ url: page.url, text: htmlToText(page.html) });
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  const observedAt = new Date().toISOString();
  const prices = [];

  for (const product of config.products) {
    let best;

    for (const page of pageBodies) {
      const parsed = parseProduct(page.text, product);
      if (!parsed) continue;
      const candidate = { ...parsed, sourceUrl: page.url };
      if (!best || candidate.normalizedPrice < best.normalizedPrice) {
        best = candidate;
      }
    }

    if (!best) continue;

    const localVerified = storeValidated && sessionLooksLocal;
    prices.push({
      id: `${store.retailer.toLowerCase()}-${store.storeId}-${product.productId}`,
      retailer: store.retailer,
      retailerLabel: store.retailerLabel,
      storeId: store.storeId,
      storeName: store.storeName,
      storeAddress: store.storeAddress,
      scope: localVerified ? "HALIFAX_STORE" : "RETAILER_PUBLIC",
      status: localVerified ? "CURRENT" : "STORE_UNVERIFIED",
      productId: product.productId,
      productName: product.productName,
      price: best.price,
      quantity: best.quantity,
      unit: best.unit,
      normalizedPrice: best.normalizedPrice,
      normalizedUnit: best.normalizedUnit,
      promo: best.promo,
      ...(best.formerPrice ? { formerPrice: best.formerPrice } : {}),
      observedAt,
      sourceUrl: best.sourceUrl,
      sourceLabel: localVerified
        ? `${store.retailerLabel} public web price with Halifax store session evidence`
        : `${store.retailerLabel} public web price; Halifax store applicability not independently verified`,
      note: best.rawEvidence,
    });
  }

  return {
    store,
    storeValidated,
    sessionLooksLocal,
    prices,
    errors,
  };
}

async function readPrevious() {
  try {
    return JSON.parse(await fs.readFile(OUTPUT_PATH, "utf8"));
  } catch {
    return undefined;
  }
}

const previous = await readPrevious();
const results = [];
for (const store of config.stores) {
  results.push(await captureStore(store));
}

const freshPrices = results.flatMap((result) => result.prices);
const attemptErrors = results.flatMap((result) =>
  result.errors.map((message) => ({
    retailer: result.store.retailer,
    sourceUrl: result.store.bootstrapUrl,
    message,
  })),
);

const previousPrices = Array.isArray(previous?.prices) ? previous.prices : [];
const freshKeys = new Set(
  freshPrices.map((price) => `${price.retailer}|${price.storeId}|${price.productId}`),
);
const retained = previousPrices.filter(
  (price) =>
    !freshKeys.has(`${price.retailer}|${price.storeId}|${price.productId}`),
);

const now = new Date().toISOString();
const output = {
  schemaVersion: 1,
  generatedAt: now,
  lastAttemptAt: now,
  lastSuccessfulAt:
    freshPrices.length > 0 ? now : previous?.lastSuccessfulAt,
  prices: [...freshPrices, ...retained],
  errors: attemptErrors,
};

await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      stores: results.map((result) => ({
        retailer: result.store.retailer,
        store: result.store.storeName,
        storeValidated: result.storeValidated,
        sessionLooksLocal: result.sessionLooksLocal,
        pricesCaptured: result.prices.length,
        errors: result.errors,
      })),
      totalFreshPrices: freshPrices.length,
      retainedPreviousPrices: retained.length,
    },
    null,
    2,
  ),
);
