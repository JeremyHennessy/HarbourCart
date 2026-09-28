import { describe, expect, it } from "vitest";
import { operatingAssumptions, operatingScenarios } from "./operations";

describe("operations research assumptions", () => {
  it("never invents an insurance cost", () => {
    const insurance = operatingAssumptions.find(
      (item) => item.id === "insurance",
    );
    expect(insurance?.value).toBeNull();
    expect(insurance?.evidence).toBe("QUOTE_REQUIRED");
  });

  it("keeps modeled route distances distinct from authoritative evidence", () => {
    for (const id of ["transport-local-model", "transport-direct-model"]) {
      const assumption = operatingAssumptions.find((item) => item.id === id);
      expect(assumption?.evidence).toBe("MODEL_ASSUMPTION");
    }
  });

  it("has unique scenario ids", () => {
    expect(new Set(operatingScenarios.map((item) => item.id)).size).toBe(
      operatingScenarios.length,
    );
  });
});
