export type WeeklyCostInputs = {
  pickupHourlyRate: number;
  pickupHours: number;
  transportKm: number;
  transportRatePerKm: number;
  softwareWeeklyCost: number;
  insuranceWeeklyCost?: number;
  adminWeeklyCost?: number;
  otherWeeklyCost?: number;
};

export type WeeklyCostBreakdown = {
  pickupSite: number;
  transport: number;
  software: number;
  insurance: number;
  admin: number;
  other: number;
  total: number;
};

export function weeklyFixedCosts(
  input: WeeklyCostInputs,
): WeeklyCostBreakdown {
  const values = [
    input.pickupHourlyRate,
    input.pickupHours,
    input.transportKm,
    input.transportRatePerKm,
    input.softwareWeeklyCost,
    input.insuranceWeeklyCost ?? 0,
    input.adminWeeklyCost ?? 0,
    input.otherWeeklyCost ?? 0,
  ];

  if (values.some((value) => value < 0 || !Number.isFinite(value))) {
    throw new Error("Weekly cost inputs must be finite and non-negative.");
  }

  const pickupSite = input.pickupHourlyRate * input.pickupHours;
  const transport = input.transportKm * input.transportRatePerKm;
  const software = input.softwareWeeklyCost;
  const insurance = input.insuranceWeeklyCost ?? 0;
  const admin = input.adminWeeklyCost ?? 0;
  const other = input.otherWeeklyCost ?? 0;

  return {
    pickupSite,
    transport,
    software,
    insurance,
    admin,
    other,
    total: pickupSite + transport + software + insurance + admin + other,
  };
}

export function breakEvenHouseholds(
  fixedWeeklyCost: number,
  variableContributionPerHousehold: number,
): number {
  if (fixedWeeklyCost < 0) {
    throw new Error("Fixed weekly cost must not be negative.");
  }
  if (variableContributionPerHousehold <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.ceil(fixedWeeklyCost / variableContributionPerHousehold);
}

export function weeklyOperatingContribution(
  households: number,
  variableContributionPerHousehold: number,
  fixedWeeklyCost: number,
  customerRevenuePerHousehold = 0,
  platformRateOfSales = 0,
): number {
  if (households < 0 || fixedWeeklyCost < 0 || customerRevenuePerHousehold < 0) {
    throw new Error("Households, fixed cost, and customer revenue must be non-negative.");
  }
  if (platformRateOfSales < 0 || platformRateOfSales >= 1) {
    throw new Error("Platform rate must be between 0 and 1.");
  }

  const contribution = households * variableContributionPerHousehold;
  const platformCost =
    households * customerRevenuePerHousehold * platformRateOfSales;

  return contribution - fixedWeeklyCost - platformCost;
}

export function fixedCostPerHousehold(
  fixedWeeklyCost: number,
  households: number,
): number {
  if (fixedWeeklyCost < 0) {
    throw new Error("Fixed weekly cost must not be negative.");
  }
  if (households <= 0) {
    throw new Error("Households must be greater than zero.");
  }
  return fixedWeeklyCost / households;
}
