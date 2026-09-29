import { describe, expect, it } from "vitest";
import {
  currentNovaScotiaSeason,
  normalizeBusinessName,
  parseAcornPage,
  parseAgricultureFundingCsv,
  parseBuyLocalDetail,
  parseBuyLocalSearchPage,
  parseFmnsMarkets,
  parseFoodHubProducerNames,
} from "./farm-parser.mjs";

describe("farm directory parser", () => {
  it("parses Buy Local search cards", () => {
    const html = [
      '<a href="/business/abundant-acres"><h2>Abundant Acres</h2></a>',
      "<div>182 Red Bank Rd., Centre Burlington, NS</div>",
      "<div>Bay of Fundy & Annapolis Valley</div>",
      "<div>(902) 757-1640</div>",
      "<div>Products:</div>",
      "<div>Fruit</div><div>Vegetables</div>",
      '<a href="/business/apple-lane-farm"><h2>Apple Lane Farm</h2></a>',
      "<div>54 Prospect Rd. Berwick, NS</div>",
      "<div>Bay of Fundy & Annapolis Valley</div>",
      "<div>Products:</div><div>Fruit</div>",
    ].join("");

    const rows = parseBuyLocalSearchPage(
      html,
      "https://buylocal.novascotia.ca/business-search?page=0",
    );

    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Abundant Acres");
    expect(rows[0].detailUrl).toContain("/business/abundant-acres");
    expect(rows[0].regions).toContain("Bay of Fundy & Annapolis Valley");
    expect(rows[1].name).toBe("Apple Lane Farm");
  });

  it("parses Buy Local detail roles and public business contacts", () => {
    const html = [
      "<h2>Small Holdings Farm</h2>",
      "<div>Farm</div>",
      "<div>Supplier</div>",
      "<div>Address:</div>",
      "<div>1999 Millsville Road Scotsburn, NS B0K 1R0</div>",
      "<div>Phone:</div><div>902-830-4113</div>",
      "<div>Email:</div><div>hello@example.ca</div>",
      "<div>Website:</div><div>https://example.ca/</div>",
      "<div>Region:</div><div>Northumberland Shore</div>",
      "<div>Products:</div><div>Vegetables</div>",
      "<div>Where to Buy:</div><div>New Glasgow Farmers Market</div>",
    ].join("");

    const row = parseBuyLocalDetail(
      html,
      "https://buylocal.novascotia.ca/business/small-holdings-farm",
    );

    expect(row.roles).toContain("FARM");
    expect(row.roles).toContain("SUPPLIER");
    expect(row.products).toContain("Vegetables");
    expect(row.whereToBuy.join(" ")).toContain("New Glasgow Farmers Market");
  });

  it("extracts Food Hub producer names and discards footer text", () => {
    const html = [
      "<nav><div>Home</div><div>About</div></nav>",
      "<h2>Meet Our Producers</h2>",
      "<div>Abundant Acres</div>",
      "<div>Apple Lane Farm</div>",
      "<div>Good Clean Farm</div>",
      "<h2>Get in touch.</h2>",
      "<div>Halifax Regional Food Hub</div>",
      "<div>902-943-6282</div>",
    ].join("");

    expect(parseFoodHubProducerNames(html)).toEqual([
      "Abundant Acres",
      "Apple Lane Farm",
      "Good Clean Farm",
    ]);
  });

  it("parses Nova Scotia ACORN entries and filters non-NS records", () => {
    const html = [
      "<h2>Medford Farms Limited</h2>",
      "<h5>Canning, NS</h5>",
      "<div>Vegetable producer</div>",
      "<div>902-582-7836</div>",
      "<h2>Crystal Green Farms</h2>",
      "<h5>Bedeque, PE</h5>",
      "<div>Vegetables and grains</div>",
    ].join("");

    const rows = parseAcornPage(
      html,
      "https://acornorganic.org/resources/organicdirectory/results/P120",
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Medford Farms Limited");
    expect(rows[0].location).toBe("Canning, NS");
  });

  it("parses market names and region context", () => {
    const html = [
      "<h3>Halifax Metro</h3>",
      "<h4>Alderney Landing Farmers' Market</h4>",
      "<p>Saturdays, Year-Round</p>",
      "<h4>Halifax Seaport Farmers' Market</h4>",
      "<p>Saturdays & Sundays, Year-Round</p>",
      "<h3>South Shore</h3>",
      "<h4>Lunenburg Farmers' Market</h4>",
      "<p>Thursdays, Year-Round</p>",
    ].join("");
    const markets = parseFmnsMarkets(
      html,
      "https://farmersmarketsnovascotia.ca/find-a-market-new/",
    );

    expect(markets).toHaveLength(3);
    expect(markets[0].region).toBe("Halifax Metro");
    expect(markets[2].region).toBe("South Shore");
  });

  it("parses recipient, amount and year from agriculture funding CSV", () => {
    const csv = [
      "Recipient,Amount,Year,Program",
      '"Sawler Gardens Ltd","1,623.75","2018-2019","Small Farm Acceleration"',
      '"Stirling Fruit Farms (2000) Ltd","8100","2018-2019","Other"',
    ].join("\n");
    const rows = parseAgricultureFundingCsv(csv);

    expect(rows[0].recipient).toBe("Sawler Gardens Ltd");
    expect(rows[0].amount).toBe(1623.75);
    expect(rows[1].recipient).toContain("Stirling Fruit Farms");
  });

  it("normalizes legal suffixes but preserves farm identity", () => {
    expect(normalizeBusinessName("TapRoot Farms Inc.")).toBe("taproot farms");
    expect(normalizeBusinessName("The Four Seasons Farm Ltd.")).toBe(
      "four seasons farm",
    );
  });

  it("uses September as Nova Scotia fall", () => {
    expect(currentNovaScotiaSeason(new Date("2026-09-29T00:00:00Z"))).toBe(
      "FALL",
    );
  });
});
