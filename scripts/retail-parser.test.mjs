import { describe, expect, it } from "vitest";
import { parseProduct } from "./retail-parser.mjs";

describe("retailer text parser", () => {
  it("parses Atlantic Superstore each pricing", () => {
    const parsed = parseProduct(
      "sale: $1.50, formerly: $2.00 SAVE $0.50 English Cucumber 1 ea, $1.50/1ea Add English Cucumber to cart",
      {
        canonicalUnit: "ea",
        aliases: ["English Cucumber"],
      },
    );

    expect(parsed?.normalizedPrice).toBe(1.5);
    expect(parsed?.promo).toBe(true);
    expect(parsed?.formerPrice).toBe(2);
  });

  it("does not borrow the preceding product price", () => {
    const text =
      "sale: $1.50, formerly: $2.00 SAVE $0.50 English Cucumber 1 ea, $1.50/1ea Add English Cucumber to cart " +
      "$2.50 Broccoli Crown 1 ea, $2.50/1ea Add Broccoli Crown to cart " +
      "$1.99 Green Onion 1 ea, $1.99/1ea Add Green Onion to cart";

    const parsed = parseProduct(text, {
      canonicalUnit: "ea",
      aliases: ["Broccoli Crown"],
    });

    expect(parsed?.normalizedPrice).toBe(2.5);
  });

  it("parses Atlantic Superstore per-kilogram pricing", () => {
    const parsed = parseProduct(
      "sale: about $0.53, formerly: $0.79 SAVE $0.26 Roma Tomatoes $4.41/1kg $2.00/1lb Add Roma Tomatoes to cart",
      {
        canonicalUnit: "kg",
        aliases: ["Roma Tomatoes"],
      },
    );

    expect(parsed?.normalizedPrice).toBe(4.41);
    expect(parsed?.normalizedUnit).toBe("kg");
  });

  it("parses a bag price expressed per 100 g without borrowing nearby produce prices", () => {
    const text =
      "Roma Tomatoes $4.41/1kg $2.00/1lb Add Roma Tomatoes to cart " +
      "sale: $2.00, formerly: $3.25 SAVE $1.25 Farmer's Market Yellow Onions, 3 lb Bag 1.36 kg, $0.15/100g Add Yellow Onions, 3 lb Bag to cart " +
      "$4.00 Cauliflower 1 ea, $4.00/1ea Add Cauliflower to cart";

    const parsed = parseProduct(text, {
      canonicalUnit: "kg",
      aliases: ["Yellow Onions, 3 lb Bag", "Yellow Onions"],
    });

    expect(parsed?.normalizedPrice).toBeCloseTo(1.5, 5);
    expect(parsed?.formerPrice).toBeUndefined();
  });

  it("normalizes a Russet potato bag from its own unit price", () => {
    const text =
      "Yellow Potato, 10 lb Bag 4.536 kg, $0.15/100g Add Yellow Potato, 10 lb Bag to cart " +
      "$6.00 President's Choice Russet Potatoes, 5 lb Bag 2.268 kg, $0.26/100g Add Russet Potatoes, 5 lb Bag to cart " +
      "$7.00 President's Choice Yellow Potatoes, 5 lb Bag 2.268 kg, $0.31/100g Add Yellow Potatoes, 5 lb Bag to cart";

    const parsed = parseProduct(text, {
      canonicalUnit: "kg",
      aliases: ["Russet Potatoes"],
    });

    expect(parsed?.normalizedPrice).toBeCloseTo(2.6, 5);
  });

  it("uses a specific Gala Apples alias instead of matching apple juice", () => {
    const text =
      "sale: $4.00 MIN 2, formerly: $5.29 Royal Gala Apple Juice 2 l, $0.26/100ml Add Apple Juice to cart " +
      "Royal Gala Apples $6.61/1kg $3.00/1lb Add Royal Gala Apples to cart " +
      "$9.00 Farmer's Market Ambrosia Apples 1.814 kg, $0.50/100g Add Ambrosia Apples to cart";

    const parsed = parseProduct(text, {
      canonicalUnit: "kg",
      aliases: ["Royal Gala Apples", "Gala Apples"],
    });

    expect(parsed?.normalizedPrice).toBe(6.61);
  });

  it("parses Sobeys each pricing", () => {
    const parsed = parseProduct(
      "English Cucumber Seedless 1 Count $2.49 1 EA ($2.49 per EA) Add English Cucumber Seedless to cart",
      {
        canonicalUnit: "ea",
        aliases: ["English Cucumber Seedless"],
      },
    );

    expect(parsed?.normalizedPrice).toBe(2.49);
  });

  it("parses Sobeys per-100g package normalization", () => {
    const parsed = parseProduct(
      "Compliments Oranges 1.36 kg $7.99 1360 G ($0.59 per 100g) Add Compliments Oranges to cart",
      {
        canonicalUnit: "kg",
        aliases: ["Compliments Oranges"],
      },
    );

    expect(parsed?.normalizedPrice).toBeCloseTo(5.9, 5);
  });
});
