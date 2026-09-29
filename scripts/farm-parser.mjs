const BLOCK_TAGS = /<\/(?:p|div|li|section|article|h[1-6]|tr|td|th|ul|ol)>/gi;
const BREAK_TAGS = /<(?:br|hr)\b[^>]*>/gi;

const REGION_NAMES = [
  "Bay of Fundy & Annapolis Valley",
  "Cape Breton",
  "Eastern Shore",
  "Halifax Metro",
  "Northumberland Shore",
  "South Shore",
  "Yarmouth & Acadian Shores",
];

const MARKET_REGIONS = [
  "Annapolis Valley & Digby Area",
  "Cape Breton Island",
  "Fundy & North Shore",
  "Halifax Metro",
  "South Shore",
  "South West Nova",
];

const ROLE_LINES = new Map([
  ["farm", "FARM"],
  ["producer", "PRODUCER"],
  ["supplier", "SUPPLIER"],
  ["wholesaler", "WHOLESALER"],
  ["processor", "PROCESSOR"],
  ["manufacturer", "MANUFACTURER"],
  ["retail location", "RETAILER"],
  ["online shop", "ONLINE_SHOP"],
  ["delivery", "DELIVERY"],
]);

const FIELD_LABELS = [
  "Address:",
  "Contact:",
  "Phone:",
  "Fax:",
  "Email:",
  "Website:",
  "Hours:",
  "Region:",
  "Products:",
  "Where to Buy:",
  "Attributes:",
  "Social Media",
];

function decodeNumericEntity(match, body) {
  const base = body[0]?.toLowerCase() === "x" ? 16 : 10;
  const value = Number.parseInt(base === 16 ? body.slice(1) : body, base);
  return Number.isFinite(value) ? String.fromCodePoint(value) : match;
}

export function decodeHtmlEntities(value = "") {
  return String(value)
    .replace(/&#(x?[0-9a-f]+);/gi, decodeNumericEntity)
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&rsquo;/gi, "’")
    .replace(/&ldquo;|&rdquo;/gi, '"');
}

export function htmlToText(html = "") {
  return decodeHtmlEntities(
    String(html)
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--([\s\S]*?)-->/g, " ")
      .replace(BREAK_TAGS, "\n")
      .replace(BLOCK_TAGS, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function linesFromHtml(html = "") {
  return htmlToText(html)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function normalizeBusinessName(value = "") {
  return decodeHtmlEntities(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(
      /\b(?:incorporated|inc|limited|ltd|corporation|corp|company|co|cooperative|co operative)\b/g,
      " ",
    )
    .replace(/\bthe\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(value = "") {
  return normalizeBusinessName(value).replace(/\s+/g, "-") || "unknown";
}

export function parseCsv(csv = "") {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(decodeHtmlEntities(href), baseUrl).toString();
  } catch {
    return undefined;
  }
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
}

function extractLabelValue(lines, label) {
  const index = lines.findIndex(
    (line) => line.toLowerCase() === label.toLowerCase(),
  );
  if (index < 0) return undefined;

  const values = [];
  for (let i = index + 1; i < lines.length; i += 1) {
    if (
      FIELD_LABELS.some(
        (candidate) => candidate.toLowerCase() === lines[i].toLowerCase(),
      )
    ) {
      break;
    }
    values.push(lines[i]);
  }
  return values.length ? values.join(" ").trim() : undefined;
}

function extractInlineField(text, label) {
  const labels = FIELD_LABELS.map(escapeRegex).join("|");
  const regex = new RegExp(
    escapeRegex(label) + "\\s*([^\\n]+?)(?=\\n(?:" + labels + ")|$)",
    "i",
  );
  return text.match(regex)?.[1]?.trim();
}

function parseProductList(raw = "") {
  return raw
    .split(/\s{2,}|\s*[,;|]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function firstPhone(text = "") {
  return text.match(
    /(?:\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}(?:\s*(?:ext\.?|x)\s*\d+)?/i,
  )?.[0];
}

function firstEmail(text = "") {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function firstExternalWebsite(segment = "", sourceHost) {
  const links = [...segment.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => decodeHtmlEntities(match[1]))
    .filter((href) => /^https?:\/\//i.test(href));

  return links.find((href) => {
    try {
      return new URL(href).hostname !== sourceHost;
    } catch {
      return false;
    }
  });
}

function extractRoles(lines, businessName) {
  const nameIndex = lines.findIndex(
    (line) => normalizeBusinessName(line) === normalizeBusinessName(businessName),
  );
  const addressIndex = lines.findIndex(
    (line, index) => index > nameIndex && line.toLowerCase() === "address:",
  );
  const end =
    addressIndex > nameIndex
      ? addressIndex
      : Math.min(lines.length, Math.max(0, nameIndex) + 12);
  const roles = [];

  for (const line of lines.slice(Math.max(0, nameIndex + 1), end)) {
    const normalized = line.toLowerCase().trim();
    if (ROLE_LINES.has(normalized)) roles.push(ROLE_LINES.get(normalized));
  }
  return unique(roles);
}

function regionMatches(text = "") {
  return REGION_NAMES.filter((region) =>
    text.toLowerCase().includes(region.toLowerCase()),
  );
}

function looksLikeAddress(line = "") {
  return /\b(?:NS|Nova Scotia|Road|Rd\.?|Street|St\.?|Highway|Hwy|Lane|Ln\.?|Avenue|Ave\.?|Route|Drive|Dr\.?)\b/i.test(
    line,
  );
}

export function parseBuyLocalSearchPage(html, pageUrl) {
  const matches = [
    ...String(html).matchAll(
      /<a\b[^>]*href=["']([^"']*\/business\/[^"'?#]+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    ),
  ];

  const records = [];
  const seen = new Set();

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const href = absoluteUrl(current[1], pageUrl);
    const name = htmlToText(current[2]).replace(/^Image:\s*/i, "").trim();
    if (!href || !name || seen.has(href)) continue;

    const nextIndex = matches[i + 1]?.index ?? html.length;
    const segment = html.slice(current.index, nextIndex);
    const lines = linesFromHtml(segment);
    const text = lines.join("\n");
    const productsText =
      extractLabelValue(lines, "Products:") ??
      extractInlineField(text, "Products:");
    const regions = regionMatches(text);
    const phone = firstPhone(text);

    const nameLine = lines.findIndex(
      (line) => normalizeBusinessName(line) === normalizeBusinessName(name),
    );
    const address = lines
      .slice(nameLine + 1, nameLine + 5)
      .find(
        (line) =>
          !regions.includes(line) &&
          !firstPhone(line) &&
          line.toLowerCase() !== "products:" &&
          !/^image:/i.test(line) &&
          looksLikeAddress(line),
      );

    seen.add(href);
    records.push({
      name,
      detailUrl: href,
      address,
      phone,
      regions,
      products: parseProductList(productsText),
    });
  }

  return records;
}

export function parseBuyLocalDetail(html, detailUrl, fallback = {}) {
  const lines = linesFromHtml(html);
  const text = lines.join("\n");
  const headings = [
    ...String(html).matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi),
  ]
    .map((match) => htmlToText(match[1]))
    .filter(Boolean);

  const name =
    headings.find(
      (heading) =>
        !/buy local|search local|contact|where to buy|products/i.test(heading),
    ) ??
    fallback.name ??
    "Unknown";

  const roles = extractRoles(lines, name);
  const products = parseProductList(
    extractLabelValue(lines, "Products:") ??
      extractInlineField(text, "Products:") ??
      fallback.products?.join(", ") ??
      "",
  );
  const attributes = parseProductList(
    extractLabelValue(lines, "Attributes:") ??
      extractInlineField(text, "Attributes:") ??
      "",
  );
  const whereToBuy = parseProductList(
    extractLabelValue(lines, "Where to Buy:") ??
      extractInlineField(text, "Where to Buy:") ??
      "",
  );

  return {
    name,
    detailUrl,
    roles,
    address:
      extractLabelValue(lines, "Address:") ??
      extractInlineField(text, "Address:") ??
      fallback.address,
    phone:
      extractLabelValue(lines, "Phone:") ??
      extractInlineField(text, "Phone:") ??
      fallback.phone ??
      firstPhone(text),
    email:
      extractLabelValue(lines, "Email:") ??
      extractInlineField(text, "Email:") ??
      firstEmail(text),
    website:
      extractLabelValue(lines, "Website:") ??
      extractInlineField(text, "Website:") ??
      firstExternalWebsite(html, new URL(detailUrl).hostname),
    regions: unique([...regionMatches(text), ...(fallback.regions ?? [])]),
    products,
    attributes,
    whereToBuy,
    delivery:
      roles.includes("DELIVERY") ||
      /\bdelivery\b/i.test(
        extractLabelValue(lines, "Where to Buy:") ?? "",
      ),
    onlineShop: roles.includes("ONLINE_SHOP"),
  };
}

const FOOD_HUB_NOISE = new Set([
  "meet our producers",
  "get in touch.",
  "halifax regional food hub",
]);

export function parseFoodHubProducerNames(html) {
  const lines = linesFromHtml(html);
  const start = lines.findIndex((line) => /meet our producers/i.test(line));
  const end = lines.findIndex(
    (line, index) => index > start && /^get in touch\.?$/i.test(line),
  );
  const body = lines.slice(
    start >= 0 ? start + 1 : 0,
    end > start ? end : lines.length,
  );

  return unique(
    body
      .filter((line) => {
        const normalized = line.toLowerCase().trim();
        if (!normalized || FOOD_HUB_NOISE.has(normalized)) return false;
        if (
          /^(home|about|board|producers|chefs|wholesale|services|media|newsletter|contact us|visit our store)$/i.test(
            line,
          )
        ) {
          return false;
        }
        if (/^image$/i.test(line)) return false;
        if (line.length > 80) return false;
        if (
          /\b(?:902|@|copyright|territory|treaty|williams ave)\b/i.test(line)
        ) {
          return false;
        }
        return /[a-z]/i.test(line) && !/[.!?]$/.test(line);
      })
      .map((line) => line.replace(/\s+/g, " ").trim()),
  );
}

function extractHeadingsWithSegments(html) {
  const matches = [
    ...String(html).matchAll(
      /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    ),
  ];

  return matches.map((match, index) => ({
    level: Number(match[1]),
    text: htmlToText(match[2]),
    index: match.index,
    segment: html.slice(match.index, matches[index + 1]?.index ?? html.length),
  }));
}

export function parseAcornPage(html, pageUrl) {
  const records = [];

  for (const heading of extractHeadingsWithSegments(html)) {
    const name = heading.text.trim();
    if (!name || /search results|organic producers|search by/i.test(name)) {
      continue;
    }

    const text = htmlToText(heading.segment);
    const locationMatch = text.match(
      /(?:^|\n)([^\n,]{1,70}),\s*(NS|Nova Scotia)(?:\n|$)/i,
    );
    if (!locationMatch) continue;

    const location = locationMatch[1].trim() + ", NS";
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const locationIndex = lines.findIndex((line) =>
      line.toLowerCase().includes(location.toLowerCase()),
    );
    const summary = lines
      .slice(1, locationIndex >= 0 ? locationIndex : 4)
      .filter((line) => !/^acorn member$/i.test(line))
      .join(" ")
      .trim();

    records.push({
      name,
      location,
      summary: summary || undefined,
      phone: firstPhone(text),
      email: firstEmail(text),
      website: firstExternalWebsite(
        heading.segment,
        new URL(pageUrl).hostname,
      ),
      member: /\bACORN Member\b/i.test(text),
      sourceUrl: pageUrl,
    });
  }

  return records;
}

export function extractIframeUrls(html, baseUrl) {
  return unique(
    [...String(html).matchAll(/<iframe\b[^>]*src=["']([^"']+)["']/gi)]
      .map((match) => absoluteUrl(match[1], baseUrl))
      .filter(Boolean),
  );
}

export function parseGenericNamedDirectory(html, sourceUrl) {
  const records = [];
  for (const heading of extractHeadingsWithSegments(html)) {
    if (heading.level > 4) continue;
    const name = heading.text.trim();
    if (
      !name ||
      /directory|search|community supported|nova scotia federation|find a farm|our farms/i.test(
        name,
      )
    ) {
      continue;
    }

    const text = htmlToText(heading.segment);
    if (text.length < 10 || text.length > 2500) continue;
    if (
      !/\b(?:farm|farmstead|acres|gardens|growers|orchard|produce|csa)\b/i.test(
        name + " " + text,
      )
    ) {
      continue;
    }

    records.push({
      name,
      location: text.match(
        /(?:^|\n)([^\n]{1,100},\s*(?:NS|Nova Scotia))(?:\n|$)/i,
      )?.[1],
      website: firstExternalWebsite(
        heading.segment,
        new URL(sourceUrl).hostname,
      ),
      phone: firstPhone(text),
      email: firstEmail(text),
      sourceUrl,
    });
  }
  return records;
}

export function parseFmnsMarkets(html, sourceUrl) {
  const markets = [];
  let currentRegion;

  for (const heading of extractHeadingsWithSegments(html)) {
    const matchingRegion = MARKET_REGIONS.find(
      (region) => region.toLowerCase() === heading.text.toLowerCase(),
    );
    if (matchingRegion) {
      currentRegion = matchingRegion;
      continue;
    }

    if (!/\bmarket\b/i.test(heading.text)) continue;
    if (/find a farmers|list of markets|market map/i.test(heading.text)) {
      continue;
    }

    const text = htmlToText(heading.segment);
    const schedule = text
      .split("\n")
      .map((line) => line.trim())
      .find((line) =>
        /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|year.?round|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(
          line,
        ),
      );

    markets.push({
      name: heading.text.trim(),
      region: currentRegion,
      schedule,
      sourceUrl,
    });
  }

  return markets;
}

export function parseFmnsSeasonality(html) {
  const seasons = {};

  for (const heading of extractHeadingsWithSegments(html)) {
    const match = heading.text.match(/^(Winter|Spring|Summer|Fall|Always)\b/i);
    if (!match) continue;

    const key = match[1].toUpperCase();
    const lines = htmlToText(heading.segment)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const productLine = lines.find((line) => line.includes(","));
    if (!productLine) continue;

    seasons[key] = productLine
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return seasons;
}

export function parseAgricultureFundingCsv(csv) {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];

  const header = rows[0].map((value) => value.trim().toLowerCase());
  const recipientIndex = header.findIndex((value) =>
    /recipient|applicant|business|farm|organization/.test(value),
  );
  const amountIndex = header.findIndex((value) => /amount/.test(value));
  const yearIndex = header.findIndex((value) => /year|fiscal/.test(value));
  const programIndex = header.findIndex((value) => /program/.test(value));

  if (recipientIndex < 0) return [];

  return rows
    .slice(1)
    .map((row) => ({
      recipient: row[recipientIndex]?.trim(),
      amount:
        amountIndex >= 0 && row[amountIndex]
          ? Number(String(row[amountIndex]).replace(/[$,]/g, ""))
          : undefined,
      year: yearIndex >= 0 ? row[yearIndex]?.trim() : undefined,
      program: programIndex >= 0 ? row[programIndex]?.trim() : undefined,
    }))
    .filter((row) => row.recipient);
}

export function currentNovaScotiaSeason(date = new Date()) {
  const month = date.getUTCMonth() + 1;
  if ([12, 1, 2].includes(month)) return "WINTER";
  if ([3, 4, 5].includes(month)) return "SPRING";
  if ([6, 7, 8].includes(month)) return "SUMMER";
  return "FALL";
}

export function productTokens(values = []) {
  return unique(
    values
      .flatMap((value) =>
        String(value)
          .toLowerCase()
          .split(/[,;/|]+|\band\b/)
          .map((item) => item.trim()),
      )
      .filter(Boolean),
  );
}

export function hasAnyTerm(values = [], terms = []) {
  const haystack = productTokens(values).join(" ");
  return terms.some((term) =>
    haystack.includes(String(term).toLowerCase()),
  );
}

export function looksFarmLike(name = "", config = {}) {
  const normalized = normalizeBusinessName(name);
  return (config.farmNameTerms ?? []).some((term) =>
    normalized.includes(normalizeBusinessName(term)),
  );
}

export function fundingRecipientLooksAgricultural(name = "") {
  return /\b(?:farm|farms|farmstead|garden|gardens|grower|growers|orchard|orchards|dairy|acres|produce|berry|berries|apiary|greenhouse|nursery|ranch|cattle)\b/i.test(
    name,
  );
}
