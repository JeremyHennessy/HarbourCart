import { describe, expect, it } from "vitest";
import { parseProduct } from "./retail-parser.mjs";

describe("retailer text parser", () => {
  it("parses Atlantic Superstore each pricing", () => {
    const parsed = parseProduct(
      "English Cucumber 1 ea, $1.50/1ea sale: $1.50, formerly: $2.00 SAVE $0.50",
      {
        canonicalUnit: "ea",
        aliases: ["English Cucumber"],
      },
    );

    expect(parsed?.normalizedPrice).toBe(1.5);
    expect(parsed?.promo).toBe(true);
    expect(parsed?.formerPrice).toBe(2);
  });

  it("parses Atlantic Superstore per-kilogram pricing", () => {
    const parsed = parseProduct(
      "Roma Tomatoes $4.41/1kg $2.00/1lb sale: about $0.53",
      {
        canonicalUnit: "kg",
        aliases: ["Roma Tomatoes"],
      },
    );

    expect(parsed?.normalizedPrice).toBe(4.41);
    expect(parsed?.normalizedUnit).toBe("kg");
  });

  it("parses a bag price expressed per 100 g", () => {
    const parsed = parseProduct(
      "Yellow Onions, 3 lb Bag 1.36 kg, $0.15/100g sale: $2.00, formerly: $3.50",
      {
        canonicalUnit: "kg",
        aliases: ["Yellow Onions"],
      },
    );

    expect(parsed?.normalizedPrice).toBeCloseTo(1.5, 5);
  });

  it("parses Sobeys each pricing", () => {
    const parsed = parseProduct(
      "English Cucumber Seedless 1 Count $2.49 1 EA ($2.49 per EA)",
      {
        canonicalUnit: "ea",
        aliases: ["English Cucumber Seedless"],
      },
    );

    expect(parsed?.normalizedPrice).toBe(2.49);
  });

  it("parses Sobeys per-100g package normalization", () => {
    const parsed = parseProduct(
      "Compliments Oranges 1.36 kg $7.99 1360 G ($0.59 per 100g)",
      {
        canonicalUnit: "kg",
        aliases: ["Compliments Oranges"],
      },
    );

    expect(parsed?.normalizedPrice).toBeCloseTo(5.9, 5);
  });
});
