import { describe, expect, it } from "vitest";
import { currentRetailSignals } from "./retailSignals";

describe("current retail research signals", () => {
  it("never promotes regional/public observations to a local publication benchmark", () => {
    for (const signal of currentRetailSignals) {
      expect(["NOVA_SCOTIA_FLYER", "ATLANTIC_SUPERSTORE_PUBLIC_CATALOGUE"]).toContain(
        signal.scope,
      );
      expect(signal.normalizationStatus).not.toBe("READY");
    }
  });

  it("requires unit detail before normalizing ambiguous flyer extractions", () => {
    const ambiguous = currentRetailSignals.filter(
      (signal) => signal.normalizationStatus === "UNIT_REQUIRED",
    );
    expect(ambiguous.length).toBeGreaterThan(0);
    for (const signal of ambiguous) {
      expect(signal.quantity).toBeUndefined();
      expect(signal.unit).toBeUndefined();
    }
  });
});
