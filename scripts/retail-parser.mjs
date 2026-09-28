export function decodeEntities(text) {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

export function htmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function findProductContext(text, aliases) {
  const lower = text.toLowerCase();
  const orderedAliases = [...aliases].sort((a, b) => b.length - a.length);

  for (const alias of orderedAliases) {
    const index = lower.indexOf(alias.toLowerCase());
    if (index < 0) continue;

    const addIndex = lower.indexOf(" add ", index);
    const toCartIndex =
      addIndex >= 0 ? lower.indexOf(" to cart", addIndex) : -1;
    const end =
      toCartIndex >= 0
        ? Math.min(text.length, toCartIndex + " to cart".length)
        : Math.min(text.length, index + 260);

    const previousCart = lower.lastIndexOf(" to cart", index);
    const contextStart =
      previousCart >= 0
        ? previousCart + " to cart".length
        : Math.max(0, index - 140);

    return {
      alias,
      priceText: text.slice(index, end),
      contextText: text.slice(contextStart, end),
    };
  }

  return undefined;
}

// Kept as a compatibility helper for callers/tests that only need the
// product-anchored price text.
export function findWindow(text, aliases) {
  return findProductContext(text, aliases)?.priceText;
}

export function parseEa(windowText) {
  const perEach =
    windowText.match(/\$([0-9]+(?:\.[0-9]{1,2})?)\s*\/\s*1\s*ea/i) ??
    windowText.match(/\$([0-9]+(?:\.[0-9]{1,2})?)\s+1\s*EA\b/i) ??
    windowText.match(
      /\$([0-9]+(?:\.[0-9]{1,2})?).{0,60}\(\$([0-9]+(?:\.[0-9]{1,2})?)\s+per\s+EA\)/i,
    );

  if (!perEach) return undefined;
  const price = Number(perEach[2] ?? perEach[1]);
  if (!Number.isFinite(price) || price <= 0) return undefined;

  return {
    price,
    quantity: 1,
    unit: "ea",
    normalizedPrice: price,
    normalizedUnit: "ea",
  };
}

export function parseKg(windowText) {
  const direct =
    windowText.match(/\$([0-9]+(?:\.[0-9]{1,2})?)\s*\/\s*1\s*kg/i) ??
    windowText.match(/\$([0-9]+(?:\.[0-9]{1,2})?)\s*\/\s*kg/i);

  if (direct) {
    const price = Number(direct[1]);
    if (Number.isFinite(price) && price > 0) {
      return {
        price,
        quantity: 1,
        unit: "kg",
        normalizedPrice: price,
        normalizedUnit: "kg",
      };
    }
  }

  const per100g = windowText.match(
    /\$([0-9]+(?:\.[0-9]{1,2})?)\s*(?:\/|per)\s*100\s*g/i,
  );
  if (per100g) {
    const perKg = Number(per100g[1]) * 10;
    if (Number.isFinite(perKg) && perKg > 0) {
      return {
        price: perKg,
        quantity: 1,
        unit: "kg",
        normalizedPrice: perKg,
        normalizedUnit: "kg",
      };
    }
  }

  const sobeysPer100g = windowText.match(
    /\(\$([0-9]+(?:\.[0-9]{1,2})?)\s+per\s+100g\)/i,
  );
  if (sobeysPer100g) {
    const perKg = Number(sobeysPer100g[1]) * 10;
    if (Number.isFinite(perKg) && perKg > 0) {
      return {
        price: perKg,
        quantity: 1,
        unit: "kg",
        normalizedPrice: perKg,
        normalizedUnit: "kg",
      };
    }
  }

  const priceThenKg = windowText.match(
    /\$([0-9]+(?:\.[0-9]{1,2})?).{0,80}?([0-9]+(?:\.[0-9]+)?)\s*kg\b/i,
  );
  if (priceThenKg) {
    const packagePrice = Number(priceThenKg[1]);
    const kilograms = Number(priceThenKg[2]);
    if (
      Number.isFinite(packagePrice) &&
      Number.isFinite(kilograms) &&
      packagePrice > 0 &&
      kilograms > 0
    ) {
      return {
        price: packagePrice,
        quantity: kilograms,
        unit: "kg",
        normalizedPrice: packagePrice / kilograms,
        normalizedUnit: "kg",
      };
    }
  }

  return undefined;
}

export function parseProduct(text, product) {
  const context = findProductContext(text, product.aliases);
  if (!context) return undefined;

  const parsed =
    product.canonicalUnit === "ea"
      ? parseEa(context.priceText)
      : parseKg(context.priceText);

  if (!parsed) return undefined;

  const former = context.contextText.match(
    /formerly:?\s*\$([0-9]+(?:\.[0-9]{1,2})?)/i,
  );
  const promo = /\bsale\b|\bSAVE\b|\bmember\b|\bdeal\b/i.test(
    context.contextText,
  );

  return {
    ...parsed,
    promo,
    formerPrice: former ? Number(former[1]) : undefined,
    rawEvidence: context.contextText.slice(0, 360),
  };
}
