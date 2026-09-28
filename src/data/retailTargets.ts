export const retailStores = {
  atlanticBarrington: {
    retailer: "ATLANTIC_SUPERSTORE",
    retailerLabel: "Atlantic Superstore",
    storeId: "0369",
    storeName: "Barrington Street",
    storeAddress: "1075 Barrington St, Halifax, NS B3H 2P8",
    storeUrl:
      "https://www.atlanticsuperstore.ca/store-locator/details/0369",
    bootstrapUrl:
      "https://www.atlanticsuperstore.ca/en?pc-express-book=0369&redirect=true",
  },
  atlanticQuinpool: {
    retailer: "ATLANTIC_SUPERSTORE",
    retailerLabel: "Atlantic Superstore",
    storeId: "0383",
    storeName: "Quinpool Road",
    storeAddress: "6139 Quinpool Rd, Halifax, NS B3L 0B9",
    storeUrl:
      "https://www.atlanticsuperstore.ca/store-locator/details/0383",
    bootstrapUrl:
      "https://www.atlanticsuperstore.ca/en?pc-express-book=0383&redirect=true",
  },
  sobeysQueen: {
    retailer: "SOBEYS",
    retailerLabel: "Sobeys",
    storeId: "0574",
    storeName: "Queen Street",
    storeAddress: "1120 Queen Street, Halifax, NS B3H 2R9",
    storeUrl: "https://www.sobeys.com/stores/sobeys-queen-street?f=715",
    bootstrapUrl:
      "https://www.sobeys.com/flyer?set_preferred_store_number=0574",
  },
} as const;

export const retailProductTargets = [
  {
    productId: "english-cucumber",
    productName: "English Cucumber",
    canonicalUnit: "ea",
    atlanticAliases: ["English Cucumber"],
    sobeysAliases: ["English Cucumber Seedless"],
    sobeysUrl:
      "https://www.sobeys.com/products/english-cucumber-seedless-1-count",
  },
  {
    productId: "broccoli-heads",
    productName: "Broccoli Crown",
    canonicalUnit: "ea",
    atlanticAliases: ["Broccoli Crown"],
    sobeysAliases: ["Broccoli Crown", "Broccoli Crowns"],
  },
  {
    productId: "roma-tomatoes",
    productName: "Roma Tomatoes",
    canonicalUnit: "kg",
    atlanticAliases: ["Roma Tomatoes"],
    sobeysAliases: ["Tomatoes Roma", "Roma Tomatoes"],
    sobeysUrl:
      "https://www.sobeys.com/products/tomatoes-roma-11%252E34-kg",
  },
  {
    productId: "green-cabbage",
    productName: "Green Cabbage",
    canonicalUnit: "kg",
    atlanticAliases: ["Cabbage, Green", "Green Cabbage"],
    sobeysAliases: ["Green Cabbage"],
    sobeysUrl: "https://www.sobeys.com/products/green-cabbage-1-count",
  },
  {
    productId: "yellow-onions",
    productName: "Yellow Onions",
    canonicalUnit: "kg",
    atlanticAliases: ["Yellow Onions, 3 lb Bag", "Yellow Onions"],
    sobeysAliases: ["Yellow Onions"],
    sobeysUrl:
      "https://www.sobeys.com/products/yellow-onions-2%252E27-kg",
  },
  {
    productId: "russet-potatoes",
    productName: "Russet Potatoes",
    canonicalUnit: "kg",
    atlanticAliases: ["Russet Potatoes"],
    sobeysAliases: ["Russet Potatoes"],
    sobeysUrl:
      "https://www.sobeys.com/products/russet-potatoes-2%252E27-kg",
  },
  {
    productId: "gala-apples",
    productName: "Royal Gala Apples",
    canonicalUnit: "kg",
    atlanticAliases: ["Royal Gala Apples", "Gala Apples"],
    sobeysAliases: ["Royal Gala Apples", "Gala Apples"],
  },
] as const;
