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
    signal: AbortSignal.timeout(15_000),
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


async function fetchJson(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "user-agent": USER_AGENT,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

function findFlyerItems(json) {
  for (const key of ["flyer_items", "items", "ecom_items"]) {
    if (Array.isArray(json?.[key])) return json[key];
  }
  for (const value of Object.values(json ?? {})) {
    if (
      Array.isArray(value) &&
      value.some(
        (item) => item && typeof item === "object" && "name" in item,
      )
    ) {
      return value;
    }
  }
  return [];
}

function activeMerchantFlyers(json, merchantPattern) {
  const flyers = Array.isArray(json) ? json : json?.flyers ?? [];
  const matcher = new RegExp(merchantPattern, "i");
  const now = Date.now();

  return flyers.filter((flyer) => {
    const merchant = flyer.merchant_name || flyer.merchant || "";
    const validFrom = flyer.valid_from
      ? Date.parse(flyer.valid_from)
      : -Infinity;
    const validTo = flyer.valid_to ? Date.parse(flyer.valid_to) : Infinity;
    return matcher.test(merchant) && validFrom <= now && now <= validTo;
  });
}

function flippItemMatchesProduct(item, product) {
  const name = String(item?.name ?? "").toLowerCase();
  return product.aliases.some((alias) =>
    name.includes(alias.toLowerCase()),
  );
}

function numericFlippPrice(item) {
  const raw =
    item?.current_price ??
    (item?.price !== "" && item?.price != null ? item.price : undefined);
  const price = Number(raw);
  return Number.isFinite(price) && price > 0 ? price : undefined;
}

function normalizeFlippItem(item, product) {
  const price = numericFlippPrice(item);
  if (!price) return undefined;

  const text = [
    item?.name,
    item?.sale_story,
    item?.pre_price_text,
    item?.post_price_text,
  ]
    .filter(Boolean)
    .join(" ");

  if (product.canonicalUnit === "ea") {
    return {
      price,
      quantity: 1,
      unit: "ea",
      normalizedPrice: price,
      normalizedUnit: "ea",
    };
  }

  const kgPackage = text.match(/([0-9]+(?:\.[0-9]+)?)\s*kg\b/i);
  if (kgPackage) {
    const kilograms = Number(kgPackage[1]);
    if (kilograms > 0) {
      return {
        price,
        quantity: kilograms,
        unit: "kg",
        normalizedPrice: price / kilograms,
        normalizedUnit: "kg",
      };
    }
  }

  const gramPackage = text.match(/([0-9]+(?:\.[0-9]+)?)\s*g\b/i);
  if (gramPackage) {
    const grams = Number(gramPackage[1]);
    if (grams >= 100) {
      const kilograms = grams / 1000;
      return {
        price,
        quantity: kilograms,
        unit: "kg",
        normalizedPrice: price / kilograms,
        normalizedUnit: "kg",
      };
    }
  }

  const lbPackage = text.match(/([0-9]+(?:\.[0-9]+)?)\s*lb\b/i);
  if (lbPackage) {
    const pounds = Number(lbPackage[1]);
    if (pounds > 0) {
      const kilograms = pounds * 0.45359237;
      return {
        price,
        quantity: kilograms,
        unit: "kg",
        normalizedPrice: price / kilograms,
        normalizedUnit: "kg",
      };
    }
  }

  if (/\bper\s*lb\b|\/\s*lb\b/i.test(text)) {
    return {
      price,
      quantity: 1,
      unit: "kg",
      normalizedPrice: price / 0.45359237,
      normalizedUnit: "kg",
    };
  }

  if (/\bper\s*kg\b|\/\s*kg\b/i.test(text)) {
    return {
      price,
      quantity: 1,
      unit: "kg",
      normalizedPrice: price,
      normalizedUnit: "kg",
    };
  }

  return undefined;
}

async function captureFlippFallback(store, alreadyCapturedProductIds) {
  const fallback = store.flyerFallback;
  if (!fallback || fallback.provider !== "FLIPP") {
    return { prices: [], errors: [] };
  }

  const errors = [];
  const prices = [];
  const base = "https://backflipp.wishabi.com/flipp";
  const locale = fallback.locale || "en-ca";
  const postalCode = fallback.postalCode;
  const flyerListUrl =
    `${base}/flyers?locale=${encodeURIComponent(locale)}&postal_code=${encodeURIComponent(postalCode)}`;

  try {
    const flyerList = await fetchJson(flyerListUrl);
    const flyers = activeMerchantFlyers(
      flyerList,
      fallback.merchantPattern,
    );

    if (flyers.length === 0) {
      errors.push(
        `Flipp fallback: no active flyer matched ${fallback.merchantPattern} for ${postalCode}`,
      );
    }

    for (const flyer of flyers) {
      const flyerId = flyer.id || flyer.flyer_id;
      if (!flyerId) continue;

      const detailUrl =
        `${base}/flyers/${flyerId}?locale=${encodeURIComponent(locale)}&postal_code=${encodeURIComponent(postalCode)}`;
      const detail = await fetchJson(detailUrl);

      for (const product of config.products) {
        if (alreadyCapturedProductIds.has(product.productId)) continue;

        const candidates = findFlyerItems(detail)
          .filter((item) => flippItemMatchesProduct(item, product))
          .map((item) => ({
            item,
            normalized: normalizeFlippItem(item, product),
          }))
          .filter((candidate) => candidate.normalized)
          .sort(
            (a, b) =>
              a.normalized.normalizedPrice -
              b.normalized.normalizedPrice,
          );

        const best = candidates[0];
        if (!best) continue;

        const observedAt = new Date().toISOString();
        prices.push({
          id:
            `${store.retailer.toLowerCase()}-flyer-${flyerId}-${product.productId}`,
          retailer: store.retailer,
          retailerLabel: store.retailerLabel,
          storeId: store.storeId,
          storeName: store.storeName,
          storeAddress: store.storeAddress,
          scope: "HALIFAX_FLYER",
          status: "CURRENT",
          productId: product.productId,
          productName: product.productName,
          ...best.normalized,
          promo: true,
          observedAt,
          ...(flyer.valid_from ? { validFrom: flyer.valid_from } : {}),
          ...(flyer.valid_to ? { validTo: flyer.valid_to } : {}),
          sourceUrl: detailUrl,
          sourceLabel:
            `${store.retailerLabel} weekly flyer syndicated by Flipp/Wishabi for postal code ${postalCode}`,
          note: [
            best.item.name,
            best.item.sale_story,
            best.item.pre_price_text,
            best.item.post_price_text,
          ]
            .filter(Boolean)
            .join(" "),
        });
        alreadyCapturedProductIds.add(product.productId);
      }
    }
    if (flyers.length > 0 && prices.length === 0) {
      errors.push(
        `Flipp fallback: matched ${flyers.length} active flyer(s) but no configured target product had a safely normalizable price`,
      );
    }
  } catch (error) {
    errors.push(`Flipp fallback: ${error.message}`);
  }

  return { prices, errors };
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

    const localVerified =
      Boolean(store.storeIdentityVerified) && sessionLooksLocal;
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

  const capturedProductIds = new Set(
    prices.map((price) => price.productId),
  );
  const flyerFallback = await captureFlippFallback(
    store,
    capturedProductIds,
  );
  prices.push(...flyerFallback.prices);
  errors.push(...flyerFallback.errors);

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
